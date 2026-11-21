import { Skeleton } from "@/components/ui/skeleton";
import { formatLKR } from "@/lib/format";
import type { CartQuote } from "@/lib/orders/pricing";

/** Subtotal / delivery / total box. Shows skeletons while the server quote loads. */
export function OrderSummary({
  quote,
  loading,
  children,
}: {
  quote: CartQuote | null;
  loading: boolean;
  children?: React.ReactNode;
}) {
  const row = (label: string, value: number | undefined, strong = false) => (
    <div className={strong ? "flex justify-between text-base font-bold" : "flex justify-between text-sm"}>
      <dt className={strong ? "" : "text-muted-foreground"}>{label}</dt>
      <dd className="tabular-nums">
        {loading || value === undefined ? <Skeleton className="h-4 w-20" /> : formatLKR(value)}
      </dd>
    </div>
  );

  return (
    <div className="grid gap-4 rounded-xl bg-white p-4 ring-1 ring-foreground/10">
      <h2 className="font-semibold text-brand-dark">Order summary</h2>
      <dl className="grid gap-2">
        {row("Subtotal", quote?.subtotal)}
        {row("Delivery", quote?.deliveryFee)}
        <div className="my-1 border-t" />
        {row("Total", quote?.total, true)}
      </dl>
      {children}
    </div>
  );
}
