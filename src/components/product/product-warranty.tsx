import { Badge } from "@/components/ui/badge";
import { CONDITION_LABELS, formatWarranty, type ProductCondition } from "@/lib/product-details";
import { cn } from "@/lib/utils";

// Same soft "pill" style as the In stock badge.
const CONDITION_STYLES: Record<ProductCondition, string> = {
  new: "bg-green-100 text-green-800",
  used: "bg-amber-100 text-amber-800",
  refurbished: "bg-sky-100 text-sky-800",
};

type Props = {
  warrantyMonths: number | null;
  condition: ProductCondition;
  className?: string;
};

/** Light green highlight box with the warranty period and item condition. */
export function ProductWarranty({ warrantyMonths, condition, className }: Props) {
  return (
    <dl
      className={cn(
        "grid gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5 text-sm",
        "shadow-[0_0_0_3px_rgb(34_197_94/0.08),0_4px_16px_-4px_rgb(34_197_94/0.25)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-1.5">
        <dt className="font-semibold text-green-800">Warranty Period:</dt>
        <dd className="font-medium text-slate-700">{formatWarranty(warrantyMonths)}</dd>
      </div>
      <div className="flex flex-wrap items-center gap-x-2">
        <dt className="font-semibold text-green-800">Status:</dt>
        <dd>
          <Badge className={CONDITION_STYLES[condition]}>{CONDITION_LABELS[condition]}</Badge>
        </dd>
      </div>
    </dl>
  );
}
