import { auth } from "../../../../auth";
import { shopifyDomain } from "../../../lib/shopify-sync";

/**
 * 一時的な診断用エンドポイント。SHOPIFY_ADMIN_TOKEN が Shopify に対して
 * 実際に有効かどうかを、下書き注文より軽い shop.json への GET だけで
 * 確認する。write_draft_orders の可否と、トークンそのものの有効性を
 * 切り分けるのが目的。
 *
 * 認証済み管理者のみアクセス可。生のレスポンス本文をそのまま返す
 * ので、原因切り分けが終わったらこのファイルは削除すること。
 */
export const dynamic = "force-dynamic";

const API_VERSION = "2025-01";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const domain = shopifyDomain();
  const token = (process.env.SHOPIFY_ADMIN_TOKEN || "").trim();

  const report = {
    domain,
    tokenPresent: !!token,
    tokenLength: token.length,
    tokenPrefix: token.slice(0, 6),
    tokenSuffix: token.slice(-4),
  };

  if (!token) {
    return Response.json({ ...report, error: "SHOPIFY_ADMIN_TOKEN が空です" }, { status: 200 });
  }

  // 最も軽い Admin API 呼び出し (特別なスコープ不要) でトークンの
  // 有効性だけをまず見る。
  let shopCheck;
  try {
    const res = await fetch(`https://${domain}/admin/api/${API_VERSION}/shop.json`, {
      headers: { "X-Shopify-Access-Token": token },
      cache: "no-store",
    });
    const body = await res.text();
    shopCheck = { status: res.status, ok: res.ok, body: body.slice(0, 500) };
  } catch (e) {
    shopCheck = { error: e.message };
  }

  // write_draft_orders の権限そのものを見る (一覧取得は read だが、
  // このスコープが無いと同じく 403 になるので切り分けに使える)。
  let draftOrdersCheck;
  try {
    const res = await fetch(`https://${domain}/admin/api/${API_VERSION}/draft_orders.json?limit=1`, {
      headers: { "X-Shopify-Access-Token": token },
      cache: "no-store",
    });
    const body = await res.text();
    draftOrdersCheck = { status: res.status, ok: res.ok, body: body.slice(0, 500) };
  } catch (e) {
    draftOrdersCheck = { error: e.message };
  }

  return Response.json({ ...report, shopCheck, draftOrdersCheck });
}
