"use client";

import { FormField } from "@/components/admin/form-field";
import { OrderDetails } from "@/components/order/order-details";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import { trackOrder, type TrackState } from "./actions";

export function TrackForm() {
  const { state, pending, onSubmit } = useActionForm<TrackState>(trackOrder, { status: "idle" });

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit} className="grid gap-4 rounded-xl bg-white p-4 ring-1 ring-foreground/10 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6">
        <FormField label="Order number" htmlFor="orderNo">
          <Input id="orderNo" name="orderNo" inputMode="numeric" placeholder="e.g. 1001" required className="h-10" />
        </FormField>
        <FormField label="Mobile number" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" inputMode="tel" placeholder="07X XXX XXXX" required className="h-10" />
        </FormField>
        <Button type="submit" disabled={pending} className="h-10 px-6">
          {pending ? "Searching…" : "Track"}
        </Button>
        {state.status === "error" && (
          <p role="alert" className="text-sm text-destructive sm:col-span-3">
            {state.message}
          </p>
        )}
      </form>

      {state.status === "found" && <OrderDetails order={state.order} />}
    </div>
  );
}
