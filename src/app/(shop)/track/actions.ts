"use server";

import { getOrderByPhone, type CustomerOrder } from "@/lib/orders/lookup";
import { normalizeLKPhone } from "@/lib/phone";
import { formString } from "@/lib/validation/form";

export type TrackState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "found"; order: CustomerOrder };

export async function trackOrder(_prev: TrackState, formData: FormData): Promise<TrackState> {
  const orderNo = Number(formString(formData, "orderNo").replace(/\D/g, ""));
  const phone = normalizeLKPhone(formString(formData, "phone"));

  if (!orderNo || !phone) {
    return { status: "error", message: "Enter your order number and the mobile number you used." };
  }

  try {
    const order = await getOrderByPhone(orderNo, phone);
    if (!order) {
      return {
        status: "error",
        message: "We couldn't find an order with that number and phone. Please check and try again.",
      };
    }
    return { status: "found", order };
  } catch (err) {
    console.error("[trackOrder]", err);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}
