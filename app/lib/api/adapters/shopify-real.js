"use client";
/**
 * Real Shopify adapter — stub.
 *
 * Calls Next.js API routes that wrap the Shopify Storefront / Admin API.
 * Secrets (Storefront access token, Admin API key) must live server-side
 * only — never expose them to the client bundle.
 *
 * Server routes to implement (not part of this prototype):
 *   GET    /api/shopify/products
 *   POST   /api/shopify/products
 *   DELETE /api/shopify/products/[id]
 *
 * Env vars expected at deploy time:
 *   SHOPIFY_STORE_DOMAIN       e.g. mikawa2020.myshopify.com
 *   SHOPIFY_STOREFRONT_TOKEN   read-only token for the storefront API
 *   SHOPIFY_ADMIN_TOKEN        write-capable token (server only)
 */

async function json(res) {
  if (!res.ok) throw new Error(`shopify: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function listProducts() {
  return json(await fetch("/api/shopify/products"));
}

export async function upsertProduct(p) {
  return json(await fetch("/api/shopify/products", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(p),
  }));
}

export async function deleteProduct(id) {
  const res = await fetch(`/api/shopify/products/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`shopify: ${res.status} ${res.statusText}`);
}
