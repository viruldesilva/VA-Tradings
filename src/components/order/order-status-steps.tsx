import { Check, X } from "lucide-react";
import { CUSTOMER_STATUS_LABELS } from "@/lib/orders/status";
import type { OrderStatus } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const STEPS: OrderStatus[] = ["new", "bought", "shipped", "delivered"];

export function OrderStatusSteps({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
        <X className="size-4" aria-hidden /> This order was cancelled.
      </p>
    );
  }

  const current = STEPS.indexOf(status);

  return (
    <ol className="grid grid-cols-4 gap-1" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="flex flex-col items-center gap-1.5 text-center" aria-current={i === current ? "step" : undefined}>
            <div className="flex w-full items-center">
              <span className={cn("h-0.5 flex-1", i === 0 ? "invisible" : done ? "bg-primary" : "bg-slate-200")} />
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                  done ? "bg-primary text-white" : "bg-slate-200 text-slate-500",
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              <span className={cn("h-0.5 flex-1", i === STEPS.length - 1 ? "invisible" : i < current ? "bg-primary" : "bg-slate-200")} />
            </div>
            <span className={cn("text-[11px] leading-tight sm:text-xs", done ? "font-medium text-brand-dark" : "text-muted-foreground")}>
              {CUSTOMER_STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
