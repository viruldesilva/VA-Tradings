/**
 * Integration for distributor: Seoul Trading (seoultrading.lk)
 *
 * Interacts with the public WooCommerce Store API (/wp-json/wc/store/v1/products)
 * to fetch real-time availability, wholesale/supplier price, and product details.
 */

export type SeoulProductDetails = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  inStock: boolean;
  supplierPrice: number | null;
  regularPrice: number | null;
  salePrice: number | null;
  descriptionHtml: string;
  shortDescriptionHtml: string;
  images: string[];
  categories: string[];
};

/**
 * Extracts the product slug from a Seoul Trading URL.
 * Supports:
 * - https://seoultrading.lk/product/jedel-gwh-111/
 * - https://seoultrading.lk/product/jedel-gwh-111
 * - https://seoultrading.lk/?slug=jedel-gwh-111
 */
export function extractSeoulSlug(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("seoultrading.lk")) return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    const productIdx = parts.indexOf("product");
    if (productIdx !== -1 && parts[productIdx + 1]) {
      return decodeURIComponent(parts[productIdx + 1]);
    }

    // Direct slug param fallback
    const slugParam = parsed.searchParams.get("slug");
    if (slugParam) return slugParam;

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch product details from Seoul Trading using the Store API.
 */
export async function fetchSeoulProductBySlug(slug: string): Promise<SeoulProductDetails | null> {
  const endpoint = `https://seoultrading.lk/wp-json/wc/store/v1/products?slug=${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 0 }, // always fresh from supplier
    });

    if (!res.ok) {
      console.warn(`[seoultrading] HTTP ${res.status} fetching slug: ${slug}`);
      return null;
    }

    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) {
      return null;
    }

    const item = items[0];
    const prices = item.prices ?? {};
    // Prices are returned as strings in cents (e.g. "530000" for Rs. 5300)
    const rawPrice = prices.price ? Number(prices.price) / 100 : null;
    const rawRegular = prices.regular_price ? Number(prices.regular_price) / 100 : null;
    const rawSale = prices.sale_price ? Number(prices.sale_price) / 100 : null;

    return {
      id: item.id,
      name: item.name ?? "",
      slug: item.slug ?? slug,
      permalink: item.permalink ?? "",
      inStock: Boolean(item.is_in_stock),
      supplierPrice: rawPrice,
      regularPrice: rawRegular,
      salePrice: rawSale,
      descriptionHtml: item.description ?? "",
      shortDescriptionHtml: item.short_description ?? "",
      images: Array.isArray(item.images) ? item.images.map((img: { src: string }) => img.src) : [],
      categories: Array.isArray(item.categories) ? item.categories.map((c: { name: string }) => c.name) : [],
    };
  } catch (err) {
    console.error(`[seoultrading] Error fetching product ${slug}:`, err);
    return null;
  }
}

/**
 * Convenience helper to fetch by full supplier URL.
 */
export async function fetchSeoulProductByUrl(url: string): Promise<SeoulProductDetails | null> {
  const slug = extractSeoulSlug(url);
  if (!slug) return null;
  return fetchSeoulProductBySlug(slug);
}
