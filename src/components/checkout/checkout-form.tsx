"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Banknote, CreditCard, Lock } from "lucide-react";
import { FormField } from "@/components/admin/form-field";
import { useCart } from "@/components/cart/cart-provider";
import { OrderSummary } from "@/components/cart/order-summary";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCartQuote } from "@/hooks/use-cart-quote";
import { cartStore } from "@/lib/cart/store";
import { formatLKR } from "@/lib/format";
import type { CartQuote } from "@/lib/orders/pricing";
import type { PaymentMethod } from "@/lib/types/database";
import { cn } from "@/lib/utils";

type ApiError = {
  error: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  quote?: CartQuote;
};

export function CheckoutForm({ payhereEnabled }: { payhereEnabled: boolean }) {
  const router = useRouter();
  const { items, hydrated, clear } = useCart();
  const { quote, loading, failed } = useCartQuote();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const err = (field: string) => error?.fieldErrors?.[field]?.[0];

  if (hydrated && items.length === 0 && !submitting) {
    return (
      <div className="rounded-xl bg-white p-10 text-center ring-1 ring-foreground/10">
        <p className="font-medium">Your cart is empty.</p>
        <Link href="/shop" className={buttonVariants({ className: "mt-4 h-10 px-5" })}>
          Go to shop
        </Link>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      customer_name: form.get("customer_name"),
      phone: form.get("phone"),
      address: form.get("address"),
      city: form.get("city"),
      notes: form.get("notes"),
      website: form.get("website"),
      payment_method: paymentMethod,
      items: items.map(({ productId, qty }) => ({ productId, qty })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        const apiError = data as ApiError;
        if (apiError.quote) cartStore.syncFromServer(apiError.quote.lines);
        setError(apiError);
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const { orderNo, token } = data as { orderNo: number; token: string };
      const query = `token=${encodeURIComponent(token)}`;
      // Clear the cart only once we're leaving the page.
      router.push(paymentMethod === "payhere" ? `/pay/${orderNo}?${query}` : `/order/${orderNo}?${query}`);
      clear();
    } catch {
      setError({ error: "Network error. Check your connection and try again." });
      setSubmitting(false);
    }
  }

  const canSubmit = !submitting && !loading && !failed && (quote?.orderable ?? false);

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="grid content-start gap-6">
        {error && (
          <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-destructive">
            <p className="font-medium">{error.error}</p>
            {error.quote && (
              <p className="mt-1">
                Please <Link href="/cart" className="underline">review your cart</Link>.
              </p>
            )}
          </div>
        )}

        <section className="grid gap-4 rounded-xl bg-white p-4 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-semibold text-brand-dark">Delivery details</h2>
          <FormField label="Full name" htmlFor="customer_name" error={err("customer_name")}>
            <Input id="customer_name" name="customer_name" autoComplete="name" required aria-invalid={!!err("customer_name")} className="h-10" />
          </FormField>
          <FormField
            label="Mobile number"
            htmlFor="phone"
            error={err("phone")}
            hint="We'll call this number to confirm your order."
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="07X XXX XXXX"
              required
              aria-invalid={!!err("phone")}
              className="h-10"
            />
          </FormField>
          <FormField label="Address" htmlFor="address" error={err("address")}>
            <Textarea id="address" name="address" autoComplete="street-address" rows={3} required aria-invalid={!!err("address")} />
          </FormField>
          <FormField label="City" htmlFor="city" error={err("city")}>
            <Input id="city" name="city" autoComplete="address-level2" required aria-invalid={!!err("city")} className="h-10" />
          </FormField>
          <FormField label="Notes (optional)" htmlFor="notes" error={err("notes")}>
            <Textarea id="notes" name="notes" rows={2} placeholder="Landmark, preferred delivery time…" />
          </FormField>
          {/* Honeypot for bots: hidden from people and screen readers */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        </section>

        <fieldset className="grid gap-3 rounded-xl bg-white p-4 ring-1 ring-foreground/10 sm:p-6">
          <legend className="sr-only">Payment method</legend>
          <h2 className="font-semibold text-brand-dark">Payment method</h2>
          <PaymentOption
            value="cod"
            selected={paymentMethod}
            onSelect={setPaymentMethod}
            icon={<Banknote className="size-5" />}
            title="Cash on Delivery"
            description="Pay in cash when your order arrives."
          />
          <PaymentOption
            value="payhere"
            selected={paymentMethod}
            onSelect={setPaymentMethod}
            icon={<CreditCard className="size-5" />}
            title="Card / online payment"
            description={payhereEnabled ? "Visa, Mastercard, eZ Cash and more via PayHere." : "Coming soon."}
            disabled={!payhereEnabled}
          />
          {err("payment_method") && <p className="text-sm text-destructive">{err("payment_method")}</p>}
        </fieldset>
      </div>

      <div className="grid content-start gap-3 lg:sticky lg:top-24">
        <OrderSummary quote={quote} loading={loading || !hydrated}>
          <ul className="grid gap-1 border-t pt-3 text-sm">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-2">
                <span className="line-clamp-1 text-muted-foreground">
                  {item.qty} × {item.name}
                </span>
                <span className="shrink-0 tabular-nums">{formatLKR(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          {quote && !quote.orderable && (
            <p className="text-sm text-destructive">
              Some items are unavailable. <Link href="/cart" className="underline">Update your cart</Link>.
            </p>
          )}
          {failed && <p className="text-sm text-destructive">Couldn&apos;t load prices. Please refresh.</p>}
          <Button type="submit" disabled={!canSubmit} className="h-12 text-base">
            {submitting
              ? "Placing order…"
              : paymentMethod === "payhere"
                ? "Continue to payment"
                : "Place order"}
          </Button>
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3" aria-hidden /> Your details are only used to deliver your order.
          </p>
        </OrderSummary>
      </div>
    </form>
  );
}

function PaymentOption({
  value,
  selected,
  onSelect,
  icon,
  title,
  description,
  disabled,
}: {
  value: PaymentMethod;
  selected: PaymentMethod;
  onSelect: (v: PaymentMethod) => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  const checked = selected === value;
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg p-3 ring-1 transition",
        checked ? "bg-primary/5 ring-2 ring-primary" : "ring-foreground/15 hover:ring-primary/50",
        disabled && "cursor-not-allowed opacity-50 hover:ring-foreground/15",
      )}
    >
      <input
        type="radio"
        name="payment_method"
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onSelect(value)}
        className="size-4 accent-primary"
      />
      <span className="text-primary">{icon}</span>
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}
