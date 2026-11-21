const lkrFormatter = new Intl.NumberFormat("en-LK", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 4500 → "Rs. 4,500", -200 → "-Rs. 200" */
export function formatLKR(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}Rs. ${lkrFormatter.format(Math.abs(amount))}`;
}

/**
 * Normalises a Sri Lankan phone number to international digits for wa.me links.
 * "077 123 4567" / "+94771234567" / "0771234567" → "94771234567"
 */
export function toInternationalLK(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("94")) return digits;
  if (digits.startsWith("0")) return `94${digits.slice(1)}`;
  return digits;
}

/** Builds a WhatsApp click-to-chat URL, optionally with a pre-filled message. */
export function whatsappUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${toInternationalLK(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
