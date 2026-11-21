import "server-only";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import type { Category } from "@/lib/types/database";
import type { CategoryInput } from "@/lib/validation/category";
import { uniqueSlug } from "./slugs";

export type CategoryWithCount = Category & { productCount: number };

export async function listCategories(): Promise<Category[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function listCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("name");
  if (error) throw error;

  return data.map(({ products, ...category }) => ({
    ...category,
    productCount: (products as unknown as { count: number }[])[0]?.count ?? 0,
  }));
}

async function resolveSlug(input: CategoryInput, excludeId?: string) {
  const { supabase } = await requireAdmin();
  const base = input.slug || slugify(input.name) || "category";
  return uniqueSlug(supabase, "categories", base, excludeId);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { supabase } = await requireAdmin();
  const slug = await resolveSlug(input);
  const { data, error } = await supabase
    .from("categories")
    .insert({ name: input.name, slug })
    .select("id, name, slug")
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, input: CategoryInput) {
  const { supabase } = await requireAdmin();
  const slug = await resolveSlug(input, id);
  const { error } = await supabase
    .from("categories")
    .update({ name: input.name, slug })
    .eq("id", id);
  if (error) throw error;
}

/** Products in this category keep existing, with no category (FK: on delete set null). */
export async function deleteCategory(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
