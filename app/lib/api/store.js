"use client";
/**
 * Local store — the backbone of the prototype.
 *
 * Persists state to localStorage and dispatches `mikawa:store-changed`
 * CustomEvents so subscribers re-render. All service modules read & write
 * through `getState()` / `save()`.
 *
 * SSR-safe: during server render, `getState()` returns seed data without
 * touching `localStorage` or `window`.
 */

import { seed } from "../seed";

// Storage version. Bump this when seed shape changes in a way that
// breaks older cached data (e.g. shop.x/y → shop.lat/lng), to force
// every browser to re-seed on next visit.
const STORAGE_KEY = "mikawa:store:v2";
const CHANNEL = "mikawa:store-changed";

const isClient = () => typeof window !== "undefined";
const today = () => new Date().toISOString().slice(0, 10);

export { seed };

function load() {
  if (!isClient()) return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw);
    if (!parsed.meta || parsed.meta.version !== 1) return seed();
    return parsed;
  } catch (e) {
    console.warn("[store] failed to load, reseeding", e);
    return seed();
  }
}

let _state = null;
export function getRaw() {
  if (_state === null) _state = load();
  return _state;
}

export function getState() {
  return JSON.parse(JSON.stringify(getRaw()));
}

export function save(next) {
  _state = next;
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    window.dispatchEvent(new CustomEvent(CHANNEL, { detail: _state }));
  } catch (e) {
    console.warn("[store] save failed", e);
  }
}

export function reset() {
  _state = seed();
  save(_state);
  return _state;
}

export function on(callback) {
  if (!isClient()) return () => {};
  const fn = (e) => callback(e.detail);
  const storageFn = () => { _state = load(); callback(_state); };
  window.addEventListener(CHANNEL, fn);
  window.addEventListener("storage", storageFn);
  return () => {
    window.removeEventListener(CHANNEL, fn);
    window.removeEventListener("storage", storageFn);
  };
}

export const uid = (p) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const todayISO = today;
