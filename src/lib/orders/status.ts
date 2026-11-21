import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/types/database";

export const ORDER_STATUSES: OrderStatus[] = ["new", "bought", "shipped", "delivered", "cancelled"];

/** Labels for the admin. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "New",
  bought: "Bought from supplier",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Labels for customers (they don't need to know about the supplier). */
export const CUSTOMER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Order received",
  bought: "Preparing your order",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  payhere: "Card / online (PayHere)",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
};

export const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  bought: "bg-amber-100 text-amber-800",
  shipped: "bg-violet-100 text-violet-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-slate-200 text-slate-700",
};

export const formatOrderNo = (orderNo: number) => `#${orderNo}`;
