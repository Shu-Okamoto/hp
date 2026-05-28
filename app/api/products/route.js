import { auth } from "../../../auth";
import { getProducts, setProducts } from "../../lib/products-store";

/**
 * Products API.
 *
 * GET → public list (RLS filters out hidden rows).
 * PUT → bulk-replace, admin-only. Same shape as /api/prices.
 *
 * Hidden products are also visible to owners (we pass includeHidden=true
 * via the admin client, which uses the same endpoint — the route doesn't
 * differentiate yet; ProductManager always wants the full list).
 */

export const dynamic = "force-dynamic";

export async function GET(req) {
  const includeHidden = new URL(req.url).searchParams.get("all") === "1";
  // includeHidden requires the service role internally; if the caller
  // isn't authenticated, silently ignore the flag.
  let auth_ok = false;
  if (includeHidden) {
    const session = await auth();
    auth_ok = !!session?.user;
  }
  const products = await getProducts({ includeHidden: includeHidden && auth_ok });
  return Response.json(products, {
    headers: { "Cache-Control": includeHidden ? "no-store" : "public, s-maxage=30, stale-while-revalidate=60" },
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
  for (const p of list) {
    if (!p || typeof p.id !== "string" || typeof p.handle !== "string" || typeof p.title !== "string") {
      return Response.json({ error: "each product needs id, handle, title (string)" }, { status: 400 });
    }
  }
  try {
    await setProducts(list);
    return Response.json({ ok: true, count: list.length });
  } catch (e) {
    if (e.code === "SUPABASE_NOT_CONFIGURED") {
      return Response.json({
        error: "Supabase not configured",
        hint: "001 + 003 マイグレーションを実行し、env を設定してください。",
      }, { status: 503 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}
