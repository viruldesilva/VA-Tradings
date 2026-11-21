"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import type { ActionState } from "@/lib/action-state";
import type { Settings } from "@/lib/types/database";
import { FormField, FormMessage } from "./form-field";

export function SettingsForm({
  settings,
  action,
}: {
  settings: Settings;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const { state, pending, onSubmit } = useActionForm(action);
  const err = (f: string) => state?.fieldErrors?.[f]?.[0];

  return (
    <form onSubmit={onSubmit} className="grid max-w-md gap-4 rounded-xl bg-white p-4 ring-1 ring-foreground/10 sm:p-6">
      <FormField label="Delivery fee (Rs.)" htmlFor="delivery_fee" error={err("delivery_fee")} hint="Added to every order. Use 0 for free delivery.">
        <Input id="delivery_fee" name="delivery_fee" type="number" inputMode="decimal" min={0} step="0.01" defaultValue={settings.delivery_fee} />
      </FormField>
      <FormField label="Shop phone" htmlFor="shop_phone" error={err("shop_phone")} hint="Shown in the footer.">
        <Input id="shop_phone" name="shop_phone" type="tel" defaultValue={settings.shop_phone ?? ""} placeholder="011 234 5678" />
      </FormField>
      <FormField label="WhatsApp number" htmlFor="whatsapp_number" error={err("whatsapp_number")} hint="Used by the WhatsApp buttons. Leave blank to hide them.">
        <Input id="whatsapp_number" name="whatsapp_number" type="tel" defaultValue={settings.whatsapp_number ?? ""} placeholder="07X XXX XXXX" />
      </FormField>
      <FormMessage state={state} />
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
