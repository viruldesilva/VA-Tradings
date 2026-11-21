import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderWithItems } from "@/lib/types/database";

/** Customer-safe view of an order (no internal ids or tokens). */
export type CustomerOrder = Pick<
  OrderWithItems,
  | "order_no"
  | "customer_name"
  | "phone"
  | "address"
  | "city"
  | "notes"
  | "subtotal"
  | "delivery_fee"
  | "total"
  | "payment_method"
  | "payment_status"
  | "status"
  | "tracking_no"
  | "created_at"
> & { items: { product_name: string; qty: number; price: number }[] };

const CUSTOMER_ORDER_SELECT =
  "order_no, customer_name, phone, address, city, notes, subtotal, delivery_fee, total, payment_method, payment_status, status, tracking_no, created_at, public_token, order_items(product_name, qty, price)";

type Row = Omit<CustomerOrder, "items"> & {
  public_token: string;
  order_items: CustomerOrder["items"];
};

function toCustomerOrder(row: Row): CustomerOrder {
  const { order_items, ...order } = row;
  delete (order as Partial<Row>).public_token; // never send the token back out
  return { ...order, items: order_items };
}

async function fetchByOrderNo(orderNo: number): Promise<Row | null> {
  if (!Number.isSafeInteger(orderNo) || orderNo <= 0) return null;
  const { data, error } = await createAdminClient()
    .from("orders")
    .select(CUSTOMER_ORDER_SELECT)
    .eq("order_no", orderNo)
    .maybeSingle();
  if (error) throw error;
  return data as Row | null;
}

/** For the confirmation page: order number + the secret token from the link. */
export async function getOrderByToken(orderNo: number, token: string) {
  const row = await fetchByOrderNo(orderNo);
  return row && row.public_token === token ? toCustomerOrder(row) : null;
}

/** For "Track my order": order number + the phone used at checkout. */
export async function getOrderByPhone(orderNo: number, phone: string) {
  const row = await fetchByOrderNo(orderNo);
  return row && row.phone === phone ? toCustomerOrder(row) : null;
}
