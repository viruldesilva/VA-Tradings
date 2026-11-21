import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminOrderRow } from "@/lib/data/admin/orders";
import { formatDateTime } from "@/lib/dates";
import { formatLKR } from "@/lib/format";
import { formatOrderNo } from "@/lib/orders/status";
import { OrderStatusBadge, PaymentBadge } from "./order-status-badge";

export function OrdersTable({ orders, emptyText = "No orders yet." }: { orders: AdminOrderRow[]; emptyText?: string }) {
  if (orders.length === 0) {
    return (
      <p className="rounded-xl bg-white p-10 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="hidden sm:table-cell">Payment</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="relative">
              <TableCell>
                <Link
                  href={`/admin/orders/${order.order_no}`}
                  className="font-semibold text-primary after:absolute after:inset-0"
                >
                  {formatOrderNo(order.order_no)}
                </Link>
                <p className="text-xs text-muted-foreground">{formatDateTime(order.created_at)}</p>
              </TableCell>
              <TableCell className="max-w-40 whitespace-normal">
                <p className="truncate font-medium">{order.customer_name}</p>
                <p className="text-xs text-muted-foreground">{order.city}</p>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">{formatLKR(order.total)}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <PaymentBadge method={order.payment_method} status={order.payment_status} />
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
