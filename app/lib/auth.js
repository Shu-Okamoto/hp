"use client";
/**
 * Auth — prototype-grade session for the admin console.
 *
 * Two hardcoded accounts power the role demo:
 *   - admin / admin → owner (sees everything)
 *   - staff / staff → staff (sees クイック投稿 + 価格管理 only)
 *
 * Sessions live in localStorage (`mikawa:auth:v1`); subscribers can re-
 * render via `on(callback)`. This is **not** production auth — replace
 * with real identity (NextAuth, Clerk, etc.) before going live.
 */

const STORAGE_KEY = "mikawa:auth:v1";
const CHANNEL = "mikawa:auth-changed";
const isClient = () => typeof window !== "undefined";

const ACCOUNTS = [
  { user: "admin", pass: "admin", role: "owner", name: "オーナー (admin)" },
  { user: "staff", pass: "staff", role: "staff", name: "スタッフ (staff)" },
];

export const ROLE_PAGES = {
  owner: ["post", "prices", "news", "products", "sns"],
  staff: ["post", "prices"],
};

export function pagesFor(role) {
  return ROLE_PAGES[role] || [];
}

export function getSession() {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !s.user || !s.role) return null;
    return s;
  } catch {
    return null;
  }
}

export function login(user, pass) {
  const acc = ACCOUNTS.find((a) => a.user === user && a.pass === pass);
  if (!acc) return { ok: false, error: "ユーザー名またはパスワードが違います" };
  const session = { user: acc.user, role: acc.role, name: acc.name, loginAt: Date.now() };
  if (isClient()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent(CHANNEL, { detail: session }));
  }
  return { ok: true, session };
}

export function logout() {
  if (!isClient()) return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CHANNEL, { detail: null }));
}

export function on(callback) {
  if (!isClient()) return () => {};
  const fn = (e) => callback(e.detail);
  const storageFn = () => callback(getSession());
  window.addEventListener(CHANNEL, fn);
  window.addEventListener("storage", storageFn);
  return () => {
    window.removeEventListener(CHANNEL, fn);
    window.removeEventListener("storage", storageFn);
  };
}
