import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import type { Category, Product } from "@/lib/types/database";
import type { ProductSort } from "./catalog-options";

/**
 * Public storefront reads. All cached with "use cache" and tagged so admin
 * changes (updateTag in Server Actions) show up immediately. Uses the anon
 * client, so RLS guarantees only visible products, and never supplier data.
 */

export type ShopProduct = Omit<Product, "is_visible"> & {
  categories: Pick<Category, "name" | "slug"> | null;
};


const SHOP_PRODUCT_SELECT =
  "id, name, slug, description, price, in_stock, images, category_id, created_at, categories(name, slug)";

const escapeLike = (term: string) => term.replace(/[\\%_]/g, (c) => `\\${c}`);

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag(CACHE_TAGS.categories);

  const result = await tryQuery("getCategories", async () => {
    const { data, error } = await createPublicClient()
      .from("categories")
      .select("id, name, slug")
      .order("name");
    if (error) throw error;
    return data;
  });

  if (!result.ok) {
    cacheLife("minutes"); // retry soon
    return [];
  }
  cacheLife("hours");
  return result.data;
}

export async function getProducts(
  options: { categorySlug?: string; search?: string; sort?: ProductSort; limit?: number } = {},
): Promise<ShopProduct[]> {
  "use cache";
  cacheTag(CACHE_TAGS.products);

  const { categorySlug, search, sort = "newest", limit = 60 } = options;

  const result = await tryQuery("getProducts", async () => {
    let query = createPublicClient().from("products").select(SHOP_PRODUCT_SELECT);

    if (categorySlug) {
      const category = (await getCategories()).find((c) => c.slug === categorySlug);
      if (!category) return [];
      query = query.eq("category_id", category.id);
    }

    const term = search?.trim();
    if (term) query = query.ilike("name", `%${escapeLike(term)}%`);

    query =
      sort === "newest"
        ? query.order("created_at", { ascending: false })
        : query.order("price", { ascending: sort === "price-asc" });

    const { data, error } = await query.limit(limit);
    if (error) throw error;
    return data as ShopProduct[];
  });

  if (!result.ok) {
    cacheLife("minutes"); // retry soon
    return [];
  }
  cacheLife("hours");
  return result.data;
}

export async function getProductBySlug(slug: string): Promise<ShopProduct | null> {
  "use cache";
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.product(slug));
  cacheLife("hours");

  // Errors propagate so a DB outage shows the error page, not "not found".
  const { data, error } = await createPublicClient()
    .from("products")
    .select(SHOP_PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`[getProductBySlug] ${error.message}`);
  return data as ShopProduct | null;
}

/** Other products from the same category, for "You may also like". */
export async function getRelatedProducts(product: ShopProduct, limit = 4) {
  if (!product.categories) return [];
  const products = await getProducts({ categorySlug: product.categories.slug, limit: limit + 1 });
  return products.filter((p) => p.id !== product.id).slice(0, limit);
}

/**
 * Runs a listing query; on failure (DB down, or env vars missing during a
 * build) logs it and reports ok: false so callers can show an empty list and
 * cache that only briefly.
 */
async function tryQuery<T>(
  label: string,
  run: () => Promise<T>,
): Promise<{ ok: true; data: T } | { ok: false }> {
  try {
    return { ok: true, data: await run() };
  } catch (err) {
    console.error(`[${label}]`, err instanceof Error ? err.message : err);
    return { ok: false };
  }
}
