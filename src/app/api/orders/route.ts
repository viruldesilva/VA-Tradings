import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders/create-order";
import { fieldErrors } from "@/lib/validation/form";
import { checkoutSchema } from "@/lib/validation/checkout";

/**
 * POST /api/orders: create an order.
 * Body: { customer_name, phone, address, city, notes?, payment_method, items: [{ productId, qty }] }
 * Prices and stock are always re-checked from the database.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: real customers never fill the hidden "website" field.
  if (body && typeof body === "object" && "website" in body && body.website) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your details.", fieldErrors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const result = await createOrder(parsed.data);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: "Some items in your cart are no longer available.",
          quote: result.quote,
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      {
        orderNo: result.orderNo,
        token: result.token,
        paymentMethod: parsed.data.payment_method,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json(
      { error: "We couldn't place your order. Please try again or contact us on WhatsApp." },
      { status: 500 },
    );
  }
}
