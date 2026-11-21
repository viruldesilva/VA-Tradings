import Link from "next/link";
import { Suspense } from "react";
import { CircleCheck, Clock, XCircle } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { OrderDetails } from "@/components/order/order-details";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSettings } from "@/lib/data/settings";
import { whatsappUrl } from "@/lib/format";
import { getOrderByToken, type CustomerOrder } from "@/lib/orders/lookup";
import { formatOrderNo } from "@/lib/orders/status";

export const metadata = { title: "Your order", robots: { index: false, follow: false } };

export default function OrderPage(props: PageProps<"/order/[orderNo]">) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
        <OrderContent {...props} />
      </Suspense>
    </div>
  );
}

async function OrderContent({ params, searchParams }: PageProps<"/order/[orderNo]">) {
  const [{ orderNo }, { token }] = await Promise.all([params, searchParams]);
  const order =
    typeof token === "string" && /^\d+$/.test(orderNo)
      ? await getOrderByToken(Number(orderNo), token)
      : null;

  if (!order) {
    return (
      <div className="rounded-xl bg-white p-8 text-center ring-1 ring-foreground/10">
        <h1 className="text-xl font-bold text-brand-dark">Order not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link may be incomplete. You can look up your order with its number and your phone
          number.
        </p>
        <Link href="/track" className={buttonVariants({ className: "mt-5 h-10 px-5" })}>
          Track my order
        </Link>
      </div>
    );
  }

  const { whatsapp_number } = await getSettings();

  return (
    <div className="grid gap-6">
      <ConfirmationHeader order={order} />
      <OrderDetails order={order} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/shop" className={buttonVariants({ variant: "outline", className: "h-11 sm:flex-1" })}>
          Continue shopping
        </Link>
        {whatsapp_number && (
          <a
            href={whatsappUrl(whatsapp_number, `Hi, I have a question about order ${formatOrderNo(order.order_no)}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ className: "h-11 bg-[#25D366] text-white hover:bg-[#1ebe5b] sm:flex-1" })}
          >
            <WhatsAppIcon className="size-5" /> Ask about this order
          </a>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Bookmark this page, or use <Link href="/track" className="underline">Track my order</Link>{" "}
        with order number {formatOrderNo(order.order_no)} and your phone number.
      </p>
    </div>
  );
}

function ConfirmationHeader({ order }: { order: CustomerOrder }) {
  if (order.payment_method === "payhere" && order.payment_status !== "paid") {
    const failed = order.payment_status === "failed";
    const Icon = failed ? XCircle : Clock;
    return (
      <div className="text-center">
        <Icon className={`mx-auto size-14 ${failed ? "text-destructive" : "text-amber-500"}`} aria-hidden />
        <h1 className="mt-3 text-2xl font-bold text-brand-dark">
          {failed ? "Payment failed" : "Waiting for payment confirmation"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {failed
            ? "Your order is saved but the payment didn't go through. Contact us on WhatsApp and we'll help you complete it."
            : "This usually takes a few seconds. Refresh this page to update."}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <CircleCheck className="mx-auto size-14 text-green-600" aria-hidden />
      <h1 className="mt-3 text-2xl font-bold text-brand-dark">Thank you, your order is placed!</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Order number <strong className="text-brand-dark">{formatOrderNo(order.order_no)}</strong>.
        We&apos;ll call {order.phone} to confirm before delivery.
      </p>
    </div>
  );
}
