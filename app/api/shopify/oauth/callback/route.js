import { exchangeCodeForToken } from "../../../../lib/shopify-oauth";

/**
 * Shopify が認可後にリダイレクトしてくる先。code を本物のアクセス
 * トークンに交換し、画面に直接表示する (コピーして
 * SHOPIFY_ADMIN_TOKEN に貼るだけの、1回限りのセットアップ用)。
 *
 * DB には保存しない — このサイトは1ストア専用の内部ツールなので、
 * 値は手動で env var にコピーする運用で十分シンプルに済む。
 *
 * state を Cookie と照合して CSRF を防止。Shopify 側の HMAC 検証は
 * このセットアップ画面が管理者の手動操作でしか到達できないことを
 * 踏まえ、簡易版として省略している。
 */
export const dynamic = "force-dynamic";

function getCookie(req, name) {
  const header = req.headers.get("cookie") || "";
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function html(body) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>Shopify OAuth</title>
     <body style="font-family:sans-serif;max-width:640px;margin:40px auto;line-height:1.7;">${body}</body>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const shop = url.searchParams.get("shop");

  const cookieState = getCookie(req, "shopify_oauth_state");
  if (!state || !cookieState || state !== cookieState) {
    return html(`<h2>エラー</h2><p>state が一致しません。お手数ですが
      最初から (/api/shopify/oauth/install) やり直してください。</p>`);
  }
  if (!code) {
    return html(`<h2>エラー</h2><p>code がありません。</p>`);
  }

  try {
    const { access_token, scope } = await exchangeCodeForToken(code);
    return html(`
      <h2>✅ アクセストークンを取得しました</h2>
      <p>ストア: <code>${shop || ""}</code></p>
      <p>許可されたスコープ: <code>${scope || ""}</code></p>
      <p>下のトークンをコピーして、Vercel の環境変数
         <code>SHOPIFY_ADMIN_TOKEN</code> に貼り付けてください。
         このページを閉じると再表示できません。</p>
      <textarea readonly style="width:100%;height:60px;font-family:monospace;font-size:13px;padding:8px;">${access_token}</textarea>
    `);
  } catch (e) {
    return html(`<h2>トークン交換に失敗しました</h2><pre>${e.message}</pre>`);
  }
}
