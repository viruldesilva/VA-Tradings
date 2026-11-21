"use server";

import { updateTag } from "next/cache";
import { actionError, actionOk, type ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { updateSettings } from "@/lib/data/admin/settings";
import { fieldErrors, formString } from "@/lib/validation/form";
import { settingsSchema } from "@/lib/validation/settings";

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = settingsSchema.safeParse({
    delivery_fee: formString(formData, "delivery_fee"),
    shop_phone: formString(formData, "shop_phone"),
    whatsapp_number: formString(formData, "whatsapp_number"),
  });
  if (!parsed.success) return actionError("Please fix the highlighted fields.", fieldErrors(parsed.error));

  try {
    await updateSettings(parsed.data);
  } catch (err) {
    console.error("[saveSettings]", err);
    return actionError("Couldn't save settings. Please try again.");
  }
  updateTag(CACHE_TAGS.settings);
  return actionOk("Settings saved.");
}
