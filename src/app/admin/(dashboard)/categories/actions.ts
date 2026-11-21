"use server";

import { refresh, updateTag } from "next/cache";
import { actionError, actionOk, type ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createCategory, deleteCategory, updateCategory } from "@/lib/data/admin/categories";
import type { Category } from "@/lib/types/database";
import { categorySchema } from "@/lib/validation/category";
import { fieldErrors, formString } from "@/lib/validation/form";

function invalidate() {
  updateTag(CACHE_TAGS.categories);
  // Product pages show the category name.
  updateTag(CACHE_TAGS.products);
  refresh();
}

/** Create (categoryId = null) or rename a category. */
export async function saveCategory(
  categoryId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = categorySchema.safeParse({
    name: formString(formData, "name"),
    slug: formString(formData, "slug"),
  });
  if (!parsed.success) {
    return actionError("Please fix the highlighted fields.", fieldErrors(parsed.error));
  }

  try {
    if (categoryId) await updateCategory(categoryId, parsed.data);
    else await createCategory(parsed.data);
  } catch (err) {
    console.error("[saveCategory]", err);
    return actionError("Couldn't save the category. Please try again.");
  }

  invalidate();
  return actionOk(categoryId ? "Category updated." : "Category added.");
}

export async function removeCategory(categoryId: string): Promise<ActionState> {
  try {
    await deleteCategory(categoryId);
  } catch (err) {
    console.error("[removeCategory]", err);
    return actionError("Couldn't delete the category. Please try again.");
  }
  invalidate();
  return actionOk("Category deleted.");
}

/**
 * Creates a category from the product form ("+ New category") and returns it,
 * so the form can select it without reloading (and without losing input).
 */
export async function quickCreateCategory(
  name: string,
): Promise<{ ok: true; category: Category } | { ok: false; message: string }> {
  const parsed = categorySchema.safeParse({ name, slug: "" });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Enter a category name" };
  }
  try {
    const category = await createCategory(parsed.data);
    updateTag(CACHE_TAGS.categories);
    return { ok: true, category };
  } catch (err) {
    console.error("[quickCreateCategory]", err);
    return { ok: false, message: "Couldn't add the category. Please try again." };
  }
}
