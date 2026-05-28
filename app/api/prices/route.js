import { auth } from "../../../auth";
import { getPrices, setPrices, isKvConfigured } from "../../lib/prices-store";

/**
 * Daily prices API.
 *
 * GET  → public read. Returns the array (KV-backed; falls back to seed
 *        data when KV isn't configured).
 * PUT  → bulk replace. Requires an authenticated admin session
 *        (any role). Returns 503 with a configuration hint when KV
 *        isn't provisioned so the admin UI can surface the issue.
 *
 * The bulk-replace shape is intentional — the admin's PriceManager
 * always sends the full ordered list, which keeps reorder semantics
 * trivial and avoids partial-update races.
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
    if (e.code === "KV_NOT_CONFIGURED") {
      return Response.json({
        error: "Vercel KV not configured",
        hint: "Vercel ダッシュボードの Storage タブで KV データベースを作成し、プロジェクトに接続してください。",
      }, { status: 503 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}
