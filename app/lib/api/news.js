"use client";
/**
 * News / posts — local-first, with fan-out to external channels.
 *
 * When `post()` is called with channels that include "ig" or "line", the
 * matching adapter's publish/broadcast is invoked. Adapter failures are
 * caught & logged so a local post still succeeds even if a downstream
 * service is misconfigured.
 */

import { getRaw, save, uid, todayISO } from "./store";
import * as instagram from "./instagram";
import * as line from "./line";

export async function list({ source } = {}) {
  return getRaw().posts.filter((p) => !source || source === "all" || p.source === source).slice();
}

export async function post({ title, body, emoji, channels, source }) {
  const s = getRaw();
  const entry = {
    id: uid("n"),
    date: todayISO(),
    title,
    body,
    emoji: emoji || "📣",
    channels: channels || ["web"],
    source: source || (channels && channels[0]) || "web",
  };
  s.posts.unshift(entry);
  save(s);

  // Fire-and-forget fan-out. Errors logged but never thrown — keeping a
  // local post intact even if the downstream service is misconfigured.
  if (channels?.includes("ig")) {
    instagram.publish({ caption: `${title}\n\n${body || ""}` }).catch((e) => console.warn("[news] ig publish failed", e));
  }
  if (channels?.includes("line")) {
    line.broadcast({ title, body }).catch((e) => console.warn("[news] line broadcast failed", e));
  }
  return entry;
}

export async function remove(id) {
  const s = getRaw();
  s.posts = s.posts.filter((p) => p.id !== id);
  save(s);
}
