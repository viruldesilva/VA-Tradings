import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPayHereConfig } from "@/lib/payhere/config";
import { isValidNotifySignature } from "@/lib/payhere/hash";
import type { PaymentStatus } from "@/lib/types/database";

/**
 * POST /api/payhere/notify: PayHere's server-to-server payment notification
 * (application/x-www-form-urlencoded). We only trust it after verifying md5sig,
 * and only mark an order paid when the amount and currency match the order.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const field = (name: string) => {
    const value = form.get(name);
    return typeof value === "string" ? value : "";
  };

  const merchantId = field("merchant_id");
  const orderId = field("order_id");
  const payhereAmount = field("payhere_amount");
  const payhereCurrency = field("payhere_currency");
  const statusCode = field("status_code");
  const md5sig = field("md5sig");

  let config;
  try {
    config = getPayHereConfig();
  } catch {
    return NextResponse.json({ error: "PayHere not configured" }, { status: 503 });
  }

  const valid =
    merchantId === config.merchantId &&
    isValidNotifySignature({
      merchantId,
      merchantSecret: config.merchantSecret,
      orderId,
      payhereAmount,
      payhereCurrency,
      statusCode,
      md5sig,
    });
  if (!valid) {
    console.warn("[payhere/notify] invalid signature for order", orderId);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const orderNo = Number(orderId);
  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, total, payment_method, payment_status")
    .eq("order_no", orderNo)
    .maybeSingle();
  if (error) {
    console.error("[payhere/notify]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 }); // PayHere may retry
  }
  if (!order || order.payment_method !== "payhere") {
    return NextResponse.json({ error: "Unknown order" }, { status: 404 });
  }

  let next: PaymentStatus;
  if (statusCode === "2") {
    const amountMatches =
      payhereCurrency === "LKR" && Math.abs(Number(payhereAmount) - Number(order.total)) < 0.01;
    if (!amountMatches) {
      console.error("[payhere/notify] amount mismatch", { orderNo, payhereAmount, payhereCurrency, total: order.total });
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }
    next = "paid";
  } else if (statusCode === "0") {
    next = "pending";
  } else {
    next = "failed"; // -1 cancelled, -2 failed, -3 charged back
  }

  // Never let a late "pending" overwrite a confirmed payment.
  if (order.payment_status === "paid" && next === "pending") {
    return NextResponse.json({ ok: true });
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ payment_status: next })
    .eq("id", order.id);
  if (updateError) {
    console.error("[payhere/notify] update failed", updateError);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  console.info(`[payhere/notify] order ${orderNo}: status_code ${statusCode} → ${next} (payment ${field("payment_id")})`);
  return NextResponse.json({ ok: true });
}
