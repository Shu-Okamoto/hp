"use client";
/**
 * Real Instagram adapter — stub.
 *
 * Wraps the Instagram Graph API. Publishing requires a Business / Creator
 * IG account connected to a Facebook Page, plus a long-lived access token.
 *
 * Server routes to implement:
 *   POST /api/instagram/publish
 *   POST /api/instagram/sync
 *
 * Env vars expected at deploy time:
 *   INSTAGRAM_BUSINESS_ID
 *   INSTAGRAM_ACCESS_TOKEN
 */

async function json(res) {
  if (!res.ok) throw new Error(`instagram: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function publish(payload) {
  return json(await fetch("/api/instagram/publish", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  }));
}

export async function sync() {
  return json(await fetch("/api/instagram/sync", { method: "POST" }));
}
