"use server";

import { refresh } from "next/cache";
import { actionError, actionOk, type ActionState } from "@/lib/action-state";
import { updateOrder } from "@/lib/data/admin/orders";
import { fieldErrors, formString } from "@/lib/validation/form";
import { orderUpdateSchema } from "@/lib/validation/order";

export async function saveOrder(orderId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = orderUpdateSchema.safeParse({
    status: formString(formData, "status"),
    payment_status: formString(formData, "payment_status"),
    tracking_no: formString(formData, "tracking_no"),
  });
  if (!parsed.success) return actionError("Please fix the highlighted fields.", fieldErrors(parsed.error));

  try {
    await updateOrder(orderId, parsed.data);
  } catch (err) {
    console.error("[saveOrder]", err);
    return actionError("Couldn't update the order. Please try again.");
  }
  refresh();
  return actionOk("Order updated.");
}
