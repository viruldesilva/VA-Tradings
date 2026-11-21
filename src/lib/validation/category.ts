import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80, "Name is too long"),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and hyphens only"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
