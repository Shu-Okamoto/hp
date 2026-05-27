"use client";
/**
 * Shops — local directory.
 *
 * No external service backs this; the operator maintains the list manually.
 */

import { getRaw } from "./store";

export async function list() {
  return getRaw().shops.slice();
}
