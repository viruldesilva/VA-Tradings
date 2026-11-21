"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import type { ActionState } from "@/lib/action-state";
import { ORDER_STATUS_LABELS, ORDER_STATUSES, PAYMENT_STATUS_LABELS } from "@/lib/orders/status";
import type { Order, PaymentStatus } from "@/lib/types/database";
import { FormField, FormMessage, NativeSelect } from "./form-field";

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed"];

export function OrderUpdateForm({
  order,
  action,
}: {
  order: Pick<Order, "status" | "payment_status" | "tracking_no">;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const { state, pending, onSubmit } = useActionForm(action);
  const err = (f: string) => state?.fieldErrors?.[f]?.[0];

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormField label="Order status" htmlFor="status" error={err("status")}>
        <NativeSelect id="status" name="status" defaultValue={order.status}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </NativeSelect>
      </FormField>
      <FormField label="Payment status" htmlFor="payment_status" error={err("payment_status")}>
        <NativeSelect id="payment_status" name="payment_status" defaultValue={order.payment_status}>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </NativeSelect>
      </FormField>
      <FormField label="Tracking number" htmlFor="tracking_no" error={err("tracking_no")} hint="Shown to the customer on Track my order.">
        <Input id="tracking_no" name="tracking_no" defaultValue={order.tracking_no ?? ""} />
      </FormField>
      <FormMessage state={state} />
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
