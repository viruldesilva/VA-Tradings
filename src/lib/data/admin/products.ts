import "server-only";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { PRODUCT_IMAGES_BUCKET, storagePathFromUrl } from "@/lib/storage";
import type { ProductWithPrivate } from "@/lib/types/database";
import type { ProductInput } from "@/lib/validation/product";
import { uniqueSlug } from "./slugs";

export type AdminProduct = ProductWithPrivate & {
  categories: { name: string } | null;
};

const ADMIN_PRODUCT_SELECT = "*, product_private(*), categories(name)";

/** Escapes LIKE wildcards so a search for "100%" matches literally. */
const escapeLike = (term: string) => term.replace(/[\\%_]/g, (c) => `\\${c}`);

export async function listAdminProducts(search?: string): Promise<AdminProduct[]> {
  const { supabase } = await requireAdmin();
  let query = supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  const term = search?.trim();
  if (term) query = query.ilike("name", `%${escapeLike(term)}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data as AdminProduct[];
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as AdminProduct | null;
}

function splitInput(input: ProductInput) {
  const { supplier_price, supplier_url, slug, ...product } = input;
  return { product, slug, privateFields: { supplier_price, supplier_url } };
}

/** Creates a product and its private supplier row. Returns the saved slug. */
export async function createProduct(input: ProductInput): Promise<string> {
  const { supabase } = await requireAdmin();
  const { product, slug: requestedSlug, privateFields } = splitInput(input);
  const slug = await uniqueSlug(
    supabase,
    "products",
    requestedSlug || slugify(product.name) || "product",
  );

  const { data, error } = await supabase
    .from("products")
    .insert({ ...product, slug })
    .select("id")
    .single();
  if (error) throw error;

  const { error: privateError } = await supabase
    .from("product_private")
    .insert({ product_id: data.id, ...privateFields });
  if (privateError) {
    // Keep the two tables consistent: undo the product insert.
    await supabase.from("products").delete().eq("id", data.id);
    throw privateError;
  }
  return slug;
}

/** Updates a product. Returns { slug, previousSlug } for cache invalidation. */
export async function updateProduct(id: string, input: ProductInput) {
  const { supabase } = await requireAdmin();
  const existing = await getAdminProduct(id);
  if (!existing) throw new Error("Product not found");

  const { product, slug: requestedSlug, privateFields } = splitInput(input);
  const slug = await uniqueSlug(
    supabase,
    "products",
    requestedSlug || slugify(product.name) || "product",
    id,
  );

  const { error } = await supabase
    .from("products")
    .update({ ...product, slug })
    .eq("id", id);
  if (error) throw error;

  const { error: privateError } = await supabase
    .from("product_private")
    .upsert({ product_id: id, ...privateFields });
  if (privateError) throw privateError;

  const removedImages = existing.images.filter((url) => !product.images.includes(url));
  await removeImages(removedImages);

  return { slug, previousSlug: existing.slug };
}

/** Deletes a product (private row cascades) and its images. Returns its slug. */
export async function deleteProduct(id: string): Promise<string | null> {
  const { supabase } = await requireAdmin();
  const existing = await getAdminProduct(id);
  if (!existing) return null;

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;

  await removeImages(existing.images);
  return existing.slug;
}

/** Best-effort storage cleanup; a failure here shouldn't fail the save. */
async function removeImages(urls: string[]) {
  const paths = urls.map(storagePathFromUrl).filter((p): p is string => p !== null);
  if (paths.length === 0) return;

  const { supabase } = await requireAdmin();
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  if (error) console.error("[removeImages] storage cleanup failed:", error);
}
