import "server-only";
import { kv } from "@vercel/kv";
import { seed } from "./seed";

/**
 * Server-side daily-price store.
 *
 * Vercel KV (Upstash Redis) holds a single JSON blob under `prices:v1`
 * — the full ordered array, replaced on every write. Sufficient for the
 * 10–20 row daily-price board; saves the complexity of per-row keys.
 *
 * When KV env vars aren't present (local dev, or before the user has
 * provisioned KV in Vercel Storage), reads fall back to `seed()` so the
 * site stays fully renderable, and writes return KV_NOT_CONFIGURED for
 * the route handler to translate into a 503.
 *
 * Env (Vercel auto-injects after Storage → Create KV → Connect):
 *   KV_REST_API_URL
 *   KV_REST_API_TOKEN
 *   KV_REST_API_READ_ONLY_TOKEN  (optional, for public GETs)
 */

const KEY = "prices:v1";

export function isKvConfigured() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function getPrices() {
  if (!isKvConfigured()) return seed().dailyPrices;
  try {
    const stored = await kv.get(KEY);
    if (Array.isArray(stored)) return stored;
  } catch (e) {
    console.error("[prices-store] KV read failed:", e);
  }
  return seed().dailyPrices;
}

export async function setPrices(list) {
  if (!isKvConfigured()) {
    const err = new Error("KV_NOT_CONFIGURED");
    err.code = "KV_NOT_CONFIGURED";
    throw err;
  }
  await kv.set(KEY, list);
}
