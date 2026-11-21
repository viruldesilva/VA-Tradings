import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the current request belongs to an admin and returns a Supabase
 * client acting as them. Call this at the start of every admin data function
 * and Server Action: the proxy only does an optimistic "is logged in" check.
 * Deduplicated per request with React cache().
 */
export const requireAdmin = cache(async () => {
  // Admin data is always per-request. This also allows the auth library's
  // token-expiry checks (Date.now) without prerendering warnings.
  await connection();
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?error=forbidden");

  return {
    supabase,
    userId: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
  };
});
