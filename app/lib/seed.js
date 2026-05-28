/**
 * Seed data — single source of truth, importable from both server and
 * client modules. Server pages use it for SEO/metadata; the client store
 * uses it as the initial state and fallback when localStorage is empty.
 */

const today = () => new Date().toISOString().slice(0, 10);

export function seed() {
  return {
    meta: {
      version: 1,
      lastSync: { shopify: today(), instagram: today(), line: today() },
    },
    products: [
      { id: "p-set",   handle: "mikawa-set",   title: "岩国野菜の旬セット",   priceJpy: 2480, unit: "/ セット",     category: "看板",  imgTone: "green",  desc: "錦川流域の畑から、旬の野菜10品をバランスよく詰め合わせ。" },
      { id: "p-bento", handle: "yakult-bento", title: "ヤクルト式 お弁当便", priceJpy: 650,  unit: "/ 1食〜",     category: "弁当",  imgTone: "orange", desc: "週替わりカタログから選べる、岩国エリア地域密着の弁当配達。" },
      { id: "p-jam",   handle: "farm-jam",     title: "農家のジャム",         priceJpy: 880,  unit: "〜",          category: "加工品", imgTone: "",       desc: "規格外野菜から生まれる、季節の保存食。" },
      { id: "p-pickle",handle: "farm-pickle",  title: "岩国の漬物三種",       priceJpy: 1280, unit: "/ 3袋",       category: "加工品", imgTone: "",       desc: "ベテラン農家直伝のレシピで仕込んだ手づくり漬物。" },
      { id: "p-rice",  handle: "mikawa-rice",  title: "岩国産の新米",         priceJpy: 3680, unit: "/ 5kg",       category: "穀物",  imgTone: "green",  desc: "錦川流域の契約農家から直送、棚田で育った特別栽培米。" },
      { id: "p-juice", handle: "tomato-juice", title: "完熟トマトジュース",   priceJpy: 980,  unit: "/ 720ml",     category: "加工品", imgTone: "orange", desc: "旬のトマトだけを贅沢に絞った無添加ジュース。" },
    ],
    dailyPrices: [
      { id: "v-tomato",  emoji: "🍅", name: "トマト",       priceJpy: 280, unit: "/ 1パック", featured: true,  visible: true },
      { id: "v-cuc",     emoji: "🥒", name: "きゅうり",     priceJpy: 120, unit: "/ 3本",   featured: false, visible: true },
      { id: "v-egg",     emoji: "🍆", name: "なす",         priceJpy: 180, unit: "/ 4本",   featured: false, visible: true },
      { id: "v-corn",    emoji: "🌽", name: "とうもろこし", priceJpy: 220, unit: "/ 2本",   featured: true,  visible: true },
      { id: "v-greens",  emoji: "🥬", name: "小松菜",       priceJpy: 150, unit: "/ 1束",   featured: false, visible: true },
      { id: "v-grape",   emoji: "🍇", name: "ぶどう",       priceJpy: 680, unit: "/ 1房",   featured: false, visible: true },
      { id: "v-carrot",  emoji: "🥕", name: "にんじん",     priceJpy: 130, unit: "/ 3本",   featured: false, visible: true },
      { id: "v-onion",   emoji: "🧅", name: "玉ねぎ",       priceJpy: 100, unit: "/ 2玉",   featured: false, visible: true },
    ],
    posts: [
      { id: "n-001", date: today(), source: "ig",    title: "今日のストーリー更新しました",       body: "Instagramのストーリーを更新しました。畑からの今日の様子・本日の入荷をぜひご覧ください。",                       emoji: "📸", igHandle: "@satonoajimikawa", channels: ["ig","web"] },
      { id: "n-002", date: today(), source: "line",  title: "週末の広告アップしました",           body: "週末の特売チラシを公式LINEで配信しました。LINEご登録のうえ、お得情報をいち早く受け取ってください。",          emoji: "🎁", channels: ["line","web"] },
      { id: "n-003", date: today(), source: "event", title: "5月『畑の収穫体験』参加者募集中",     body: "農家のおじちゃんと一緒に、畑で野菜を収穫する半日体験。お子さま参加歓迎。",                                       emoji: "🌱", channels: ["web"] },
      { id: "n-004", date: today(), source: "news",  title: "GW営業時間のお知らせ",                body: "GW期間の営業時間をご案内します。5/3-5/6は通常営業、5/7のみ臨時休業させていただきます。",                       emoji: "📅", channels: ["web","line"] },
    ],
    // Coordinates are approximate; refine by checking each address in Google
    // Maps and updating lat/lng here (no rebuild of API logic required).
    shops: [
      { id: "s-honbu",  name: "みかわ本社惣菜本部", addr: "山口県岩国市尾津町5-11-1",     hours: "8:00 - 17:00", tel: "0827-32-1346", lat: 34.1572, lng: 132.2274 },
      { id: "s-nishi",  name: "みかわ西岩国店",     addr: "山口県岩国市岩国2丁目16-2",    hours: "9:00 - 17:00", tel: "0827-43-4773", lat: 34.1693, lng: 132.2050 },
      { id: "s-minami", name: "みかわ南岩国店",     addr: "山口県岩国市南岩国1丁目21-33",  hours: "9:00 - 17:00", tel: "0827-32-6510", lat: 34.1331, lng: 132.2245 },
    ],
    connections: {
      shopify:   { connected: true,  shop: "mikawa2020.myshopify.com", lastSync: today(), syncIntervalMin: 30 },
      instagram: { connected: true,  handle: "@satonoajimikawa",       lastSync: today(), syncIntervalMin: 15 },
      line:      { connected: true,  channel: "里の味みかわ LINE公式",    lastSync: today(), reach: 1284 },
    },
  };
}
