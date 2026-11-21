/**
 * Sri Lankan mobile numbers. Accepts "077 123 4567", "077-1234567",
 * "+94771234567", "94771234567" and returns the canonical "0771234567",
 * or null if it isn't a valid 07XXXXXXXX mobile number.
 */
export function normalizeLKPhone(input: string): string | null {
  let digits = input.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+94")) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith("94") && digits.length === 11) digits = `0${digits.slice(2)}`;
  return /^07\d{8}$/.test(digits) ? digits : null;
}
