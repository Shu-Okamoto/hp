"use client";
/**
 * Shopify adapter — product CRUD.
 *
 * Switches between the local mock and a real Storefront/Admin API
 * implementation based on the `NEXT_PUBLIC_API_MODE` env var:
 *   - "mock" (default) — reads/writes localStorage via the shared store
 *   - "real"           — delegates to `./adapters/shopify-real`, which
 *                        proxies through Next.js API routes so secrets stay
 *                        on the server
 *
 * The function signatures are kept identical across both adapters; calling
 * code (MikawaAPI.shopify.*) doesn't change when you flip the switch.
 */

import { getRaw, save, sleep, uid, todayISO } from "./store";
import * as real from "./adapters/shopify-real";

const MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

const mock = {
  async listProducts() {
    await sleep(80);
    return getRaw().products.slice();
  },
  async upsertProduct(p) {
    await sleep(120);
    const s = getRaw();
    const idx = s.products.findIndex((x) => x.id === p.id);
    if (idx >= 0) s.products[idx] = { ...s.products[idx], ...p };
    else s.products.unshift({ id: uid("p"), ...p });
    s.connections.shopify.lastSync = todayISO();
    save(s);
    return p;
  },
  async deleteProduct(id) {
    const s = getRaw();
    s.products = s.products.filter((p) => p.id !== id);
    save(s);
  },
};

const impl = MODE === "real" ? real : mock;

export const listProducts   = (...a) => impl.listProducts(...a);
export const upsertProduct  = (...a) => impl.upsertProduct(...a);
export const deleteProduct  = (...a) => impl.deleteProduct(...a);
