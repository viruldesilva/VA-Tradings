import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ExternalLink, ImageOff, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { ListSkeleton } from "@/components/admin/list-skeleton";
import { OrderStatusBadge, PaymentBadge } from "@/components/admin/order-status-badge";
import { OrderUpdateForm } from "@/components/admin/order-update-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderByNo, itemProfit, type AdminOrder } from "@/lib/data/admin/orders";
import { formatDateTime } from "@/lib/dates";
import { formatLKR, whatsappUrl } from "@/lib/format";
import { formatOrderNo, PAYMENT_METHOD_LABELS } from "@/lib/orders/status";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { saveOrder } from "../actions";

export const metadata = { title: "Order" };

type Props = PageProps<"/admin/orders/[orderNo]">;

export default function AdminOrderPage({ params }: Props) {
  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> All orders
      </Link>
      <Suspense fallback={<ListSkeleton rows={8} />}>
        <OrderDetail params={params} />
      </Suspense>
    </>
  );
}

async function OrderDetail({ params }: { params: Props["params"] }) {
  const { orderNo } = await params;
  if (!/^\d+$/.test(orderNo)) notFound();
  const order = await getOrderByNo(Number(orderNo));
  if (!order) notFound();

  const profits = order.order_items.map(itemProfit);
  const totalProfit = profits.every((p) => p !== null)
    ? profits.reduce<number>((sum, p) => sum + (p ?? 0), 0)
    : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Order {formatOrderNo(order.order_no)}</h1>
        <OrderStatusBadge status={order.status} />
        <PaymentBadge method={order.payment_method} status={order.payment_status} />
        <span className="text-sm text-muted-foreground">{formatDateTime(order.created_at)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Items to buy</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {order.order_items.map((item, i) => (
                  <OrderItemRow key={item.id} item={item} profit={profits[i]} />
                ))}
              </ul>
              <dl className="mt-4 grid gap-1 border-t pt-4 text-sm">
                <Row label="Subtotal" value={formatLKR(order.subtotal)} />
                <Row label="Delivery fee" value={formatLKR(order.delivery_fee)} />
                <Row label="Total" value={formatLKR(order.total)} strong />
                <Row
                  label="Your profit (items)"
                  value={totalProfit === null ? "Missing supplier price" : formatLKR(totalProfit)}
                  className={totalProfit !== null && totalProfit < 0 ? "text-destructive" : "text-green-700"}
                />
              </dl>
            </CardContent>
          </Card>

          <CustomerCard order={order} />
        </div>

        <Card className="content-start">
          <CardHeader>
            <CardTitle>Update order</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderUpdateForm order={order} action={saveOrder.bind(null, order.id)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrderItemRow({ item, profit }: { item: AdminOrder["order_items"][number]; profit: number | null }) {
  const supplierUrl = item.products?.product_private?.supplier_url;
  const image = item.products?.images[0];
  const cost = item.supplier_price ?? item.products?.product_private?.supplier_price ?? null;

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {image ? (
          <Image src={image} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <ImageOff className="absolute inset-0 m-auto size-4 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {item.product_name} <span className="text-muted-foreground">× {item.qty}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {formatLKR(item.price)} each
          {cost !== null && <> · cost {formatLKR(cost)}</>}
          {profit !== null && (
            <span className={cn(" font-medium", profit < 0 ? "text-destructive" : "text-green-700")}>
              {" "}· profit {formatLKR(profit)}
            </span>
          )}
        </p>
      </div>
      {supplierUrl ? (
        <a
          href={supplierUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "sm", className: "h-8" })}
        >
          Buy from supplier <ExternalLink />
        </a>
      ) : (
        <span className="text-xs text-muted-foreground">
          {item.products ? "No supplier URL" : "Product deleted"}
        </span>
      )}
    </li>
  );
}

function CustomerCard({ order }: { order: AdminOrder }) {
  const message = customerMessage(order);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="font-medium">{order.customer_name}</p>
          <p className="mt-1 whitespace-pre-line text-muted-foreground select-all">
            {order.address}
            {"\n"}
            {order.city}
          </p>
          {order.notes && (
            <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-amber-900">Note: {order.notes}</p>
          )}
        </div>
        <div className="grid content-start gap-2">
          <p>{PAYMENT_METHOD_LABELS[order.payment_method]}</p>
          <a href={`tel:${order.phone}`} className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 justify-start" })}>
            <Phone /> {order.phone}
          </a>
          <a
            href={whatsappUrl(order.phone, message)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 justify-start border-[#25D366] text-[#075E54]" })}
          >
            <WhatsAppIcon className="size-4" /> WhatsApp customer
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

/** Pre-filled WhatsApp message that matches the order's current status. */
function customerMessage(order: AdminOrder): string {
  const no = formatOrderNo(order.order_no);
  const hi = `Hi ${order.customer_name.split(" ")[0]}, this is ${siteConfig.name}.`;
  switch (order.status) {
    case "new":
      return `${hi} We received your order ${no} (${formatLKR(order.total)}). Can you confirm the delivery address: ${order.address}, ${order.city}?`;
    case "bought":
      return `${hi} Your order ${no} is being prepared and will be shipped soon.`;
    case "shipped":
      return `${hi} Your order ${no} has been shipped${order.tracking_no ? `. Tracking number: ${order.tracking_no}` : ""}.`;
    case "delivered":
      return `${hi} Your order ${no} was delivered. Thank you for shopping with us!`;
    case "cancelled":
      return `${hi} Your order ${no} has been cancelled.`;
  }
}

function Row({ label, value, strong, className }: { label: string; value: string; strong?: boolean; className?: string }) {
  return (
    <div className={cn("flex justify-between", strong && "text-base font-bold")}>
      <dt className={strong ? "" : "text-muted-foreground"}>{label}</dt>
      <dd className={cn("tabular-nums", className)}>{value}</dd>
    </div>
  );
}
