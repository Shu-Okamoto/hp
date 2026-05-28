import "server-only";
import { serviceClient, anonClient } from "./supabase";
import { seed } from "./seed";

/**
 * Server-side product store backed by `hp.products`.
 *
 * Bulk-replace semantics on writes (same shape as prices) — the admin
 * keeps a single working list and pushes it as a unit. RLS allows anon
 * SELECT on visible=true rows.
 */

const TABLE = "products";

function fromDb(r) {
  return {
    id: r.id,
    handle: r.handle,
    title: r.title,
    priceJpy: r.price_jpy,
    unit: r.unit || "",
    category: r.category || "",
    desc: r.description || "",
    imgTone: r.img_tone || "",
    imageUrl: r.image_url || undefined,
    visible: r.visible,
  };
}

function toDb(p, position) {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    price_jpy: Number(p.priceJpy) || 0,
    unit: p.unit || "",
    category: p.category || "",
    description: p.desc || "",
    img_tone: p.imgTone || "",
    image_url: p.imageUrl || null,
    visible: p.visible !== false,
    position,
  };
}

export async function getProducts({ includeHidden = false } = {}) {
  const supabase = includeHidden ? serviceClient() : (anonClient() || serviceClient());
  if (!supabase) return seed().products;
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("position", { ascending: true });
  if (error) {
    console.error("[products-store] select failed:", error);
    return seed().products;
  }
  if (!data || data.length === 0) return seed().products;
  return data.map(fromDb);
}

export async function getProduct(handle) {
  const supabase = anonClient() || serviceClient();
  if (!supabase) return seed().products.find((p) => p.handle === handle) || null;
  const { data, error } = await supabase.from(TABLE).select("*").eq("handle", handle).maybeSingle();
  if (error) {
    console.error("[products-store] select one failed:", error);
    return seed().products.find((p) => p.handle === handle) || null;
  }
  return data ? fromDb(data) : null;
}

export async function setProducts(list) {
  const supabase = serviceClient();
  if (!supabase) {
    const e = new Error("SUPABASE_NOT_CONFIGURED");
    e.code = "SUPABASE_NOT_CONFIGURED";
    throw e;
  }
  const rows = list.map((p, i) => toDb(p, i));
  const ids = rows.map((r) => r.id);
  const { error: upsertErr } = await supabase.from(TABLE).upsert(rows);
  if (upsertErr) throw upsertErr;
  if (ids.length > 0) {
    const { error: delErr } = await supabase
      .from(TABLE)
      .delete()
      .not("id", "in", `(${ids.map((id) => `"${id}"`).join(",")})`);
    if (delErr) throw delErr;
  }
}
