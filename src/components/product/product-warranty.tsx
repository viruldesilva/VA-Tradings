import { CONDITION_LABELS, formatWarranty, type ProductCondition } from "@/lib/product-details";
import { cn } from "@/lib/utils";

const CONDITION_STYLES: Record<ProductCondition, string> = {
  new: "bg-green-600",
  used: "bg-amber-600",
  refurbished: "bg-sky-600",
};

type Props = {
  warrantyMonths: number | null;
  condition: ProductCondition;
  className?: string;
};

/** Dark highlight box with the warranty period and item condition. */
export function ProductWarranty({ warrantyMonths, condition, className }: Props) {
  return (
    <dl
      className={cn(
        "grid gap-3 rounded-xl border border-white/10 bg-brand-dark px-5 py-4 text-[15px] shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-1.5">
        <dt className="font-bold text-green-400">Warranty Period:</dt>
        <dd className="text-white">{formatWarranty(warrantyMonths)}</dd>
      </div>
      <div className="flex flex-wrap items-center gap-x-3">
        <dt className="font-bold text-green-400">Status:</dt>
        <dd>
          <span
            className={cn(
              "inline-block rounded-md px-2.5 py-1 text-xs font-bold text-white",
              CONDITION_STYLES[condition],
            )}
          >
            {CONDITION_LABELS[condition]}
          </span>
        </dd>
      </div>
    </dl>
  );
}
