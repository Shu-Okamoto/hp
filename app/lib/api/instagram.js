"use client";
/**
 * Instagram adapter — post fan-out & sync.
 *
 * MikawaAPI.instagram.* should be called from `news.post()` when a post
 * is routed to the IG channel. The mock implementation just bumps the
 * lastSync timestamp; the real implementation publishes through the
 * Instagram Graph API via a server-side route.
 */

import { getRaw, save, todayISO } from "./store";
import * as real from "./adapters/instagram-real";

const MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

const mock = {
  async publish({ caption, imageUrl } = {}) {
    const s = getRaw();
    s.connections.instagram.lastSync = todayISO();
    save(s);
    return { ok: true, mock: true, caption, imageUrl };
  },
  async sync() {
    const s = getRaw();
    s.connections.instagram.lastSync = todayISO();
    save(s);
  },
};

const impl = MODE === "real" ? real : mock;

export const publish = (...a) => impl.publish(...a);
export const sync    = (...a) => impl.sync(...a);
