import "server-only";
import { getSiteUrl } from "@/lib/env";
import type { CustomerOrder } from "@/lib/orders/lookup";
import { formatOrderNo } from "@/lib/orders/status";
import { getPayHereConfig } from "./config";
import { checkoutHash, formatPayHereAmount } from "./hash";

/** Hidden form fields for posting an order to PayHere checkout (everything except email). */
export function buildPayHereFields(order: CustomerOrder, token: string) {
  const { merchantId, merchantSecret, checkoutUrl } = getPayHereConfig();
  const site = getSiteUrl();
  const orderId = String(order.order_no);
  const currency = "LKR";
  const query = `token=${encodeURIComponent(token)}`;

  const [firstName, ...rest] = order.customer_name.trim().split(/\s+/);

  return {
    checkoutUrl,
    fields: {
      merchant_id: merchantId,
      return_url: `${site}/order/${orderId}?${query}`,
      cancel_url: `${site}/pay/${orderId}?${query}&cancelled=1`,
      notify_url: `${site}/api/payhere/notify`,
      order_id: orderId,
      items: `Order ${formatOrderNo(order.order_no)}`,
      currency,
      amount: formatPayHereAmount(order.total),
      first_name: firstName,
      last_name: rest.join(" ") || firstName,
      phone: order.phone,
      address: order.address.replace(/\s+/g, " ").slice(0, 100),
      city: order.city,
      country: "Sri Lanka",
      hash: checkoutHash({ merchantId, merchantSecret, orderId, amount: order.total, currency }),
    },
  };
}
