"use server";

import { priceCart, type CartQuote } from "@/lib/orders/pricing";
import { cartLinesSchema } from "@/lib/validation/checkout";

/** Current server-side prices and stock for the items in the browser cart. */
export async function quoteCart(lines: unknown): Promise<CartQuote | null> {
  const parsed = cartLinesSchema.safeParse(lines);
  if (!parsed.success) return null;
  try {
    return await priceCart(parsed.data);
  } catch (err) {
    console.error("[quoteCart]", err);
    return null;
  }
}
