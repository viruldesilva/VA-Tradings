import { z } from "zod";
import { MAX_WARRANTY_MONTHS, PRODUCT_CONDITIONS } from "@/lib/product-details";
import { isProductImageUrl, MAX_IMAGES_PER_PRODUCT } from "@/lib/storage";
import { emptyToNull } from "./form";

const money = (label: string) =>
  z
    .number({ error: `Enter the ${label}` })
    .min(0, `${label} can't be negative`)
    .max(10_000_000, `${label} is too large`);

const moneyField = (label: string) =>
  z.preprocess((v) => (emptyToNull(v) === null ? undefined : Number(v)), money(label));

const optionalMoneyField = (label: string) =>
  z.preprocess((v) => (emptyToNull(v) === null ? null : Number(v)), money(label).nullable());

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(200, "Name is too long"),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and hyphens only"),
  description: z.string().trim().max(10_000),
  price: moneyField("Price"),
  supplier_price: optionalMoneyField("Supplier price"),
  supplier_url: z.preprocess(
    emptyToNull,
    z.url({ protocol: /^https?$/, error: "Enter a full link starting with https://" }).nullable(),
  ),
  category_id: z.preprocess(emptyToNull, z.uuid("Pick a category").nullable()),
  brand: z.preprocess(emptyToNull, z.string().trim().max(60, "Brand is too long").nullable()),
  warranty_months: z.preprocess(
    (v) => (emptyToNull(v) === null ? null : Number(v)),
    z
      .number({ error: "Enter the warranty in months" })
      .int("Use whole months")
      .min(0, "Warranty can't be negative")
      .max(MAX_WARRANTY_MONTHS, `Up to ${MAX_WARRANTY_MONTHS} months`)
      .nullable(),
  ),
  condition: z.enum(PRODUCT_CONDITIONS, { error: "Pick a condition" }),
  in_stock: z.boolean(),
  is_visible: z.boolean(),
  images: z
    .array(z.string().refine(isProductImageUrl, "Invalid image"))
    .max(MAX_IMAGES_PER_PRODUCT, `Up to ${MAX_IMAGES_PER_PRODUCT} images`),
});

export type ProductInput = z.infer<typeof productSchema>;
