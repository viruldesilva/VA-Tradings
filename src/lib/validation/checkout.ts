import { z } from "zod";
import { MAX_QTY_PER_ITEM } from "@/lib/cart/store";
import { normalizeLKPhone } from "@/lib/phone";

export const cartLineSchema = z.object({
  productId: z.uuid(),
  qty: z.number().int().min(1).max(MAX_QTY_PER_ITEM),
});

export const cartLinesSchema = z.array(cartLineSchema).min(1, "Your cart is empty").max(50);

export const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "Enter your name").max(100),
  phone: z
    .string()
    .transform((v, ctx) => {
      const phone = normalizeLKPhone(v);
      if (!phone) {
        ctx.addIssue({ code: "custom", message: "Enter a mobile number like 0771234567" });
        return z.NEVER;
      }
      return phone;
    }),
  address: z.string().trim().min(5, "Enter your full delivery address").max(300),
  city: z.string().trim().min(2, "Enter your city").max(60),
  notes: z
    .string()
    .trim()
    .max(500)
    .transform((v) => v || null)
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  payment_method: z.enum(["cod", "payhere"], { error: "Choose a payment method" }),
  items: cartLinesSchema,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CartLineInput = z.infer<typeof cartLineSchema>;
