"use server";

import { refresh, updateTag } from "next/cache";
import { actionError, actionOk, type ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createCategory, deleteCategory, updateCategory } from "@/lib/data/admin/categories";
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
