/**
 * 日本の郵便番号 → 住所 検索 (zipcloud, API キー不要)。
 * https://zipcloud.ibsnet.co.jp/doc/api
 *
 * ハイフン有無どちらでも可。7桁に満たない／該当なし／通信エラー・
 * タイムアウトはすべて null を返す — あくまで入力補助なので、失敗
 * しても手入力を妨げない。
 *
 * ブラウザから直接 CORS 対応の公開 API を叩く (サーバ経由にしない)。
 * 管理画面は認証済みユーザーのみが使うので、クライアント直叩きで
 * 十分かつシンプル。
 */
export async function lookupZip(rawZip) {
  const zip = String(rawZip || "").replace(/[^\d]/g, "");
  if (zip.length !== 7) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
    const r = json?.results?.[0];
    if (!r) return null;
    return {
      pref: r.address1 || "", // 都道府県
      city: r.address2 || "", // 市区町村
      town: r.address3 || "", // 町域 (丁目・番地までは含まれない)
    };
  } catch {
    return null; // タイムアウト・ネットワークエラーも握りつぶす
  } finally {
    clearTimeout(timeout);
  }
}
