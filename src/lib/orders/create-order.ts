import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CheckoutInput } from "@/lib/validation/checkout";
import { priceCart, type CartQuote } from "./pricing";

export type CreateOrderResult =
  | { ok: true; orderId: string; orderNo: number; token: string; total: number }
  | { ok: false; reason: "unavailable"; quote: CartQuote };

/**
 * Creates an order with server-side prices, using the service-role client
 * (customers never write to the DB directly).
 */
export async function createOrder(input: CheckoutInput): Promise<CreateOrderResult> {
  const quote = await priceCart(input.items);
  if (!quote.orderable) return { ok: false, reason: "unavailable", quote };

  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customer_name,
      phone: input.phone,
      address: input.address,
      city: input.city,
      notes: input.notes,
      subtotal: quote.subtotal,
      delivery_fee: quote.deliveryFee,
      total: quote.total,
      payment_method: input.payment_method,
      payment_status: "pending",
      status: "new",
    })
    .select("id, order_no, public_token")
    .single();
  if (error) throw error;

  const supplierPrices = await getSupplierPrices(quote.lines.map((l) => l.productId));

  const { error: itemsError } = await supabase.from("order_items").insert(
    quote.lines.map((line) => ({
      order_id: order.id,
      product_id: line.productId,
      product_name: line.name,
      qty: line.qty,
      price: line.price,
      supplier_price: supplierPrices.get(line.productId) ?? null,
    })),
  );
  if (itemsError) {
    // Don't leave an order without items behind.
    await supabase.from("orders").delete().eq("id", order.id);
    throw itemsError;
  }

  return {
    ok: true,
    orderId: order.id,
    orderNo: order.order_no,
    token: order.public_token,
    total: quote.total,
  };
}

/** Snapshot of supplier costs, stored on each order item for profit reports. */
async function getSupplierPrices(productIds: string[]): Promise<Map<string, number>> {
  const { data, error } = await createAdminClient()
    .from("product_private")
    .select("product_id, supplier_price")
    .in("product_id", productIds);
  if (error) {
    console.error("[getSupplierPrices]", error.message); // non-fatal
    return new Map();
  }
  return new Map(
    data
      .filter((r) => r.supplier_price !== null)
      .map((r) => [r.product_id, Number(r.supplier_price)]),
  );
}
