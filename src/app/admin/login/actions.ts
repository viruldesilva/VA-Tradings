"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { actionError, type ActionState } from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";
import { formString } from "@/lib/validation/form";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

/** Only allow redirects back into the admin area (no open redirects). */
function safeNext(next: string): string {
  return next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formString(formData, "email").trim(),
    password: formString(formData, "password"),
  });
  if (!parsed.success) return actionError("Enter your email and password.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return actionError("Wrong email or password.");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return actionError("This account doesn't have admin access.");
  }

  redirect(safeNext(formString(formData, "next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
