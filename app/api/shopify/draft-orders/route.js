import { auth } from "../../../../auth";
import { createGiftDraftOrder } from "../../../lib/shopify-draft-orders";
import { logDraftOrderRow, listDraftOrders } from "../../../lib/draft-orders-store";

/**
 * 贈答注文 (Shopify 下書き注文) 作成 API。
 *
 * POST body: {
 *   product: { handle, title, priceJpy, variantId? },
 *   sender:  { name, phone?, email? },
 *   recipients: [{ name, zip?, pref?, city?, address1?, address2?, phone?, quantity, note? }, ...]
 * }
 *
 * 送り先ごとに Shopify Admin API を 1 回ずつ呼ぶ (レート制限を避ける
 * ため逐次実行・軽いウェイト付き)。1 件ごとに hp.draft_orders へ
 * 成功/失敗を記録し、レスポンスで送り先ごとの結果を返す。一部失敗
 * しても他の送り先の処理は継続する。
 *
 * GET: 直近の送信ログ一覧 (履歴表示用)。
 */

export const dynamic = "force-dynamic";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await listDraftOrders({ limit: 50 });
  return Response.json(rows);
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.product?.title || !body.sender?.name || !Array.isArray(body.recipients) || body.recipients.length === 0) {
    return Response.json({ error: "product, sender.name, recipients (1件以上) が必要です" }, { status: 400 });
  }
  const { product, sender, recipients } = body;

  const batchId = `batch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const results = [];

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    if (!recipient?.name?.trim()) {
      results.push({ index: i, recipientName: recipient?.name || "", ok: false, error: "送り先名が未入力です" });
      continue;
    }

    const r = await createGiftDraftOrder({ product, sender, recipient });

    const logRow = {
      id: `do-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      batchId,
      createdBy: session.user.name || session.user.email || undefined,
      productHandle: product.handle || "",
      productTitle: product.title,
      priceJpy: Number(product.priceJpy) || 0,
      variantId: product.variantId,
      quantity: Math.max(1, Number(recipient.quantity) || 1),
      senderName: sender.name,
      senderPhone: sender.phone,
      senderEmail: sender.email,
      recipientName: recipient.name,
      recipientZip: recipient.zip,
      recipientPref: recipient.pref,
      recipientCity: recipient.city,
      recipientAddress1: recipient.address1,
      recipientAddress2: recipient.address2,
      recipientPhone: recipient.phone,
      note: recipient.note,
      status: r.ok ? "success" : "error",
      shopifyDraftOrderId: r.ok ? r.id : undefined,
      shopifyDraftOrderName: r.ok ? r.name : undefined,
      shopifyDraftOrderUrl: r.ok ? r.url : undefined,
      errorMessage: r.ok ? undefined : r.error,
    };
    await logDraftOrderRow(logRow);

    results.push({
      index: i,
      recipientName: recipient.name,
      ok: r.ok,
      draftOrderName: r.ok ? r.name : undefined,
      draftOrderUrl: r.ok ? r.url : undefined,
      error: r.ok ? undefined : r.error,
    });

    // Admin REST API のバケット制限 (概ね 2 req/sec) に配慮した小休止。
    if (i < recipients.length - 1) await sleep(600);
  }

  const succeeded = results.filter((r) => r.ok).length;
  return Response.json({
    batchId,
    total: results.length,
    succeeded,
    failed: results.length - succeeded,
    results,
  });
}
