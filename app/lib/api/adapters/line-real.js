"use client";
/**
 * Real LINE adapter — stub.
 *
 * Wraps the LINE Messaging API. Broadcast (free-tier 200 msgs/month, paid
 * beyond) requires a Channel access token and a verified Official Account.
 *
 * Server routes to implement:
 *   POST /api/line/broadcast
 *   POST /api/line/sync
 *
 * Env vars expected at deploy time:
 *   LINE_CHANNEL_ACCESS_TOKEN
 *   LINE_CHANNEL_SECRET
 */

async function json(res) {
  if (!res.ok) throw new Error(`line: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function broadcast(payload) {
  return json(await fetch("/api/line/broadcast", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  }));
}

export async function sync() {
  return json(await fetch("/api/line/sync", { method: "POST" }));
}
