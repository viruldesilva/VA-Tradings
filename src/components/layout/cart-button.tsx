"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

export function CartButton() {
  const { count } = useCart();
  const label = count === 1 ? "1 item" : `${count} items`;

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${label}`}
      className="relative grid size-10 shrink-0 place-items-center rounded-full text-brand-dark transition-colors hover:bg-muted"
    >
      <ShoppingCart className="size-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-accent px-1 text-[11px] font-bold text-brand-dark">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
