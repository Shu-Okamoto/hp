import { auth } from "../../../../../auth";
import { isShopifyOAuthConfigured, buildAuthorizeUrl } from "../../../../lib/shopify-oauth";

/**
 * 管理者がクリックして開始する、Shopify OAuth インストールの入口。
 * ランダムな state を Cookie に積んでから Shopify の認可画面へ 302。
 * 認証済み管理者のみ起動可 (野良アクセスでインストールフローが
 * 走らないようにするガード)。
 */
export const dynamic = "force-dynamic";

export async function GET(req) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isShopifyOAuthConfigured()) {
    return Response.json({
      error: "Shopify OAuth not configured",
      hint: "SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET / SHOPIFY_STORE_DOMAIN を設定してください。",
    }, { status: 503 });
  }

  const state = crypto.randomUUID();
  const redirectUri = new URL("/api/shopify/oauth/callback", req.url).toString();
  const authorizeUrl = buildAuthorizeUrl({ state, redirectUri });

  // Response.redirect() のヘッダーは実装によって読み取り専用になり
  // 得るため、Set-Cookie を安全に足せるよう手動で組み立てる。
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl,
      "Set-Cookie": `shopify_oauth_state=${state}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}
