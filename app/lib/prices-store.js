import "server-only";
import { serviceClient, isSupabaseConfigured } from "./supabase";
import { seed } from "./seed";

/**
 * Server-side daily-price store backed by Supabase.
 *
 * Each price is one row in `public.prices`. The admin still sends the
 * full ordered list on every mutation (bulk-replace semantics); we
 * translate that to upsert + delete-not-in to avoid wiping the table
 * in between.
 *
 * The DB schema uses snake_case (`price_jpy`); we translate to/from the
 * camelCase shape that the React components and seed already use.
 *
 * Env (set in Vercel → Project → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL        (or SUPABASE_URL)
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   (public reads with RLS)
 *   SUPABASE_SERVICE_ROLE_KEY       (server-only writes / bypasses RLS)
 *
 * Schema lives in supabase/migrations/001_prices.sql — run it once via
 * Supabase Dashboard → SQL Editor.
 */

const TABLE = "prices";

function fromDb(row) {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    unit: row.unit,
    priceJpy: row.price_jpy,
    visible: row.visible,
    featured: row.featured,
  };
}

function toDb(p, position) {
  return {
    id: p.id,
    name: p.name,
    emoji: p.emoji ?? "🥬",
    unit: p.unit ?? "",
    price_jpy: Number(p.priceJpy) || 0,
    visible: !!p.visible,
    featured: !!p.featured,
    position,
  };
}

export { isSupabaseConfigured };

export async function getPrices() {
  if (!isSupabaseConfigured()) return seed().dailyPrices;
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("position", { ascending: true });
  if (error) {
    console.error("[prices-store] select failed:", error);
    return seed().dailyPrices;
  }
  if (!data || data.length === 0) return seed().dailyPrices;
  return data.map(fromDb);
}

export async function setPrices(list) {
  if (!isSupabaseConfigured()) {
    const err = new Error("SUPABASE_NOT_CONFIGURED");
    err.code = "SUPABASE_NOT_CONFIGURED";
    throw err;
  }
  const supabase = serviceClient();
  const rows = list.map((p, i) => toDb(p, i));
  const ids = rows.map((r) => r.id);

  // Upsert the new/updated rows first — this writes the desired state.
  const { error: upsertErr } = await supabase.from(TABLE).upsert(rows);
  if (upsertErr) throw upsertErr;

  // Then drop anything no longer in the list. Skipping the delete when
  // ids is empty would wipe the table; we never want to do that here
  // (admin must remove rows via explicit operations), but we still
  // guard for the edge case.
  if (ids.length > 0) {
    const { error: delErr } = await supabase
      .from(TABLE)
      .delete()
      .not("id", "in", `(${ids.map((id) => `"${id}"`).join(",")})`);
    if (delErr) throw delErr;
  }
}
