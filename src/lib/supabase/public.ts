import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/**
 * Anonymous, cookie-less Supabase client for public storefront reads
 * (categories, visible products, settings). Because it doesn't touch cookies,
 * it can be used inside "use cache" functions. RLS limits it to public data.
 */
export function createPublicClient() {
  const { url, anonKey } = getPublicSupabaseEnv();
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
