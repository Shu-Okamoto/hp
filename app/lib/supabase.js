import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase clients — server-only factories.
 *
 * Two flavors so we never leak the service role key to the browser:
 *
 *   serviceClient()  → uses SUPABASE_SERVICE_ROLE_KEY, bypasses RLS,
 *                      reserved for trusted server contexts (API
 *                      routes, async page handlers).
 *   anonClient()     → uses NEXT_PUBLIC_SUPABASE_ANON_KEY, RLS applies.
 *                      Safe to call from anywhere; we use it for public
 *                      reads when we want RLS semantics to enforce the
 *                      access boundary.
 *
 * Both functions return null when the relevant env vars are missing so
 * callers can degrade to seed data instead of crashing.
 */

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

export function isSupabaseConfigured() {
  return !!(url() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let _service = null;
export function serviceClient() {
  if (!isSupabaseConfigured()) return null;
  if (_service) return _service;
  _service = createClient(url(), process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _service;
}

let _anon = null;
export function anonClient() {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url() || !anon) return null;
  if (_anon) return _anon;
  _anon = createClient(url(), anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _anon;
}
