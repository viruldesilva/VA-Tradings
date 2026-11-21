import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * Returns `base`, or `base-2`, `base-3`… if it's already used by another row.
 */
export async function uniqueSlug(
  supabase: SupabaseClient<Database>,
  table: "products" | "categories",
  base: string,
  excludeId?: string,
): Promise<string> {
  const { data, error } = await supabase
    .from(table)
    .select("id, slug")
    .like("slug", `${base}%`);
  if (error) throw error;

  const taken = new Set(data.filter((row) => row.id !== excludeId).map((row) => row.slug));
  if (!taken.has(base)) return base;

  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
