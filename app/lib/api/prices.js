"use client";
/**
 * Daily-price board — bespoke, local-only.
 *
 * Reflects the morning chalkboard price tags. There's no external service
 * to mirror these against; the store is the source of truth.
 */

import { getRaw, save, uid } from "./store";

export async function list() {
  return getRaw().dailyPrices.slice();
}

export async function update(id, patch) {
  const s = getRaw();
  const idx = s.dailyPrices.findIndex((p) => p.id === id);
  if (idx >= 0) s.dailyPrices[idx] = { ...s.dailyPrices[idx], ...patch };
  save(s);
}

export async function setFeatured(id) {
  const s = getRaw();
  s.dailyPrices = s.dailyPrices.map((p) =>
    ({ ...p, featured: p.id === id ? true : p.featured })
  );
  save(s);
}

export async function create(item) {
  const s = getRaw();
  s.dailyPrices.unshift({ id: uid("v"), visible: true, featured: false, ...item });
  save(s);
}

export async function remove(id) {
  const s = getRaw();
  s.dailyPrices = s.dailyPrices.filter((p) => p.id !== id);
  save(s);
}
