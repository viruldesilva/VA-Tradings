/** Shop sort options. Kept separate from catalog.ts (server-only) so client components can import them. */
export type ProductSort = "newest" | "price-asc" | "price-desc";

export const PRODUCT_SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function parseSort(value: unknown): ProductSort {
  return PRODUCT_SORTS.some((s) => s.value === value) ? (value as ProductSort) : "newest";
}
