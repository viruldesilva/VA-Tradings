"use client";

import { useEffect, useState } from "react";
import { quoteCart } from "@/app/(shop)/cart/actions";
import { useCart } from "@/components/cart/cart-provider";
import { cartStore } from "@/lib/cart/store";
import type { CartQuote } from "@/lib/orders/pricing";

/**
 * Fetches real prices/stock for the cart from the server whenever the items
 * or quantities change, and refreshes stale prices saved in the browser.
 */
export function useCartQuote() {
  const { items } = useCart();
  const key = items.map((i) => `${i.productId}:${i.qty}`).join(",");
  const [result, setResult] = useState<{ key: string; quote: CartQuote | null } | null>(null);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    const lines = key.split(",").map((pair) => {
      const [productId, qty] = pair.split(":");
      return { productId, qty: Number(qty) };
    });

    quoteCart(lines).then((quote) => {
      if (cancelled) return;
      setResult({ key, quote });
      if (quote) cartStore.syncFromServer(quote.lines);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const current = result?.key === key ? result : null;
  return {
    quote: current?.quote ?? null,
    loading: !!key && !current,
    failed: !!current && !current.quote,
    /** Look up the server line for a cart item. */
    lineFor: (productId: string) => current?.quote?.lines.find((l) => l.productId === productId),
  };
}
