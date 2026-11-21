import { z } from "zod";

/** Treats "" / missing form values as null. */
export const emptyToNull = (value: unknown) =>
  value === "" || value === undefined || value === null ? null : value;

/** Reads a string field from FormData ("" when missing). */
export const formString = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

/** Switch / checkbox fields submit "on" when checked and nothing otherwise. */
export const formBoolean = (formData: FormData, key: string): boolean =>
  formData.get(key) === "on";

export const fieldErrors = (error: z.ZodError) =>
  z.flattenError(error).fieldErrors as Partial<Record<string, string[]>>;
