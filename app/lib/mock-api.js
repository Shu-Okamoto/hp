"use client";
/**
 * Mock API layer for さとの味みかわ.
 *
 * Stand-in for Shopify Storefront, Instagram Basic Display, and LINE Messaging
 * during the prototype phase. Writes go to localStorage and fire a
 * `mikawa:store-changed` CustomEvent so subscribers can re-render live.
 *
 * In production, swap each `MikawaAPI.*` call for the matching real-API call —
 * the response shapes are intentionally close to the real services.
 *
 * SSR-safe: during server render, returns seed data without touching
 * localStorage or window. Client takes over on hydration.
 */

const STORAGE_KEY = "mikawa:store:v1";
const CHANNEL = "mikawa:store-changed";

const isClient = () => typeof window !== "undefined";
const today = () => new Date().toISOString().slice(0, 10);

const seed = () => ({
  meta: {
    version: 1,
    lastSync: { shopify: today(), instagram: today(), line: today() },
  },
  products: [
    { id: "p-set",   handle: "mikawa-set",   title: "三河野菜の旬セット", priceJpy: 2480, unit: "/ セット",     category: "看板",  imgTone: "green",  desc: "旬の野菜10品をバランスよく詰め合わせ。" },
    { id: "p-bento", handle: "yakult-bento", title: "ヤクルト式 お弁当便",   priceJpy: 650,  unit: "/ 1食〜",     category: "弁当",  imgTone: "orange", desc: "週替わりカタログから選べる地域密着の弁当配達。" },
    { id: "p-jam",   handle: "farm-jam",     title: "農家のジャム",         priceJpy: 880,  unit: "〜",          category: "加工品", imgTone: "",       desc: "規格外野菜から生まれる、季節の保存食。" },
    { id: "p-pickle",handle: "farm-pickle",  title: "三河の漬物三種",       priceJpy: 1280, unit: "/ 3袋",       category: "加工品", imgTone: "",       desc: "ベテラン農家直伝のレシピで仕込んだ手づくり漬物。" },
    { id: "p-rice",  handle: "mikawa-rice",  title: "三河平野の新米",       priceJpy: 3680, unit: "/ 5kg",       category: "穀物",  imgTone: "green",  desc: "契約農家から直送、棚田で育った特別栽培米。" },
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
    { id: "n-001", date: today(), source: "ig",    title: "本日の入荷：愛知の朝採れトマトが入りました", body: "今朝、契約農家さんから真っ赤に熟したトマトが届きました。1パック280円。なくなり次第終了です。", emoji: "🍅", igHandle: "@satonoaji_mikawa", channels: ["ig","web"] },
    { id: "n-002", date: today(), source: "line",  title: "週末セール開催のお知らせ・15時から店頭にて", body: "土日15時から夕方限定の見切りセールを開催します。野菜・お惣菜が最大半額！", emoji: "🎁", channels: ["line","web"] },
    { id: "n-003", date: today(), source: "event", title: "5月『畑の収穫体験』参加者募集中", body: "農家のおじちゃんと一緒に、畑で野菜を収穫する半日体験。お子さま参加歓迎。", emoji: "🌱", channels: ["web"] },
    { id: "n-004", date: today(), source: "news",  title: "ゴールデンウィーク営業時間のご案内", body: "5/3-5/6は通常営業。5/7のみ臨時休業させていただきます。", emoji: "📅", channels: ["web","line"] },
  ],
  shops: [
    { id: "s-honten", name: "みかわ本店",   addr: "愛知県岡崎市本町1-23-4",  hours: "9:00 - 19:00",  tel: "0564-00-0000", x: 28, y: 62 },
    { id: "s-nishio", name: "みかわ西尾店", addr: "愛知県西尾市駅前2-5-12",  hours: "9:00 - 19:00",  tel: "0563-00-0000", x: 56, y: 73 },
    { id: "s-toyota", name: "みかわ豊田店", addr: "愛知県豊田市新明町6-7-8", hours: "10:00 - 20:00", tel: "0565-00-0000", x: 78, y: 38 },
  ],
  connections: {
    shopify:   { connected: true,  shop: "mikawa.myshopify.com",   lastSync: today(), syncIntervalMin: 30 },
    instagram: { connected: true,  handle: "@satonoaji_mikawa",     lastSync: today(), syncIntervalMin: 15 },
    line:      { connected: true,  channel: "里の味みかわ公式",       lastSync: today(), reach: 1284 },
  },
});

function load() {
  if (!isClient()) return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw);
    if (!parsed.meta || parsed.meta.version !== 1) return seed();
    return parsed;
  } catch (e) {
    console.warn("[mock-api] failed to load store, reseeding", e);
    return seed();
  }
}

let state = null;
const ensure = () => {
  if (state === null) state = load();
  return state;
};

function save(next) {
  state = next;
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(CHANNEL, { detail: state }));
  } catch (e) {
    console.warn("[mock-api] save failed", e);
  }
}

const uid = (p) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const MikawaAPI = {
  getState: () => JSON.parse(JSON.stringify(ensure())),
  reset: () => { state = seed(); save(state); return state; },
  on(callback) {
    if (!isClient()) return () => {};
    const fn = (e) => callback(e.detail);
    const storageFn = () => { state = load(); callback(state); };
    window.addEventListener(CHANNEL, fn);
    window.addEventListener("storage", storageFn);
    return () => {
      window.removeEventListener(CHANNEL, fn);
      window.removeEventListener("storage", storageFn);
    };
  },

  shopify: {
    async listProducts() { await sleep(80); return ensure().products.slice(); },
    async upsertProduct(p) {
      await sleep(120);
      const s = ensure();
      const idx = s.products.findIndex((x) => x.id === p.id);
      if (idx >= 0) s.products[idx] = { ...s.products[idx], ...p };
      else s.products.unshift({ id: uid("p"), ...p });
      s.connections.shopify.lastSync = today();
      save(s);
      return p;
    },
    async deleteProduct(id) {
      const s = ensure();
      s.products = s.products.filter((p) => p.id !== id);
      save(s);
    },
  },

  prices: {
    async list() { return ensure().dailyPrices.slice(); },
    async update(id, patch) {
      const s = ensure();
      const idx = s.dailyPrices.findIndex((p) => p.id === id);
      if (idx >= 0) s.dailyPrices[idx] = { ...s.dailyPrices[idx], ...patch };
      save(s);
    },
    async setFeatured(id) {
      const s = ensure();
      s.dailyPrices = s.dailyPrices.map((p) => ({ ...p, featured: p.id === id ? true : p.featured }));
      save(s);
    },
    async create(item) {
      const s = ensure();
      s.dailyPrices.unshift({ id: uid("v"), visible: true, featured: false, ...item });
      save(s);
    },
    async remove(id) {
      const s = ensure();
      s.dailyPrices = s.dailyPrices.filter((p) => p.id !== id);
      save(s);
    },
  },

  news: {
    async list({ source } = {}) {
      return ensure().posts.filter((p) => !source || source === "all" || p.source === source).slice();
    },
    async post({ title, body, emoji, channels, source }) {
      const s = ensure();
      const post = {
        id: uid("n"),
        date: today(),
        title, body, emoji: emoji || "📣",
        channels: channels || ["web"],
        source: source || (channels && channels[0]) || "web",
      };
      s.posts.unshift(post);
      if (channels?.includes("ig"))   s.connections.instagram.lastSync = today();
      if (channels?.includes("line")) s.connections.line.lastSync = today();
      save(s);
      return post;
    },
    async remove(id) {
      const s = ensure();
      s.posts = s.posts.filter((p) => p.id !== id);
      save(s);
    },
  },

  shops: {
    async list() { return ensure().shops.slice(); },
  },

  connections: {
    async get() { return JSON.parse(JSON.stringify(ensure().connections)); },
    async toggle(name, connected) {
      const s = ensure();
      if (s.connections[name]) {
        s.connections[name].connected = connected;
        save(s);
      }
    },
    async sync(name) {
      await sleep(400);
      const s = ensure();
      if (s.connections[name]) {
        s.connections[name].lastSync = today();
        save(s);
      }
    },
  },
};

export default MikawaAPI;
