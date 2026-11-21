/**
 * Environment variable access.
 * NEXT_PUBLIC_* vars must be referenced literally so Next.js can inline them
 * into the browser bundle, so each one is read explicitly here.
 */

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Add it to .env.local`);
  }
  return value;
}

export function getPublicSupabaseEnv() {
  return {
    url: required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: required(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ),
  };
}

/** Public site URL without a trailing slash, e.g. "https://vatradings.vercel.app". */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}
