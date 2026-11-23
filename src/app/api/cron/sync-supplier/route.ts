import { NextResponse } from "next/server";
import { syncSeoulTradingProducts } from "@/lib/suppliers/sync";

export const dynamic = "force-dynamic";

/**
 * Cron handler to sync product availability and prices from Seoul Trading.
 *
 * Can be triggered by:
 * 1. Vercel Cron (sends Authorization: Bearer <CRON_SECRET>)
 * 2. Manual GET request with ?key=<CRON_SECRET>
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const keyParam = searchParams.get("key");

    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` || keyParam === cronSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const summary = await syncSeoulTradingProducts();
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      summary,
    });
  } catch (err) {
    console.error("[api/cron/sync-supplier] Error during sync:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}
