/**
 * Formats the daily price board as a LINE-friendly broadcast message.
 *
 * Layout:
 *   【本日の販売価格 M/D(曜)】
 *
 *   ◆ 本日の目玉商品
 *   🍅 トマト ¥280 / 1パック
 *   ...
 *
 *   ◆ 本日の野菜一覧
 *   🥒 きゅうり ¥120 / 3本
 *   ...
 *
 *   店頭でお待ちしております！
 *   {siteUrl}/price
 *
 * Hidden (visible=false) items are excluded. Featured items are grouped
 * at the top. Result stays well under LINE's 5000-char limit even with
 * 50+ entries.
 */
export function formatPriceMessage(prices, { date = new Date(), siteUrl = "" } = {}) {
  const visible = prices.filter((p) => p.visible);
  const featured = visible.filter((p) => p.featured);
  const rest = visible.filter((p) => !p.featured);

  const dateStr = date.toLocaleDateString("ja-JP", {
    month: "numeric", day: "numeric", weekday: "short",
  });
  const fmtRow = (p) => {
    const u = p.unit ? ` ${p.unit}` : "";
    return `${p.emoji || ""} ${p.name} ¥${p.priceJpy}${u}`.trim();
  };

  const lines = [`【本日の販売価格 ${dateStr}】`, ""];
  if (featured.length) {
    lines.push("◆ 本日の目玉商品");
    featured.forEach((p) => lines.push(fmtRow(p)));
    lines.push("");
  }
  if (rest.length) {
    lines.push("◆ 本日の野菜一覧");
    rest.forEach((p) => lines.push(fmtRow(p)));
    lines.push("");
  }
  lines.push("店頭でお待ちしております！");
  if (siteUrl) lines.push(`${siteUrl.replace(/\/$/, "")}/price`);
  return lines.join("\n");
}

export function todayHeadline(date = new Date()) {
  const dateStr = date.toLocaleDateString("ja-JP", {
    month: "numeric", day: "numeric", weekday: "short",
  });
  return `本日の販売価格 ${dateStr}`;
}
