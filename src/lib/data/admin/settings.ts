import "server-only";
import { requireAdmin } from "@/lib/auth";
import type { Settings } from "@/lib/types/database";
import type { SettingsInput } from "@/lib/validation/settings";

export async function getAdminSettings(): Promise<Settings> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data;
}

export async function updateSettings(input: SettingsInput) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("settings").update(input).eq("id", 1);
  if (error) throw error;
}
