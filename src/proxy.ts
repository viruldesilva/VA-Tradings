import type { NextRequest } from "next/server";
import { redirectWithCookies, updateSession } from "@/lib/supabase/proxy";

const LOGIN_PATH = "/admin/login";

/**
 * Guards /admin: refreshes the Supabase session and sends logged-out visitors
 * to the login page. This is an optimistic check; every admin page and Server
 * Action also calls requireAdmin() (src/lib/auth.ts), which checks admin_users.
 */
export async function proxy(request: NextRequest) {
  const { response, isLoggedIn } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!isLoggedIn && pathname !== LOGIN_PATH) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return redirectWithCookies(loginUrl, response);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
