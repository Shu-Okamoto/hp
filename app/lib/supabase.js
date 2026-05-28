import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase clients — server-only factories.
 *
 * All app tables live in the `hp` schema (internal DX convention).
 * Setting `db.schema` on the client makes every `.from("name")` resolve
 * to `hp.name`, so callers stay free of schema noise.
 *
 *   serviceClient()  → uses SUPABASE_SERVICE_ROLE_KEY, bypasses RLS,
 *                      reserved for trusted server contexts (API
 *                      routes / async server pages writing data).
 *   anonClient()     → uses NEXT_PUBLIC_SUPABASE_ANON_KEY, RLS applies.
 *                      Used for public reads.
 *
 * Both return null when the relevant env vars are missing so callers
 * can degrade to seed data instead of crashing.
 *
 * NOTE: For PostgREST to expose `hp.*` to the API, you must add `hp`
 * to "Exposed schemas" in Supabase Dashboard → Project Settings → API.
 */

const DB_SCHEMA = "hp";

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const commonOptions = {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: DB_SCHEMA },
};

let _service = null;
export function serviceClient() {
  if (!url() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  if (_service) return _service;
  _service = createClient(url(), process.env.SUPABASE_SERVICE_ROLE_KEY, commonOptions);
  return _service;
}

let _anon = null;
export function anonClient() {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url() || !anon) return null;
  if (_anon) return _anon;
  _anon = createClient(url(), anon, commonOptions);
  return _anon;
}
