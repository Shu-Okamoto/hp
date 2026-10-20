import "server-only";
import { shopifyDomain } from "./shopify-sync";

/**
 * Shopify OAuth (Authorization Code Grant) — 1回限りのセットアップ用。
 *
 * 新しい Shopify 開発ダッシュボード (dev.shopify.com) で作成したアプリは
 * クライアントID/シークレット方式で、「オートメーショントークン」は
 * Shopify CLI 専用 (Admin API の認証には使えない)。Admin REST/GraphQL
 * API を直接叩くための有効なアクセストークンを得るには、標準の OAuth
 * 認可コードフローを一度通す必要がある。
 *
 * 発行されたトークンは (オフラインアクセスの場合) 失効しない静的な
 * トークンなので、/api/shopify/oauth/callback で画面に表示した値を
 * 管理者が SHOPIFY_ADMIN_TOKEN にコピーすれば、以降は今まで通り
 * 動作する。DB 保存はせず、値は毎回手動でコピーする運用。
 *
 * Env:
 *   SHOPIFY_STORE_DOMAIN    e.g. mikawa2020.myshopify.com
 *   SHOPIFY_CLIENT_ID       dev.shopify.com の「クライアントID」
 *   SHOPIFY_CLIENT_SECRET   dev.shopify.com の「クライアントシークレット」
 */

export function isShopifyOAuthConfigured() {
  return !!(
    process.env.SHOPIFY_STORE_DOMAIN &&
    process.env.SHOPIFY_CLIENT_ID &&
    process.env.SHOPIFY_CLIENT_SECRET
  );
}

/**
 * 認可画面への遷移 URL を組み立てる。
 * @param {{ state: string, redirectUri: string }} opts
 */
export function buildAuthorizeUrl({ state, redirectUri }) {
  const domain = shopifyDomain();
  const params = new URLSearchParams({
    client_id: process.env.SHOPIFY_CLIENT_ID,
    scope: "write_draft_orders,read_draft_orders",
    redirect_uri: redirectUri,
    state,
  });
  return `https://${domain}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * 認可コードをアクセストークンに交換する。
 * @param {string} code
 * @returns {Promise<{ access_token: string, scope: string }>}
 */
export async function exchangeCodeForToken(code) {
  const domain = shopifyDomain();
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      code,
    }),
    cache: "no-store",
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Shopify token exchange ${res.status}: ${body.slice(0, 300)}`);
  }
  return JSON.parse(body);
}
