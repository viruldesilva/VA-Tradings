import { ORDER_STATUS_LABELS, STATUS_BADGE_CLASSES } from "@/lib/orders/status";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/types/database";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", STATUS_BADGE_CLASSES[status])}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentBadge({ method, status }: { method: PaymentMethod; status: PaymentStatus }) {
  const color =
    status === "paid" ? "text-green-700" : status === "failed" ? "text-destructive" : "text-muted-foreground";
  return (
    <span className="text-xs whitespace-nowrap">
      {method === "cod" ? "COD" : "PayHere"} · <span className={color}>{status}</span>
    </span>
  );
}
