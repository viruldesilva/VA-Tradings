import "server-only";
import { requireAdmin } from "@/lib/auth";
import { startOfColomboDay, startOfColomboMonth } from "@/lib/dates";
import { ORDER_STATUSES } from "@/lib/orders/status";
import type { Order, OrderItem, OrderStatus, PaymentStatus } from "@/lib/types/database";

export type AdminOrderRow = Pick<
  Order,
  | "id"
  | "order_no"
  | "customer_name"
  | "phone"
  | "city"
  | "total"
  | "payment_method"
  | "payment_status"
  | "status"
  | "created_at"
>;

export type AdminOrderItem = OrderItem & {
  products: {
    slug: string;
    images: string[];
    product_private: { supplier_url: string | null; supplier_price: number | null } | null;
  } | null;
};

export type AdminOrder = Order & { order_items: AdminOrderItem[] };

export async function listOrders(status?: OrderStatus): Promise<AdminOrderRow[]> {
  const { supabase } = await requireAdmin();
  let query = supabase
    .from("orders")
    .select("id, order_no, customer_name, phone, city, total, payment_method, payment_status, status, created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function countOrdersByStatus(): Promise<Record<OrderStatus | "all", number>> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("orders").select("status").limit(100_000);
  if (error) throw error;

  const counts = Object.fromEntries([["all", data.length], ...ORDER_STATUSES.map((s) => [s, 0])]);
  for (const { status } of data) counts[status]++;
  return counts as Record<OrderStatus | "all", number>;
}

export async function getOrderByNo(orderNo: number): Promise<AdminOrder | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(slug, images, product_private(supplier_url, supplier_price)))")
    .eq("order_no", orderNo)
    .maybeSingle();
  if (error) throw error;
  return data as AdminOrder | null;
}

export async function updateOrder(
  id: string,
  input: { status: OrderStatus; payment_status: PaymentStatus; tracking_no: string | null },
) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("orders").update(input).eq("id", id);
  if (error) throw error;
}

/** Profit for one item: uses the supplier price saved with the order, else the current one. */
export function itemProfit(item: AdminOrderItem): number | null {
  const cost = item.supplier_price ?? item.products?.product_private?.supplier_price ?? null;
  return cost === null ? null : (Number(item.price) - Number(cost)) * item.qty;
}

export type DashboardStats = {
  todayOrders: number;
  pendingOrders: number;
  monthRevenue: number;
  monthProfit: number;
  /** Items this month with no supplier price (left out of profit). */
  itemsWithoutCost: number;
  monthStart: Date;
  recent: AdminOrderRow[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const { supabase } = await requireAdmin();
  const now = new Date();
  const dayStart = startOfColomboDay(now);
  const monthStart = startOfColomboMonth(now);
  const since = new Date(Math.min(dayStart.getTime(), monthStart.getTime())).toISOString();

  const [periodResult, pendingResult, recent] = await Promise.all([
    supabase
      .from("orders")
      .select("total, status, created_at, order_items(*, products(slug, images, product_private(supplier_url, supplier_price)))")
      .gte("created_at", since),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["new", "bought"]),
    listOrders().then((rows) => rows.slice(0, 6)),
  ]);
  if (periodResult.error) throw periodResult.error;
  if (pendingResult.error) throw pendingResult.error;

  const orders = periodResult.data as unknown as (Pick<Order, "total" | "status" | "created_at"> & {
    order_items: AdminOrderItem[];
  })[];

  let todayOrders = 0;
  let monthRevenue = 0;
  let monthProfit = 0;
  let itemsWithoutCost = 0;

  for (const order of orders) {
    const created = new Date(order.created_at);
    if (created >= dayStart) todayOrders++;
    if (created < monthStart || order.status === "cancelled") continue;

    monthRevenue += Number(order.total);
    for (const item of order.order_items) {
      const profit = itemProfit(item);
      if (profit === null) itemsWithoutCost++;
      else monthProfit += profit;
    }
  }

  return {
    todayOrders,
    pendingOrders: pendingResult.count ?? 0,
    monthRevenue,
    monthProfit,
    itemsWithoutCost,
    monthStart,
    recent,
  };
}
