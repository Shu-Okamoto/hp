import "server-only";
import { serviceClient } from "./supabase";

/**
 * Shopify → hp.products 同期。
 *
 * 方針: Shopify がマスター、hp.products は表示用オーバーレイ。
 *   - Shopify 側の title / 価格 / 説明 / 画像 / variant_id を取り込む
 *   - handle 一致した既存行は position / visible / img_tone /
 *     unit / category を **保持** (このサイト専用の見せ方設定)
 *   - hp.products にしかない行 (ローカル専用商品) は触らない
 *   - Shopify にだけある新商品は末尾に visible=true で追加
 *
 * Env:
 *   SHOPIFY_STORE_DOMAIN     e.g. mikawa2020.myshopify.com
 *   SHOPIFY_STOREFRONT_TOKEN Storefront API token (read-only)
 */

const API_VERSION = "2025-01";

const SYNC_QUERY = `
  query SyncProducts($cursor: String) {
    products(first: 100, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          title
          description
          featuredImage { url }
          priceRange { minVariantPrice { amount } }
          variants(first: 1) {
            edges { node { id } }
          }
        }
      }
    }
  }
`;

export function isShopifyConfigured() {
  return !!(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_TOKEN);
}

/** gid://shopify/ProductVariant/1234567890 → "1234567890" */
function numericId(gid) {
  if (!gid) return null;
  const m = String(gid).match(/(\d+)$/);
  return m ? m[1] : null;
}

async function fetchAllShopifyProducts() {
  const all = [];
  let cursor = null;
  // Page through — stores rarely exceed a few hundred products; the
  // 20-page cap is a runaway guard, not a real limit.
  for (let page = 0; page < 20; page++) {
    const res = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query: SYNC_QUERY, variables: { cursor } }),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Shopify Storefront ${res.status}: ${body.slice(0, 300)}`);
    }
    const json = await res.json();
    if (json.errors) throw new Error(`Shopify GraphQL: ${JSON.stringify(json.errors).slice(0, 300)}`);
    const conn = json.data?.products;
    for (const edge of conn?.edges || []) {
      const n = edge.node;
      all.push({
        handle: n.handle,
        title: n.title,
        description: n.description || "",
        imageUrl: n.featuredImage?.url || null,
        priceJpy: Math.round(parseFloat(n.priceRange?.minVariantPrice?.amount ?? "0")),
        variantId: numericId(n.variants?.edges?.[0]?.node?.id),
      });
    }
    if (!conn?.pageInfo?.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  return all;
}

/**
 * Runs the sync. Returns a summary { updated, created, localOnly, total }.
 */
export async function syncShopifyProducts() {
  if (!isShopifyConfigured()) {
    const e = new Error("SHOPIFY_NOT_CONFIGURED");
    e.code = "SHOPIFY_NOT_CONFIGURED";
    throw e;
  }
  const supabase = serviceClient();
  if (!supabase) {
    const e = new Error("SUPABASE_NOT_CONFIGURED");
    e.code = "SUPABASE_NOT_CONFIGURED";
    throw e;
  }

  const [shopifyProducts, { data: existingRows, error: selErr }] = await Promise.all([
    fetchAllShopifyProducts(),
    supabase.from("products").select("*").order("position", { ascending: true }),
  ]);
  if (selErr) throw selErr;

  const existingByHandle = new Map((existingRows || []).map((r) => [r.handle, r]));
  const now = new Date().toISOString();
  const maxPosition = (existingRows || []).reduce((m, r) => Math.max(m, r.position ?? 0), 0);

  const upserts = [];
  let updated = 0;
  let created = 0;
  let nextPos = maxPosition + 1;

  for (const sp of shopifyProducts) {
    const existing = existingByHandle.get(sp.handle);
    if (existing) {
      // Shopify wins on content; local wins on presentation.
      upserts.push({
        id: existing.id,
        handle: existing.handle,
        title: sp.title,
        price_jpy: sp.priceJpy,
        description: sp.description,
        // Keep a manually-uploaded Supabase image if the admin set one
        // and Shopify has no featured image.
        image_url: sp.imageUrl || existing.image_url || null,
        unit: existing.unit,
        category: existing.category,
        img_tone: existing.img_tone,
        visible: existing.visible,
        position: existing.position,
        variant_id: sp.variantId,
        synced_at: now,
      });
      updated++;
    } else {
      upserts.push({
        id: `p-shopify-${sp.handle}`,
        handle: sp.handle,
        title: sp.title,
        price_jpy: sp.priceJpy,
        description: sp.description,
        image_url: sp.imageUrl,
        unit: "",
        category: "",
        img_tone: "",
        visible: true,
        position: nextPos++,
        variant_id: sp.variantId,
        synced_at: now,
      });
      created++;
    }
  }

  if (upserts.length > 0) {
    const { error: upErr } = await supabase.from("products").upsert(upserts);
    if (upErr) throw upErr;
  }

  const shopifyHandles = new Set(shopifyProducts.map((p) => p.handle));
  const localOnly = (existingRows || []).filter((r) => !shopifyHandles.has(r.handle)).length;

  return { updated, created, localOnly, total: shopifyProducts.length };
}
