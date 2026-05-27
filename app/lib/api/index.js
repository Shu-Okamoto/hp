"use client";
/**
 * MikawaAPI — single import surface for all client code.
 *
 *   import MikawaAPI from "@/app/lib/api";
 *
 * Each external-service namespace (shopify / instagram / line) routes
 * through an env-selected adapter (mock by default, real when
 * NEXT_PUBLIC_API_MODE=real). The local-only namespaces (prices, news,
 * shops, connections) read/write the shared localStorage-backed store.
 */

import { getState, reset, on } from "./store";
import * as shopify from "./shopify";
import * as instagram from "./instagram";
import * as line from "./line";
import * as prices from "./prices";
import * as news from "./news";
import * as shops from "./shops";
import * as connections from "./connections";

export const MikawaAPI = {
  getState,
  reset,
  on,
  shopify,
  instagram,
  line,
  prices,
  news,
  shops,
  connections,
};

export default MikawaAPI;
