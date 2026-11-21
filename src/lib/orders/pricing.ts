import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CartLineInput } from "@/lib/validation/checkout";

export type PricedLine = {
  productId: string;
  name: string;
  slug: string | null;
  image: string | null;
  qty: number;
  /** Current price from the database. */
  price: number;
  lineTotal: number;
  available: boolean;
  problem?: "not_found" | "out_of_stock";
};

export type CartQuote = {
  lines: PricedLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  /** True when every line can be ordered. */
  orderable: boolean;
};

/** Merges duplicate product lines and caps each at the max quantity. */
function mergeLines(lines: CartLineInput[]): CartLineInput[] {
  const merged = new Map<string, number>();
  for (const { productId, qty } of lines) merged.set(productId, (merged.get(productId) ?? 0) + qty);
  return [...merged].map(([productId, qty]) => ({ productId, qty: Math.min(qty, 20) }));
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Prices a cart from the DATABASE (never from browser-supplied prices) and
 * checks each product still exists, is visible and is in stock. The same
 * function is used for the cart/checkout display and for creating the order.
 */
export async function priceCart(lines: CartLineInput[]): Promise<CartQuote> {
  const supabase = createAdminClient();
  const items = mergeLines(lines);
  const ids = items.map((i) => i.productId);

  const [{ data: products, error }, { data: settings, error: settingsError }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, price, in_stock, is_visible, images")
      .in("id", ids),
    supabase.from("settings").select("delivery_fee").eq("id", 1).maybeSingle(),
  ]);
  if (error) throw error;
  if (settingsError) throw settingsError;

  const byId = new Map(products.map((p) => [p.id, p]));

  const priced: PricedLine[] = items.map(({ productId, qty }) => {
    const product = byId.get(productId);
    if (!product || !product.is_visible) {
      return {
        productId,
        name: "Unavailable product",
        slug: null,
        image: null,
        qty,
        price: 0,
        lineTotal: 0,
        available: false,
        problem: "not_found",
      };
    }
    const price = Number(product.price);
    return {
      productId,
      name: product.name,
      slug: product.slug,
      image: product.images[0] ?? null,
      qty,
      price,
      lineTotal: round2(price * qty),
      available: product.in_stock,
      problem: product.in_stock ? undefined : "out_of_stock",
    };
  });

  const subtotal = round2(
    priced.filter((l) => l.available).reduce((sum, l) => sum + l.lineTotal, 0),
  );
  const deliveryFee = Number(settings?.delivery_fee ?? 0);

  return {
    lines: priced,
    subtotal,
    deliveryFee,
    total: round2(subtotal + deliveryFee),
    orderable: priced.length > 0 && priced.every((l) => l.available),
  };
}
