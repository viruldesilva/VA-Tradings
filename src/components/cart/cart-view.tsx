"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff, ShoppingBag, Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartQuote } from "@/hooks/use-cart-quote";
import { formatLKR } from "@/lib/format";
import { useCart } from "./cart-provider";
import { OrderSummary } from "./order-summary";

export function CartView() {
  const { items, hydrated, setQty, removeItem } = useCart();
  const { quote, loading, failed, lineFor } = useCartQuote();

  if (!hydrated) return <CartSkeleton />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-12 text-center ring-1 ring-foreground/10">
        <ShoppingBag className="size-10 text-slate-300" aria-hidden />
        <p className="font-medium text-brand-dark">Your cart is empty</p>
        <Link href="/shop" className={buttonVariants({ className: "h-10 px-5" })}>
          Start shopping
        </Link>
      </div>
    );
  }

  const hasProblems = quote ? !quote.orderable : false;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <ul className="divide-y rounded-xl bg-white ring-1 ring-foreground/10">
        {items.map((item) => {
          const line = lineFor(item.productId);
          const unavailable = line && !line.available;
          return (
            <li key={item.productId} className="flex gap-3 p-4">
              <Link
                href={`/product/${item.slug}`}
                className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-slate-100"
              >
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                ) : (
                  <ImageOff className="absolute inset-0 m-auto size-5 text-slate-300" aria-hidden />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex justify-between gap-2">
                  <Link
                    href={`/product/${item.slug}`}
                    className="line-clamp-2 text-sm font-medium text-brand-dark hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="-mt-1 -mr-1 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
                {unavailable ? (
                  <p className="text-sm font-medium text-destructive">
                    {line.problem === "out_of_stock" ? "Out of stock" : "No longer available"}.
                    Please remove it to continue.
                  </p>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <QuantityStepper
                      size="sm"
                      value={item.qty}
                      onChange={(qty) => setQty(item.productId, qty)}
                      label={`Quantity of ${item.name}`}
                    />
                    <p className="text-sm font-semibold tabular-nums">
                      {formatLKR((line?.price ?? item.price) * item.qty)}
                    </p>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="grid content-start gap-3">
        <OrderSummary quote={quote} loading={loading}>
          {failed && (
            <p className="text-sm text-destructive">
              Couldn&apos;t load current prices. Check your connection and refresh.
            </p>
          )}
          {hasProblems && (
            <p className="text-sm text-destructive">Remove unavailable items to continue.</p>
          )}
          {loading || hasProblems || failed ? (
            <Button disabled className="h-11 text-base">
              Checkout
            </Button>
          ) : (
            <Link href="/checkout" className={buttonVariants({ className: "h-11 text-base" })}>
              Checkout
            </Link>
          )}
        </OrderSummary>
        <Link href="/shop" className="text-center text-sm font-medium text-primary hover:underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-foreground/10">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-20" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
