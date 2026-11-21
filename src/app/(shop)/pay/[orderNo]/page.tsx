import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Lock } from "lucide-react";
import { FormField } from "@/components/admin/form-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLKR } from "@/lib/format";
import { getOrderByToken } from "@/lib/orders/lookup";
import { formatOrderNo } from "@/lib/orders/status";
import { buildPayHereFields } from "@/lib/payhere/checkout";
import { isPayHereConfigured } from "@/lib/payhere/config";

export const metadata = { title: "Payment", robots: { index: false, follow: false } };

export default function PayPage(props: PageProps<"/pay/[orderNo]">) {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Suspense fallback={<Skeleton className="h-80 rounded-xl" />}>
        <Pay {...props} />
      </Suspense>
    </div>
  );
}

async function Pay({ params, searchParams }: PageProps<"/pay/[orderNo]">) {
  const [{ orderNo }, sp] = await Promise.all([params, searchParams]);
  const token = typeof sp.token === "string" ? sp.token : "";
  const order = /^\d+$/.test(orderNo) && token ? await getOrderByToken(Number(orderNo), token) : null;

  if (!order || order.payment_method !== "payhere" || !isPayHereConfigured()) {
    return (
      <div className="rounded-xl bg-white p-8 text-center ring-1 ring-foreground/10">
        <h1 className="text-xl font-bold">Payment link not valid</h1>
        <Link href="/track" className={buttonVariants({ className: "mt-5 h-10 px-5" })}>
          Track my order
        </Link>
      </div>
    );
  }

  const orderUrl = `/order/${order.order_no}?token=${encodeURIComponent(token)}`;
  if (order.payment_status === "paid") redirect(orderUrl);

  const { checkoutUrl, fields } = buildPayHereFields(order, token);
  const cancelled = sp.cancelled === "1";

  return (
    <div className="grid gap-5 rounded-xl bg-white p-6 ring-1 ring-foreground/10">
      <div>
        <h1 className="text-xl font-bold text-brand-dark">Pay for order {formatOrderNo(order.order_no)}</h1>
        <p className="mt-1 text-3xl font-bold tabular-nums">{formatLKR(order.total)}</p>
      </div>

      {cancelled && (
        <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Payment was cancelled. Your order is saved, so you can try again below.
        </p>
      )}

      {/* Posts directly to PayHere. The hash is computed on our server; the secret never reaches the browser. */}
      <form method="post" action={checkoutUrl} className="grid gap-4">
        {Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <FormField label="Email for your payment receipt" htmlFor="email" hint="Required by PayHere. We only use it for this payment.">
          <Input id="email" name="email" type="email" autoComplete="email" required className="h-10" />
        </FormField>
        <Button type="submit" className="h-12 text-base">
          <Lock /> Pay securely with PayHere
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Changed your mind?{" "}
        <Link href={orderUrl} className="underline">
          View your order
        </Link>{" "}
        or contact us on WhatsApp to switch to Cash on Delivery.
      </p>
    </div>
  );
}
