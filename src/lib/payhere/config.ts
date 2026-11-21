import "server-only";

/** True when PayHere credentials are set (card payments are offered at checkout). */
export function isPayHereConfigured(): boolean {
  return Boolean(process.env.PAYHERE_MERCHANT_ID && process.env.PAYHERE_MERCHANT_SECRET);
}

export function getPayHereConfig() {
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantId || !merchantSecret) throw new Error("PayHere is not configured");

  // Sandbox unless explicitly switched to live.
  const sandbox = process.env.PAYHERE_SANDBOX !== "false";
  return {
    merchantId,
    merchantSecret,
    sandbox,
    // Live URL must include "www" (PayHere docs, error PH-0022).
    checkoutUrl: sandbox
      ? "https://sandbox.payhere.lk/pay/checkout"
      : "https://www.payhere.lk/pay/checkout",
  };
}
