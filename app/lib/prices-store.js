import "server-only";
import { serviceClient, anonClient } from "./supabase";
import { seed } from "./seed";

/**
 * Server-side daily-price store backed by Supabase.
 *
 * Reads go through the anon client (gated by an "anyone can read"
 * RLS policy on public.prices). Writes go through the service role
 * client, which bypasses RLS — required because we authenticate the
 * admin via Auth.js, not Supabase Auth, so we have no per-user JWT to
 * present.
 *
 * If only the service role is configured (e.g. before NEXT_PUBLIC_
 * keys are set), reads transparently fall back to it so the site
 * keeps working.
 *
 * Env (set in Vercel → Project → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL        — project URL, public
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   — public reads with RLS
 *   SUPABASE_SERVICE_ROLE_KEY       — server-only writes (secret)
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

export async function getPrices() {
  // Reads prefer the anon client (RLS-gated); fall back to the service
  // role when anon isn't configured so partial setups still serve data.
  const supabase = anonClient() || serviceClient();
  if (!supabase) return seed().dailyPrices;
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
  const supabase = serviceClient();
  if (!supabase) {
    const err = new Error("SUPABASE_NOT_CONFIGURED");
    err.code = "SUPABASE_NOT_CONFIGURED";
    throw err;
  }
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
