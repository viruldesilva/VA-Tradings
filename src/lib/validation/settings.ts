import { z } from "zod";
import { normalizeLKPhone } from "@/lib/phone";
import { emptyToNull } from "./form";

export const settingsSchema = z.object({
  delivery_fee: z.preprocess(
    (v) => (emptyToNull(v) === null ? undefined : Number(v)),
    z.number({ error: "Enter the delivery fee" }).min(0).max(100_000),
  ),
  shop_phone: z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .regex(/^[+\d][\d\s-]{6,18}$/, "Enter a valid phone number")
      .nullable(),
  ),
  whatsapp_number: z.preprocess(
    emptyToNull,
    z
      .string()
      .transform((v, ctx) => {
        const phone = normalizeLKPhone(v);
        if (!phone) {
          ctx.addIssue({ code: "custom", message: "Enter a mobile number like 0771234567" });
          return z.NEVER;
        }
        return phone;
      })
      .nullable(),
  ),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
