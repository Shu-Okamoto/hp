"use client";
/**
 * LINE adapter — broadcast & sync.
 *
 * MikawaAPI.line.* is called from `news.post()` when a post is routed
 * to the LINE channel. The mock just bumps lastSync; the real adapter
 * sends a Messaging API broadcast via a server route.
 */

import { getRaw, save, todayISO } from "./store";
import * as real from "./adapters/line-real";

const MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

const mock = {
  async broadcast({ title, body } = {}) {
    const s = getRaw();
    s.connections.line.lastSync = todayISO();
    save(s);
    return { ok: true, mock: true, title, body };
  },
  async sync() {
    const s = getRaw();
    s.connections.line.lastSync = todayISO();
    save(s);
  },
};

const impl = MODE === "real" ? real : mock;

export const broadcast = (...a) => impl.broadcast(...a);
export const sync      = (...a) => impl.sync(...a);
