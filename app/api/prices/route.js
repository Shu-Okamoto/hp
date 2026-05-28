import { auth } from "../../../auth";
import { getPrices, setPrices } from "../../lib/prices-store";

/**
 * Daily prices API.
 *
 * GET  → public read. Returns the array (Supabase-backed; falls back to
 *        seed data when the table is empty or Supabase isn't configured).
 * PUT  → bulk replace. Requires an authenticated admin session
 *        (any role). Returns 503 with a configuration hint when
 *        Supabase isn't connected so the admin UI surfaces the issue.
 *
 * The bulk-replace shape keeps reorder semantics trivial and avoids
 * partial-update races.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const prices = await getPrices();
  return Response.json(prices, {
    headers: {
      // Edge-cache the public read for 30s; admin UI bypasses via no-store.
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}

export async function PUT(req) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const list = await req.json().catch(() => null);
  if (!Array.isArray(list)) {
    return Response.json({ error: "array expected" }, { status: 400 });
  }
  // Light shape validation — rejects obviously malformed entries so we
  // don't poison KV with garbage.
  for (const item of list) {
    if (!item || typeof item.id !== "string" || typeof item.name !== "string") {
      return Response.json({ error: "each item needs id (string) and name (string)" }, { status: 400 });
    }
  }
  try {
    await setPrices(list);
    return Response.json({ ok: true, count: list.length });
  } catch (e) {
    if (e.code === "SUPABASE_NOT_CONFIGURED") {
      return Response.json({
        error: "Supabase not configured",
        hint: "(1) NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY を Vercel の Environment Variables に設定。(2) supabase/migrations/001_prices.sql を Supabase の SQL Editor で実行。(3) Project Settings → API → Exposed schemas に hp を追加。",
      }, { status: 503 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}
