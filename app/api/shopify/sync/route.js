import { auth } from "../../../../auth";
import { syncShopifyProducts } from "../../../lib/shopify-sync";

/**
 * POST → Shopify Storefront API から商品を取得して hp.products に
 * マージ。Admin 商品管理の「Shopify から同期」ボタンが呼ぶ。
 *
 * レスポンス: { updated, created, localOnly, total }
 *   updated   … handle 一致で内容を更新した件数
 *   created   … Shopify にだけあり新規追加した件数
 *   localOnly … hp.products にしかない (触っていない) 件数
 *   total     … Shopify 側の商品総数
 */

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const summary = await syncShopifyProducts();
    return Response.json({ ok: true, ...summary });
  } catch (e) {
    if (e.code === "SHOPIFY_NOT_CONFIGURED") {
      return Response.json({
        error: "Shopify not configured",
        hint: "SHOPIFY_STORE_DOMAIN と SHOPIFY_STOREFRONT_TOKEN を Vercel の Environment Variables に設定してください。",
      }, { status: 503 });
    }
    if (e.code === "SUPABASE_NOT_CONFIGURED") {
      return Response.json({
        error: "Supabase not configured",
        hint: "SUPABASE_SERVICE_ROLE_KEY を設定し、007 マイグレーションを実行してください。",
      }, { status: 503 });
    }
    return Response.json({ error: e.message }, { status: 502 });
  }
}
