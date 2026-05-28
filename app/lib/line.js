import "server-only";

/**
 * LINE Messaging API helper — broadcast (公式アカウント全友だち向け配信).
 *
 * Env:
 *   LINE_CHANNEL_ACCESS_TOKEN  Messaging API のチャネルアクセストークン
 *
 * 制限:
 *   - 1リクエストで最大 5 メッセージ
 *   - broadcast はフリープラン 200通/月。プランによって枠が変わる。
 *   - 画像は public な HTTPS URL 必須 (Supabase Storage の public バケット URL を渡せばOK)
 */

const BROADCAST_URL = "https://api.line.me/v2/bot/message/broadcast";

export function isLineConfigured() {
  return !!process.env.LINE_CHANNEL_ACCESS_TOKEN;
}

/**
 * 投稿1件分を broadcast する。
 * @param {object} opts
 * @param {string} opts.text       本文（必須）。改行入れて OK
 * @param {string=} opts.imageUrl  public な HTTPS 画像 URL。あれば 2 通目として追加
 * @returns {Promise<{ ok: true } | { ok: false, status: number, body: string }>}
 */
export async function broadcast({ text, imageUrl }) {
  if (!isLineConfigured()) {
    return { ok: false, status: 0, body: "LINE_CHANNEL_ACCESS_TOKEN not set" };
  }
  if (!text || !text.trim()) {
    return { ok: false, status: 0, body: "text required" };
  }
  const messages = [{ type: "text", text: text.slice(0, 5000) }];
  if (imageUrl) {
    messages.push({
      type: "image",
      originalContentUrl: imageUrl,
      previewImageUrl: imageUrl,
    });
  }
  const res = await fetch(BROADCAST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ messages }),
  });
  if (res.ok) return { ok: true };
  const body = await res.text().catch(() => "");
  return { ok: false, status: res.status, body };
}
