/** Product warranty + condition helpers (safe on client and server). */

export const PRODUCT_CONDITIONS = ["new", "used", "refurbished"] as const;
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: "New",
  used: "Used",
  refurbished: "Refurbished",
};

export const MAX_WARRANTY_MONTHS = 120;

/** 6 → "06 Months", 12 → "1 Year", 24 → "2 Years", null/0 → "No warranty". */
export function formatWarranty(months: number | null): string {
  if (!months) return "No warranty";
  if (months % 12 === 0) {
    const years = months / 12;
    return `${years} ${years === 1 ? "Year" : "Years"}`;
  }
  return `${String(months).padStart(2, "0")} ${months === 1 ? "Month" : "Months"}`;
}
