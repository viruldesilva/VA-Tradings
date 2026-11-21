import { z } from "zod";

export const orderUpdateSchema = z.object({
  status: z.enum(["new", "bought", "shipped", "delivered", "cancelled"]),
  payment_status: z.enum(["pending", "paid", "failed"]),
  tracking_no: z
    .string()
    .trim()
    .max(100)
    .transform((v) => v || null),
});
