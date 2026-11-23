import "server-only";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSeoulProductByUrl } from "@/lib/suppliers/seoultrading";

export type SyncResult = {
  productId: string;
  name: string;
  slug: string;
  supplierUrl: string;
  status: "updated" | "unchanged" | "error" | "not_found";
  previousStock: boolean;
  newStock?: boolean;
  previousSupplierPrice: number | null;
  newSupplierPrice?: number | null;
  error?: string;
};

export type SyncSummary = {
  totalChecked: number;
  updated: number;
  unchanged: number;
  failed: number;
  results: SyncResult[];
};

/**
 * Scans all products with a supplier_url from Seoul Trading and synchronizes
 * in_stock status and supplier_price. Invalidates cache tags for any changed products.
 */
export async function syncSeoulTradingProducts(): Promise<SyncSummary> {
  const supabase = createAdminClient();

  // Find all products that have supplier_url set
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, in_stock, product_private!inner(supplier_url, supplier_price)")
    .not("product_private.supplier_url", "is", null);

  if (error) {
    throw new Error(`Failed to query products for sync: ${error.message}`);
  }

  const results: SyncResult[] = [];
  let updatedCount = 0;
  let unchangedCount = 0;
  let failedCount = 0;

  for (const p of products || []) {
    // TypeScript safe extraction of nested product_private
    const priv = Array.isArray(p.product_private) ? p.product_private[0] : p.product_private;
    const supplierUrl = priv?.supplier_url?.trim() ?? "";

    if (!supplierUrl.includes("seoultrading.lk")) {
      continue; // only handle Seoul Trading for now
    }

    try {
      const supplierProduct = await fetchSeoulProductByUrl(supplierUrl);

      if (!supplierProduct) {
        results.push({
          productId: p.id,
          name: p.name,
          slug: p.slug,
          supplierUrl,
          status: "not_found",
          previousStock: p.in_stock,
          previousSupplierPrice: priv?.supplier_price ?? null,
          error: "Product not found on Seoul Trading",
        });
        failedCount++;
        continue;
      }

      const stockChanged = p.in_stock !== supplierProduct.inStock;
      const priceChanged =
        supplierProduct.supplierPrice !== null &&
        priv?.supplier_price !== supplierProduct.supplierPrice;

      if (stockChanged || priceChanged) {
        // Update product stock if changed
        if (stockChanged) {
          const { error: stockErr } = await supabase
            .from("products")
            .update({ in_stock: supplierProduct.inStock })
            .eq("id", p.id);

          if (stockErr) throw stockErr;
        }

        // Update supplier price in product_private if changed
        if (priceChanged && supplierProduct.supplierPrice !== null) {
          const { error: privErr } = await supabase
            .from("product_private")
            .update({ supplier_price: supplierProduct.supplierPrice })
            .eq("product_id", p.id);

          if (privErr) throw privErr;
        }

        // Invalidate Next.js cache so store reflects updated stock immediately
        updateTag(CACHE_TAGS.product(p.slug));
        updateTag(CACHE_TAGS.products);

        results.push({
          productId: p.id,
          name: p.name,
          slug: p.slug,
          supplierUrl,
          status: "updated",
          previousStock: p.in_stock,
          newStock: supplierProduct.inStock,
          previousSupplierPrice: priv?.supplier_price ?? null,
          newSupplierPrice: supplierProduct.supplierPrice,
        });
        updatedCount++;
      } else {
        results.push({
          productId: p.id,
          name: p.name,
          slug: p.slug,
          supplierUrl,
          status: "unchanged",
          previousStock: p.in_stock,
          newStock: supplierProduct.inStock,
          previousSupplierPrice: priv?.supplier_price ?? null,
          newSupplierPrice: supplierProduct.supplierPrice,
        });
        unchangedCount++;
      }
    } catch (err) {
      console.error(`[syncSeoulTradingProducts] Error on product ${p.name} (${p.id}):`, err);
      results.push({
        productId: p.id,
        name: p.name,
        slug: p.slug,
        supplierUrl,
        status: "error",
        previousStock: p.in_stock,
        previousSupplierPrice: priv?.supplier_price ?? null,
        error: err instanceof Error ? err.message : String(err),
      });
      failedCount++;
    }
  }

  return {
    totalChecked: results.length,
    updated: updatedCount,
    unchanged: unchangedCount,
    failed: failedCount,
    results,
  };
}
