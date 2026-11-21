import { connection } from "next/server";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Skeleton } from "@/components/ui/skeleton";
import { isPayHereConfigured } from "@/lib/payhere/config";

export const metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">Checkout</h1>
      <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
        <Checkout />
      </Suspense>
    </div>
  );
}

async function Checkout() {
  // Read PayHere config at request time, so adding the env vars in Vercel
  // enables card payments without a code change.
  await connection();
  return <CheckoutForm payhereEnabled={isPayHereConfigured()} />;
}
