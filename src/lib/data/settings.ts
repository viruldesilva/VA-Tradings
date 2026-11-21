import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createPublicClient } from "@/lib/supabase/public";
import type { Settings } from "@/lib/types/database";

const FALLBACK_SETTINGS: Settings = {
  id: 1,
  delivery_fee: 0,
  shop_phone: null,
  whatsapp_number: null,
};

/**
 * Shop settings (delivery fee, phone, WhatsApp). Cached; the admin settings
 * page will call updateTag(CACHE_TAGS.settings) after saving.
 */
export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag(CACHE_TAGS.settings);

  try {
    const { data, error } = await createPublicClient()
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      cacheLife("hours");
      return data;
    }
  } catch (err) {
    console.error("[getSettings] falling back to defaults:", err);
  }

  // Keep the fallback briefly so a Supabase hiccup recovers within minutes.
  // ("seconds" would be too short to prerender and make every page dynamic.)
  cacheLife("minutes");
  return FALLBACK_SETTINGS;
}
