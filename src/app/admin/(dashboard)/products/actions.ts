"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { actionError, actionOk, type ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createProduct, deleteProduct, updateProduct } from "@/lib/data/admin/products";
import { fieldErrors, formBoolean, formString } from "@/lib/validation/form";
import { productSchema } from "@/lib/validation/product";

function parseImages(raw: string): unknown {
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return null;
  }
}

/** Create (productId = null) or update a product. Bound with the id in the form. */
export async function saveProduct(
  productId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = productSchema.safeParse({
    name: formString(formData, "name"),
    slug: formString(formData, "slug"),
    description: formString(formData, "description"),
    price: formString(formData, "price"),
    supplier_price: formString(formData, "supplier_price"),
    supplier_url: formString(formData, "supplier_url").trim(),
    category_id: formString(formData, "category_id"),
    warranty_months: formString(formData, "warranty_months"),
    condition: formString(formData, "condition") || "new",
    in_stock: formBoolean(formData, "in_stock"),
    is_visible: formBoolean(formData, "is_visible"),
    images: parseImages(formString(formData, "images")),
  });

  if (!parsed.success) {
    return actionError("Please fix the highlighted fields.", fieldErrors(parsed.error));
  }

  try {
    if (productId) {
      const { slug, previousSlug } = await updateProduct(productId, parsed.data);
      updateTag(CACHE_TAGS.product(slug));
      if (previousSlug !== slug) updateTag(CACHE_TAGS.product(previousSlug));
    } else {
      const slug = await createProduct(parsed.data);
      updateTag(CACHE_TAGS.product(slug));
    }
    updateTag(CACHE_TAGS.products);
  } catch (err) {
    console.error("[saveProduct]", err);
    return actionError("Couldn't save the product. Please try again.");
  }

  redirect("/admin/products");
}

export async function removeProduct(productId: string): Promise<ActionState> {
  try {
    const slug = await deleteProduct(productId);
    if (slug) updateTag(CACHE_TAGS.product(slug));
    updateTag(CACHE_TAGS.products);
  } catch (err) {
    console.error("[removeProduct]", err);
    return actionError("Couldn't delete the product. Please try again.");
  }
  refresh();
  return actionOk("Product deleted.");
}
