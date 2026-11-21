import { formatLKR } from "@/lib/format";
import type { CustomerOrder } from "@/lib/orders/lookup";
import { formatOrderNo, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/orders/status";
import { OrderStatusSteps } from "./order-status-steps";

/** Order info shown to customers (confirmation + tracking). No hooks: works on server and client. */
export function OrderDetails({ order }: { order: CustomerOrder }) {
  const placed = new Date(order.created_at).toLocaleDateString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 rounded-xl bg-white p-4 ring-1 ring-foreground/10 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-brand-dark">Order {formatOrderNo(order.order_no)}</h2>
          <p className="text-sm text-muted-foreground">Placed {placed}</p>
        </div>
        <OrderStatusSteps status={order.status} />
        {order.tracking_no && (
          <p className="rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-900">
            Tracking number: <strong className="select-all">{order.tracking_no}</strong>
          </p>
        )}
      </section>

      <section className="rounded-xl bg-white p-4 ring-1 ring-foreground/10 sm:p-6">
        <h3 className="mb-3 font-semibold text-brand-dark">Items</h3>
        <ul className="divide-y text-sm">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3 py-2">
              <span>
                {item.product_name} <span className="text-muted-foreground">× {item.qty}</span>
              </span>
              <span className="shrink-0 tabular-nums">{formatLKR(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 grid gap-1 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatLKR(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd className="tabular-nums">{formatLKR(order.delivery_fee)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatLKR(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 rounded-xl bg-white p-4 text-sm ring-1 ring-foreground/10 sm:grid-cols-2 sm:p-6">
        <div>
          <h3 className="mb-1 font-semibold text-brand-dark">Delivery to</h3>
          <p>{order.customer_name}</p>
          <p className="whitespace-pre-line text-muted-foreground">
            {order.address}
            {"\n"}
            {order.city}
          </p>
          <p className="text-muted-foreground">{order.phone}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-brand-dark">Payment</h3>
          <p>{PAYMENT_METHOD_LABELS[order.payment_method]}</p>
          <p className="text-muted-foreground">
            {order.payment_method === "cod" && order.payment_status !== "paid"
              ? `Pay ${formatLKR(order.total)} on delivery`
              : PAYMENT_STATUS_LABELS[order.payment_status]}
          </p>
        </div>
      </section>
    </div>
  );
}
