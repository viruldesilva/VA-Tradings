"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormMessage } from "@/components/admin/form-field";
import { useActionForm } from "@/hooks/use-action-form";
import { signIn } from "./actions";

export function LoginForm() {
  const searchParams = useSearchParams();
  const { state, pending, onSubmit } = useActionForm(signIn);

  const forbidden = searchParams.get("error") === "forbidden";
  const message =
    state ?? (forbidden ? { ok: false, message: "That account doesn't have admin access." } : null);

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <input type="hidden" name="next" value={searchParams.get("next") ?? ""} />
      <FormField label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </FormField>
      <FormField label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </FormField>
      <FormMessage state={message} />
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
