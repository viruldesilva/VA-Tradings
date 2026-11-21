/**
 * Cache tags for "use cache" storefront data. Admin mutations call
 * updateTag(...) with these so shop pages show changes immediately.
 */
export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  settings: "settings",
  product: (slug: string) => `product:${slug}`,
} as const;
