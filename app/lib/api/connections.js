"use client";
/**
 * Connections — surface health/sync status for each external service.
 *
 * `sync(name)` delegates the actual heavy lifting to the matching adapter
 * (e.g. shopify.listProducts / instagram.sync / line.sync) — so flipping
 * `NEXT_PUBLIC_API_MODE` to "real" exercises the real APIs from here too.
 */

import { getRaw, save, sleep, todayISO } from "./store";
import * as shopify from "./shopify";
import * as instagram from "./instagram";
import * as line from "./line";

export async function get() {
  return JSON.parse(JSON.stringify(getRaw().connections));
}

export async function toggle(name, connected) {
  const s = getRaw();
  if (s.connections[name]) {
    s.connections[name].connected = connected;
    save(s);
  }
}

export async function sync(name) {
  try {
    if (name === "shopify")   await shopify.listProducts();
    else if (name === "instagram") await instagram.sync();
    else if (name === "line")      await line.sync();
    else                            await sleep(400);
  } catch (e) {
    console.warn(`[connections] sync(${name}) failed`, e);
  }
  const s = getRaw();
  if (s.connections[name]) {
    s.connections[name].lastSync = todayISO();
    save(s);
  }
}
