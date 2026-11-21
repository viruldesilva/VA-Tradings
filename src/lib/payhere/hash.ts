import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * PayHere hashing, per the official Checkout API docs:
 *   hash   = UPPER(md5(merchant_id + order_id + amount + currency + UPPER(md5(merchant_secret))))
 *   md5sig = UPPER(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + UPPER(md5(merchant_secret))))
 * Amounts in the checkout hash use 2 decimals with no thousands separator ("1000.00").
 */

const md5Upper = (value: string) => createHash("md5").update(value).digest("hex").toUpperCase();

export const formatPayHereAmount = (amount: number) => amount.toFixed(2);

export function checkoutHash(params: {
  merchantId: string;
  merchantSecret: string;
  orderId: string;
  amount: number;
  currency: string;
}): string {
  return md5Upper(
    params.merchantId +
      params.orderId +
      formatPayHereAmount(params.amount) +
      params.currency +
      md5Upper(params.merchantSecret),
  );
}

export function isValidNotifySignature(params: {
  merchantId: string;
  merchantSecret: string;
  orderId: string;
  payhereAmount: string;
  payhereCurrency: string;
  statusCode: string;
  md5sig: string;
}): boolean {
  const expected = md5Upper(
    params.merchantId +
      params.orderId +
      params.payhereAmount +
      params.payhereCurrency +
      params.statusCode +
      md5Upper(params.merchantSecret),
  );
  const received = params.md5sig.toUpperCase();
  return (
    expected.length === received.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  );
}
