"use client";

/**
 * Public site — responsive (mobile-first, scales to desktop ≥ 960px).
 *
 * This module exports the individual section / page components that the
 * Next.js routes under `app/{products,news,price,shops,agri}/page.jsx`
 * mount. Navigation is driven by real URLs (next/link + usePathname); the
 * client store stays subscribed via `useStore()` for live updates after
 * the page hydrates.
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MikawaAPI from "../lib/api";
import { MultiShopMap, directionsUrl } from "./ShopsMap";

// ── External links ──────────────────────────────────────────
// One source of truth for the brand's off-site destinations. Reused by
// the footer, the agri block, and the product-detail purchase CTA so
// changing a URL only needs editing this one spot.
const EXT = {
  store: "https://www.satonoaji-mikawa.com",
  bento: "https://order.satonoaji-mikawa.net/free/home",
  agri:  "https://www.iwakuniagripartners.com",
};

// Build a Shopify product-page URL from an hp.products handle. When the
// handle matches the Shopify product's own handle, this drops the visitor
// straight onto the product detail on the store where they can add to
// cart. If handle is missing, falls back to the store root.
const storeProductUrl = (handle) =>
  handle ? `${EXT.store}/products/${encodeURIComponent(handle)}` : EXT.store;

// Shopify cart permalink — adds the variant straight to the cart and
// lands the visitor on the cart page. Used when a product carries a
// synced variantId; otherwise we fall back to the product page.
const cartAddUrl = (variantId, quantity = 1) =>
  variantId ? `${EXT.store}/cart/${variantId}:${quantity}` : EXT.store;

// Best purchase link for a product: direct cart add when we know the
// variant, product page when we only know the handle, store root as
// the last resort.
const buyUrl = (p) =>
  p?.variantId ? cartAddUrl(p.variantId) : storeProductUrl(p?.handle);

const ExtLink = ({ href, className, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
    {children} <span aria-hidden className="pub-ext">↗</span>
  </a>
);

// ── Hook: live store ────────────────────────────────────────
export function useStore() {
  const [s, setS] = useState(() => MikawaAPI.getState());
  useEffect(() => MikawaAPI.on(setS), []);
  return s;
}

// ── Icons ───────────────────────────────────────────────────
const Ico = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" strokeLinecap="round"/></svg>,
  menu:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round"/></svg>,
  home:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" strokeLinejoin="round"/></svg>,
  bag:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 8h14l-1 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 8V6a3 3 0 0 1 6 0v2" strokeLinejoin="round"/></svg>,
  tag:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 12V4h8l10 10-8 8z" strokeLinejoin="round"/><circle cx="8" cy="9" r="1.5"/></svg>,
  pin:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>,
  list:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 6h12M8 12h12M8 18h12" strokeLinecap="round"/><circle cx="4" cy="6"  r="1.2" fill="currentColor"/><circle cx="4" cy="12" r="1.2" fill="currentColor"/><circle cx="4" cy="18" r="1.2" fill="currentColor"/></svg>,
  arrow:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ig:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>,
  line:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3c5 0 9 3.3 9 7.4 0 4-4 7.3-9 7.3-.7 0-1.4-.1-2-.2L6 20l1-3.3C5 15.3 3 13 3 10.4 3 6.3 7 3 12 3z" strokeLinejoin="round"/></svg>,
  mail:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>,
  bento:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="6" width="18" height="14" rx="2"/><line x1="12" y1="6" x2="12" y2="20"/><line x1="3" y1="13" x2="12" y2="13"/><circle cx="16.5" cy="10" r="0.9" fill="currentColor" stroke="none"/></svg>,
};

// ── Logo ────────────────────────────────────────────────────
// `inverse` switches to /logo-inverse.png — used on dark surfaces
// (Footer). If that file isn't deployed yet, onError falls back to
// the standard logo so the page never shows a broken image.
const Logo = ({ size = "md", inverse = false }) => (
  <div className={`pub-logo pub-logo-${size} ${inverse ? "inv" : ""}`}>
    <img
      src={inverse ? "/logo-inverse.png" : "/logo.png"}
      alt="里の味みかわ"
      onError={(e) => {
        if (inverse && e.currentTarget.src.endsWith("/logo-inverse.png")) {
          e.currentTarget.src = "/logo.png";
        }
      }}
    />
  </div>
);

// ── Breadcrumb ──────────────────────────────────────────────
export const Breadcrumb = ({ items }) => (
  <nav className="pub-breadcrumb" aria-label="パンくず">
    {items.map((it, i) => {
      const last = i === items.length - 1;
      return (
        <span key={i} className="pub-breadcrumb-item">
          {it.href && !last ? (
            <Link className="pub-breadcrumb-link" href={it.href}>{it.label}</Link>
          ) : (
            <span className={last ? "is-current" : ""}>{it.label}</span>
          )}
          {!last && <span className="sep" aria-hidden>/</span>}
        </span>
      );
    })}
  </nav>
);

// ── Nav config ──────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "home",     href: "/",         label: "ホーム",       ico: Ico.home },
  { key: "products", href: "/products", label: "商品・メニュー", ico: Ico.bag,   navLabel: "商品" },
  { key: "bento",    href: "/bento",    label: "お弁当のご予約", ico: Ico.bento, navLabel: "お弁当" },
  { key: "price",    href: "/price",    label: "今日の価格",   ico: Ico.tag,   navLabel: "価格" },
  { key: "news",     href: "/news",     label: "お知らせ",     ico: Ico.list },
  { key: "shops",    href: "/shops",    label: "店舗一覧",     ico: Ico.pin,   navLabel: "店舗" },
  { key: "agri",     href: "/agri",     label: "農家との取り組み" },
];

// Derives the active section key from a pathname so AppBar/BottomNav can
// highlight the parent tab even on detail routes like /products/[handle].
function activeKeyFor(pathname) {
  if (!pathname || pathname === "/") return "home";
  for (const item of NAV_ITEMS) {
    if (item.href === "/") continue;
    if (pathname === item.href || pathname.startsWith(item.href + "/")) return item.key;
  }
  return null;
}

// ── App bar (mobile) + Top nav (desktop) ────────────────────
const AppBar = () => {
  const pathname = usePathname();
  const current = activeKeyFor(pathname);
  return (
    <header className="pub-appbar">
      <div className="pub-appbar-inner">
        <Link className="pub-link-reset" href="/" aria-label="ホームへ">
          <Logo />
        </Link>
        <nav className="pub-topnav" aria-label="グローバルナビ">
          {NAV_ITEMS.map((i) => (
            <Link key={i.key} href={i.href}
              className={`pub-topnav-item ${current === i.key ? "is-active" : ""}`}>
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="pub-appbar-icons" aria-hidden>
          <button className="pub-icon-btn" type="button">{Ico.search}</button>
          <button className="pub-icon-btn pub-only-mobile" type="button">{Ico.menu}</button>
        </div>
      </div>
    </header>
  );
};

// ── Stories: today's prices ─────────────────────────────────
const Stories = ({ prices }) => {
  const list = prices.filter((p) => p.visible);
  return (
    <section className="pub-stories">
      <header className="pub-section-head">
        <div>
          <div className="t-label">Today&apos;s Price</div>
          <h2 className="t-mincho">今日の販売価格</h2>
          <p className="pub-lead">毎朝、店頭の値段をそのままお届け。</p>
        </div>
        <div className="pub-section-meta">
          <div className="pub-date">{new Date().toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit", weekday: "short" })}</div>
          <Link className="pub-link" href="/price">すべて見る {Ico.arrow}</Link>
        </div>
      </header>
      <div className="pub-story-row">
        {list.map((v) => (
          <Link key={v.id} className="pub-story" href="/price">
            <div className={`pub-story-ring ${v.featured ? "is-featured" : ""}`}>
              <div className="inner"><div className="veg">{v.emoji}</div></div>
            </div>
            <div className="name">{v.name}</div>
            <div className="price">¥{v.priceJpy}</div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// ── Hero ────────────────────────────────────────────────────
const Hero = () => (
  <section className="pub-hero">
    <div className="pub-hero-inner">
      <div className="pub-hero-text">
        <div className="t-label" style={{ color: "var(--c-green-600)" }}>From Farm to Table</div>
        <h1 className="t-mincho">農家と共に、<br/>食卓を<span className="accent">彩る</span>。</h1>
        <p className="pub-hero-quote">「自然を尊ぶ」という日本人の気質に基づいた「食」に関する習わし<br/>「和食　日本人の伝統的な食文化」</p>
        <p>昔から食べてきた親しみのある和食や発酵文化は、世界からも健康食として注目されています。</p>
        <p>里の味みかわはここ山口県岩国から、昔ながらの八百屋ならではの食材の品質で「里の味」をお届けします。</p>
        <div className="pub-hero-ctas">
          <Link className="pub-btn pub-btn-primary" href="/products">商品を見る {Ico.arrow}</Link>
          <Link className="pub-btn pub-btn-ghost" href="/agri">ブランドの想い</Link>
        </div>
      </div>
      <div className="pub-hero-art" aria-hidden>
        <div className="art-photo art-1" />
        <div className="art-photo art-2" />
        <div className="art-stamp t-en">est. 1989</div>
      </div>
    </div>
  </section>
);

// ── Product grid ────────────────────────────────────────────
const ProductCard = ({ p }) => (
  <Link className="pub-pcard is-clickable" href={`/products/${encodeURIComponent(p.handle || p.id)}`}>
    <div className={`img tone-${p.imgTone || "default"} ${p.imageUrl ? "has-photo" : ""}`}>
      {p.imageUrl && <img src={p.imageUrl} alt={p.title} />}
      <span className="tag">{p.category}</span>
    </div>
    <div className="body">
      <h4 className="t-mincho">{p.title}</h4>
      <p>{p.desc}</p>
      <div className="row">
        <div className="price">¥{p.priceJpy.toLocaleString()}<small>{p.unit}</small></div>
        <span className="pub-link">詳しく {Ico.arrow}</span>
      </div>
    </div>
  </Link>
);

const ProductGrid = ({ products, heading = true }) => (
  <section className="pub-section pub-products">
    {heading && (
      <header className="pub-section-head">
        <div>
          <div className="t-label">Our Products</div>
          <h3 className="t-mincho">産地直送、里の味。</h3>
          <p className="pub-lead">農家と共に、地域の食を守り・つなぐ。</p>
        </div>
      </header>
    )}
    <div className="pub-product-grid">
      {products.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  </section>
);

// ── News list ───────────────────────────────────────────────
const sourceMeta = {
  ig:    { label: "Instagram", cls: "ig" },
  line:  { label: "LINE",      cls: "line" },
  event: { label: "イベント",  cls: "event" },
  news:  { label: "お知らせ",  cls: "news" },
  web:   { label: "お知らせ",  cls: "news" },
};

const NewsListSection = ({ posts, compact = false, heading = true }) => (
  <section className="pub-section pub-news">
    {heading && (
      <header className="pub-section-head">
        <div>
          <div className="t-label">News &amp; Updates</div>
          <h3 className="t-mincho">お知らせ</h3>
          <p className="pub-lead">SNS・店舗・イベント情報を一覧で。</p>
        </div>
      </header>
    )}
    <ul className="pub-news-list">
      {(compact ? posts.slice(0, 4) : posts).map((n) => {
        const m = sourceMeta[n.source] || sourceMeta.news;
        return (
          <li key={n.id} className="pub-news-item is-clickable">
            <Link href={`/news/${encodeURIComponent(n.id)}`} className="pub-news-item-link">
              <div className="thumb" aria-hidden>{n.emoji}</div>
              <div className="content">
                <div className="meta">
                  <span>{n.date}</span>
                  <span className={`pub-tag ${m.cls}`}>{m.label}</span>
                </div>
                <div className="title t-mincho">{n.title}</div>
                {!compact && <p className="body">{n.body}</p>}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  </section>
);

// ── Agri partners block ─────────────────────────────────────
const AgriBlock = () => (
  <section className="pub-agri">
    <div className="pub-agri-inner">
      <div className="pub-agri-text">
        <div className="t-label" style={{ color: "var(--c-orange-400)" }}>Iwakuni Agri Partners</div>
        <h3 className="t-mincho">農家と共に、ものづくり。</h3>
        <p>協同組合「いわくにアグリパートナーズ」を立ち上げて、地元農家との連携プラットフォームを作りました。食卓から畑が見える商品の開発をコンセプトにしています。</p>
        <div className="pub-agri-ctas">
          <Link className="pub-link inv" href="/agri">取り組みを詳しく見る {Ico.arrow}</Link>
          <ExtLink href={EXT.agri} className="pub-link inv">アグリパートナーズ公式サイト</ExtLink>
        </div>
      </div>
      <div className="pub-agri-photo" aria-hidden>
        <span>〔 農家・畑の風景写真 〕</span>
      </div>
    </div>
  </section>
);

// ── Shops & map ─────────────────────────────────────────────
const ShopMap = ({ shops }) => (
  <section className="pub-section pub-shops">
    <header className="pub-section-head">
      <div>
        <div className="t-label">Our Shops</div>
        <h3 className="t-mincho">店舗一覧</h3>
        <p className="pub-lead">山口県岩国市で2店舗の八百屋を運営しております。</p>
      </div>
    </header>
    <MultiShopMap shops={shops} />
    <div className="pub-shop-cards">
      {shops.map((s, i) => (
        <article key={s.id} className="pub-shop-card">
          <div className="pub-shop-card-num" aria-hidden>{i + 1}</div>
          <div className="pub-shop-card-info">
            <h3 className="t-mincho name">{s.name}</h3>
            <p className="addr">{s.addr}</p>
            <dl className="meta">
              <div><dt>営業時間</dt><dd>{s.hours}</dd></div>
              <div><dt>TEL</dt><dd><a href={`tel:${s.tel.replace(/[^\d]/g, "")}`}>{s.tel}</a></dd></div>
            </dl>
            <a className="pub-btn pub-btn-primary" target="_blank" rel="noopener noreferrer" href={directionsUrl(s)}>
              経路を見る {Ico.arrow}
            </a>
          </div>
        </article>
      ))}
    </div>
  </section>
);

// ── Footer ──────────────────────────────────────────────────
const Footer = ({ shops }) => (
  <footer className="pub-footer">
    <div className="pub-footer-inner">
      <div className="col col-brand">
        <Logo size="lg" inverse />
        <div className="tagline t-mincho">農家と共に、<br/>食卓を彩る。</div>
      </div>
      <div className="col">
        <h5 className="t-en">Sitemap</h5>
        <ul>
          <li><Link href="/">ホーム</Link></li>
          <li><Link href="/products">商品・メニュー</Link></li>
          <li><Link href="/price">今日の価格</Link></li>
          <li><Link href="/news">お知らせ</Link></li>
          <li><Link href="/shops">店舗一覧</Link></li>
        </ul>
      </div>
      <div className="col">
        <h5 className="t-en">Services</h5>
        <ul>
          <li><Link href="/signature">看板商品 大吟醸の奈良漬</Link></li>
          <li><ExtLink href={EXT.store}>オンラインストア</ExtLink></li>
          <li><Link href="/bento">お弁当のご予約</Link></li>
          <li><Link href="/agri">農家との取り組み</Link></li>
          <li><ExtLink href={EXT.agri}>アグリパートナーズ</ExtLink></li>
          <li><Link href="/dx">里の味みかわ の DX</Link></li>
          <li>お問い合わせ</li>
        </ul>
      </div>
      <div className="col">
        <h5 className="t-en">Shops</h5>
        <ul className="shops-list">
          {shops.map((s) => (
            <li key={s.id}>
              <div className="t-mincho">{s.name}</div>
              <small>{s.hours}　／　{s.addr}</small>
            </li>
          ))}
        </ul>
      </div>
      <div className="col">
        <h5 className="t-en">Follow</h5>
        <div className="sns">
          <a aria-label="Instagram">{Ico.ig}</a>
          <a aria-label="LINE">{Ico.line}</a>
          <a aria-label="Mail">{Ico.mail}</a>
        </div>
      </div>
    </div>
    <div className="pub-footer-legal">
      <span>運営：mikawa.co.,ltd. 里の味みかわ</span>
      <span>特定商取引法 ／ プライバシーポリシー</span>
      <span className="t-en copy">© 2026 SATONOAJI MIKAWA</span>
    </div>
  </footer>
);

// ── Sticky bottom: price CTA + bottom nav (mobile) ──────────
const PriceCTA = () => (
  <Link className="pub-pricecta" href="/price">
    <span className="ico">{Ico.tag}</span>
    <span className="label"><small>TODAY&apos;S PRICE</small>今日の販売価格を見る</span>
    <span className="arrow">→</span>
  </Link>
);

const BottomNav = () => {
  const pathname = usePathname();
  const current = activeKeyFor(pathname);
  const items = NAV_ITEMS.filter((i) => i.ico);
  return (
    <nav className="pub-bnav" aria-label="モバイルナビ">
      {items.map((i) => (
        <Link key={i.key} href={i.href}
          className={`pub-bnav-item ${current === i.key ? "is-active" : ""}`}>
          <span className="ico">{i.ico}</span>
          <span>{i.navLabel || i.label}</span>
        </Link>
      ))}
    </nav>
  );
};

// ── Public chrome — used by every public route as the layout ───
export function PublicChrome({ children }) {
  const pathname = usePathname();
  const isPricePage = pathname === "/price";
  return (
    <div className="pub-root">
      <AppBar />
      <div className="pub-scroll">
        {children}
        <ShopsFooter />
      </div>
      {!isPricePage && <PriceCTA />}
      <BottomNav />
    </div>
  );
}

// Footer needs the live shops list; keep it co-located with PublicChrome
// so the chrome can be parameterless from each route.
function ShopsFooter() {
  const store = useStore();
  return <Footer shops={store.shops} />;
}

// ── Pages ───────────────────────────────────────────────────
export function HomePage({
  prices: initialPrices,
  posts: initialPosts,
  products: initialProducts,
} = {}) {
  // Server pages pass live data sourced from Supabase. We still fall
  // back to the client store so the impl host / preview deploys with
  // no DB connection keep rendering.
  const store = useStore();
  const prices = initialPrices ?? store.dailyPrices;
  const posts = initialPosts ?? store.posts;
  const products = initialProducts ?? store.products;
  const signatureProduct = products.find((p) => p.handle === "daiginjo-narazuke");
  // Home shows the curated hp-original lineup only. Products auto-created
  // by the Shopify sync carry a "p-shopify-" id prefix — those live on
  // /products but stay off the homepage grid. The signature item is
  // featured in its own section, so it's excluded from the grid too.
  const gridProducts = products.filter(
    (p) => p.handle !== "daiginjo-narazuke" && !String(p.id).startsWith("p-shopify-")
  );
  return (
    <>
      <Stories prices={prices} />
      <Hero />
      <SignatureSection product={signatureProduct} />
      <ProductGrid products={gridProducts} />
      <NewsListSection posts={posts} compact />
      <AgriBlock />
      <ShopMap shops={store.shops} />
    </>
  );
}

export function ProductsPage({ products: initialProducts } = {}) {
  const store = useStore();
  const products = initialProducts ?? store.products;
  return (
    <main className="pub-page">
      <header className="pub-page-head">
        <div className="t-label">Products</div>
        <h1 className="t-mincho">商品・メニュー</h1>
        <p>農家直送の旬から、加工品・お弁当まで。気になるものをタップしてください。</p>
      </header>
      <ProductGrid products={products} heading={false} />
    </main>
  );
}

export function ProductDetailPage({ product: serverProduct, handle, related: serverRelated } = {}) {
  // Server-rendered pages pass `product` directly; legacy callers (the
  // /dev impl host or tests) may still pass `handle` and rely on the
  // client store. We support both.
  const store = useStore();
  const product = serverProduct
    ?? store.products.find((p) => p.handle === handle || p.id === handle);
  if (!product) {
    return (
      <main className="pub-page">
        <div className="pub-page-head">
          <Breadcrumb items={[
            { label: "ホーム", href: "/" },
            { label: "商品・メニュー", href: "/products" },
            { label: "見つかりません" },
          ]} />
          <h1 className="t-mincho">商品が見つかりません</h1>
          <p>削除されたか、URLが間違っている可能性があります。</p>
          <Link className="pub-btn pub-btn-ghost" style={{ marginTop: 16 }} href="/products">商品一覧へ戻る</Link>
        </div>
      </main>
    );
  }
  const related = serverRelated
    ?? store.products.filter((p) => p.id !== product.id).slice(0, 3);
  return (
    <main className="pub-page pub-detail">
      <div className="pub-detail-head">
        <Breadcrumb items={[
          { label: "ホーム", href: "/" },
          { label: "商品・メニュー", href: "/products" },
          { label: product.title },
        ]} />
      </div>
      <article className="pub-detail-product">
        <div className={`pub-detail-hero img tone-${product.imgTone || "default"} ${product.imageUrl ? "has-photo" : ""}`}>
          {product.imageUrl && <img src={product.imageUrl} alt={product.title} />}
          <span className="tag">{product.category}</span>
        </div>
        <div className="pub-detail-body">
          <h1 className="t-mincho">{product.title}</h1>
          <p className="pub-detail-desc">{product.desc}</p>
          <div className="pub-detail-pricerow">
            <div className="price">¥{product.priceJpy.toLocaleString()}<small>{product.unit}</small></div>
            <div className="pub-detail-ctas">
              {product.category === "弁当" ? (
                <>
                  <ExtLink href={EXT.bento} className="pub-btn pub-btn-primary">お弁当を予約する</ExtLink>
                  <ExtLink href={storeProductUrl(product.handle)} className="pub-btn pub-btn-ghost">オンラインストアへ</ExtLink>
                </>
              ) : (
                <>
                  <ExtLink href={buyUrl(product)} className="pub-btn pub-btn-primary">カートに入れる</ExtLink>
                  <Link className="pub-btn pub-btn-ghost" href="/shops">店舗で予約</Link>
                </>
              )}
            </div>
          </div>
          <dl className="pub-detail-specs">
            <div><dt>商品ID</dt><dd className="t-en">{product.handle || product.id}</dd></div>
            <div><dt>カテゴリ</dt><dd>{product.category}</dd></div>
            <div><dt>単位</dt><dd>{product.unit}</dd></div>
          </dl>
          <div className="pub-detail-note">
            <p>※ こちらは Shopify Storefront API（プロトタイプではモック）から取得した商品情報です。在庫数・配送日数の表示も将来的に同経路で反映します。</p>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="pub-section pub-products">
          <header className="pub-section-head">
            <div>
              <div className="t-label">You may also like</div>
              <h3 className="t-mincho">他の商品もどうぞ</h3>
            </div>
          </header>
          <div className="pub-product-grid">
            {related.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}
    </main>
  );
}

export function PricePage({ prices: initialPrices } = {}) {
  const store = useStore();
  // Prefer server-rendered prices (sourced from KV) when provided; fall
  // back to the client store so dev/preview without KV still works.
  const all = initialPrices ?? store.dailyPrices;
  const featured = all.filter((p) => p.featured && p.visible);
  const rest     = all.filter((p) => !p.featured && p.visible);
  return (
    <main className="pub-page">
      <header className="pub-page-head">
        <div className="t-label">Today&apos;s Price</div>
        <h1 className="t-mincho">今日の販売価格</h1>
        <p>{new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}　毎朝更新</p>
      </header>
      {featured.length > 0 && (
        <section className="pub-section">
          <div className="t-label">Today&apos;s Pick</div>
          <h3 className="t-mincho" style={{ marginTop: 4 }}>本日の目玉商品</h3>
          <div className="pub-feature-grid">
            {featured.map((p) => (
              <article key={p.id} className="pub-feature-card">
                <div className="emoji">{p.emoji}</div>
                <div className="body">
                  <h4 className="t-mincho">{p.name}</h4>
                  <div className="price">¥{p.priceJpy}<small>{p.unit}</small></div>
                </div>
                <span className="ribbon t-en">Today&apos;s Pick</span>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="pub-section">
        <div className="t-label">All Items</div>
        <h3 className="t-mincho" style={{ marginTop: 4 }}>本日の野菜一覧</h3>
        <ul className="pub-price-list">
          {rest.map((p) => (
            <li key={p.id}>
              <span className="emoji">{p.emoji}</span>
              <span className="name t-mincho">{p.name}</span>
              <span className="unit">{p.unit}</span>
              <span className="price">¥{p.priceJpy}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export function NewsPage({ posts: initialPosts } = {}) {
  const store = useStore();
  const allPosts = initialPosts ?? store.posts;
  const [filter, setFilter] = useState("all");
  const tabs = [
    { key: "all",   label: "すべて" },
    { key: "ig",    label: "Instagram" },
    { key: "line",  label: "LINE" },
    { key: "event", label: "イベント" },
    { key: "news",  label: "お知らせ" },
  ];
  const filtered = filter === "all" ? allPosts : allPosts.filter((p) => p.source === filter);
  return (
    <main className="pub-page">
      <header className="pub-page-head">
        <div className="t-label">News</div>
        <h1 className="t-mincho">お知らせ</h1>
        <p>サイト・LINE・Instagramの最新情報を1つに。</p>
      </header>
      <div className="pub-filter-row">
        {tabs.map((t) => (
          <button key={t.key} type="button"
            className={`pub-chip ${filter === t.key ? "is-active" : ""}`}
            onClick={() => setFilter(t.key)}>{t.label}</button>
        ))}
      </div>
      <NewsListSection posts={filtered} heading={false} />
    </main>
  );
}

export function NewsDetailPage({ post: serverPost, id, related: serverRelated } = {}) {
  const store = useStore();
  const post = serverPost ?? store.posts.find((p) => p.id === id);
  if (!post) {
    return (
      <main className="pub-page">
        <div className="pub-page-head">
          <Breadcrumb items={[
            { label: "ホーム", href: "/" },
            { label: "お知らせ", href: "/news" },
            { label: "見つかりません" },
          ]} />
          <h1 className="t-mincho">お知らせが見つかりません</h1>
          <p>削除されたか、URLが間違っている可能性があります。</p>
          <Link className="pub-btn pub-btn-ghost" style={{ marginTop: 16 }} href="/news">お知らせ一覧へ戻る</Link>
        </div>
      </main>
    );
  }
  const m = sourceMeta[post.source] || sourceMeta.news;
  const related = serverRelated ?? store.posts.filter((p) => p.id !== post.id).slice(0, 4);
  return (
    <main className="pub-page pub-detail">
      <div className="pub-detail-head">
        <Breadcrumb items={[
          { label: "ホーム", href: "/" },
          { label: "お知らせ", href: "/news" },
          { label: post.title },
        ]} />
      </div>
      <article className="pub-detail-news">
        <div className="pub-detail-news-head">
          <div className="thumb" aria-hidden>{post.emoji}</div>
          <div className="meta">
            <span className="date t-en">{post.date}</span>
            <span className={`pub-tag ${m.cls}`}>{m.label}</span>
            {post.igHandle && <span className="handle">{post.igHandle}</span>}
          </div>
          <h1 className="t-mincho">{post.title}</h1>
        </div>
        {post.imageUrl && (
          <div className="pub-detail-news-image">
            <img src={post.imageUrl} alt={post.title} />
          </div>
        )}
        <div className="pub-detail-news-body">
          <p>{post.body}</p>
        </div>
        {post.channels && post.channels.length > 0 && (
          <div className="pub-detail-channels">
            <div className="t-label">Published to</div>
            <div className="chips">
              {post.channels.map((c) => {
                const mm = sourceMeta[c] || sourceMeta.news;
                return <span key={c} className={`pub-tag ${mm.cls}`}>{mm.label}</span>;
              })}
            </div>
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="pub-section pub-news">
          <header className="pub-section-head">
            <div>
              <div className="t-label">More</div>
              <h3 className="t-mincho">他のお知らせ</h3>
            </div>
          </header>
          <ul className="pub-news-list">
            {related.map((n) => {
              const mm = sourceMeta[n.source] || sourceMeta.news;
              return (
                <li key={n.id} className="pub-news-item is-clickable">
                  <Link href={`/news/${encodeURIComponent(n.id)}`} className="pub-news-item-link">
                    <div className="thumb" aria-hidden>{n.emoji}</div>
                    <div className="content">
                      <div className="meta">
                        <span>{n.date}</span>
                        <span className={`pub-tag ${mm.cls}`}>{mm.label}</span>
                      </div>
                      <div className="title t-mincho">{n.title}</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}

export function ShopsPage() {
  const store = useStore();
  return (
    <main className="pub-page">
      <header className="pub-page-head">
        <div className="t-label">Shops</div>
        <h1 className="t-mincho">店舗一覧</h1>
        <p>山口県岩国市で2店舗の八百屋を運営しております。営業時間・アクセス情報をご案内します。</p>
      </header>
      <ShopMap shops={store.shops} />
    </main>
  );
}

export function AgriPage() {
  return (
    <main className="pub-page">
      <header className="pub-page-head">
        <div className="t-label">Agri Partners</div>
        <h1 className="t-mincho">農家との取り組み</h1>
        <p>協同組合いわくにアグリパートナーズと共に、地域の畑をつなぐ。</p>
      </header>
      <AgriBlock />
    </main>
  );
}

// Signature highlight strip — sits on the home page between Hero and
// ProductGrid. Pulls the signature item by handle so the rest of the
// products list is free to reorder.
export function SignatureSection({ product }) {
  if (!product) return null;
  return (
    <section className="pub-signature">
      <div className="pub-signature-inner">
        <div className="pub-signature-art" aria-hidden>
          {product.imageUrl
            ? <img src={product.imageUrl} alt="" />
            : <div className="placeholder"><span>大吟醸</span><span>奈良漬</span></div>}
        </div>
        <div className="pub-signature-text">
          <div className="t-label">Our Signature</div>
          <h3 className="t-mincho">{product.title}</h3>
          <p>{product.desc}</p>
          <div className="pub-signature-pricerow">
            <div className="price">¥{product.priceJpy.toLocaleString()}<small>{product.unit}</small></div>
            <Link className="pub-btn pub-btn-primary" href="/signature">
              看板商品を詳しく見る {Ico.arrow}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SignaturePage({ product: serverProduct } = {}) {
  // Server page passes the looked-up product; fall back to the seed
  // for impl-host / preview contexts.
  const store = useStore();
  const product = serverProduct ?? store.products.find((p) => p.handle === "daiginjo-narazuke");
  return (
    <main className="pub-page pub-signature-page">
      <header className="pub-page-head">
        <div className="t-label">Our Signature</div>
        <h1 className="t-mincho">大吟醸の奈良漬</h1>
        <p>大吟醸の酒粕で漬け重ねた、里の味みかわの看板商品。</p>
      </header>

      {/* Hero */}
      <section className="pub-signature-hero">
        <div className="pub-signature-hero-inner">
          <div className="pub-signature-hero-art" aria-hidden>
            {product?.imageUrl
              ? <img src={product.imageUrl} alt={product?.title} />
              : <div className="placeholder"><span>大吟醸</span><span>奈良漬</span></div>}
          </div>
          <div className="pub-signature-hero-text">
            <div className="t-label" style={{ color: "var(--c-orange-400)" }}>Signature</div>
            <h2 className="t-mincho">里の味みかわがお届けする<br/>上質な一品。</h2>
            <p>大吟醸の酒粕の華やかな香りと、漬け重ねたコクの深さ。ご飯のお供・贈答・お酒の肴まで、長く愛されてきた里の味の代表作です。</p>
            <div className="pub-signature-hero-ctas">
              {product && (
                <div className="price">¥{product.priceJpy.toLocaleString()}<small>{product.unit}</small></div>
              )}
              <ExtLink href={product ? buyUrl(product) : storeProductUrl("daiginjo-narazuke")} className="pub-btn pub-btn-primary">オンラインストアで購入</ExtLink>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="pub-section">
        <header className="pub-section-head">
          <div>
            <div className="t-label">The Story</div>
            <h3 className="t-mincho">なぜ「大吟醸」なのか。</h3>
          </div>
        </header>
        <div className="pub-signature-story">
          <p>奈良漬は、瓜や胡瓜などの野菜を酒粕に長期間漬け込んだ発酵食品。日本古来の保存食でありながら、酒粕の質が味の8割を決める繊細な一品です。</p>
          <p>里の味みかわでは、地元蔵元の<strong>純米大吟醸酒粕</strong>のみを使用。通常の酒粕に比べて雑味が少なく、華やかで芳醇な香りが野菜にまっすぐ移ります。一夜漬けでは決して出ない、奥深いコクと余韻を引き出すために、漬け床は繰り返し新しい酒粕に入れ替えながら、ゆっくりと熟成させていきます。</p>
          <p>仕上がりまで半年以上。手間も酒粕も贅沢に使った、まさに「みかわの看板商品」と呼べる味わいです。</p>
        </div>
      </section>

      {/* Process */}
      <section className="pub-section">
        <header className="pub-section-head">
          <div>
            <div className="t-label">How It's Made</div>
            <h3 className="t-mincho">製法のこだわり</h3>
          </div>
        </header>
        <div className="pub-signature-process">
          <article>
            <div className="emoji" aria-hidden>🍶</div>
            <h4 className="t-mincho">純米大吟醸酒粕のみ使用</h4>
            <p>地元蔵元から仕入れた大吟醸酒粕だけを贅沢に使用。雑味のない上質な香りを野菜にまっすぐ移します。</p>
          </article>
          <article>
            <div className="emoji" aria-hidden>🥒</div>
            <h4 className="t-mincho">地元契約野菜</h4>
            <p>いわくにアグリパートナーズの契約農家から、漬物に最適な品種・大きさのものを厳選。鮮度の高い状態で漬け始めます。</p>
          </article>
          <article>
            <div className="emoji" aria-hidden>⏳</div>
            <h4 className="t-mincho">漬け替えの手間</h4>
            <p>酒粕を新しいものに入れ替えながら漬け直し、半年以上かけて熟成。奥深いコクと余韻を引き出します。</p>
          </article>
        </div>
      </section>

      {/* Use cases */}
      <section className="pub-section">
        <header className="pub-section-head">
          <div>
            <div className="t-label">Recommended Use</div>
            <h3 className="t-mincho">こんな場面に。</h3>
          </div>
        </header>
        <ul className="pub-signature-uses">
          <li><b>ご贈答に</b> — 化粧箱入りでお届け可能。御中元・御歳暮や大切な方へのお土産に。</li>
          <li><b>お茶請けに</b> — 渋めの番茶と。日本人の伝統的な食卓のお供として。</li>
          <li><b>お酒の肴に</b> — 日本酒・焼酎との相性は抜群。深い香りが余韻を引き立てます。</li>
          <li><b>ちょっとした手土産に</b> — 個包装の少量パックもご用意しています。</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="pub-section pub-signature-cta">
        <div className="pub-signature-cta-inner">
          <div>
            <div className="t-label">Order</div>
            <h3 className="t-mincho">¥3,800 / 1袋〜</h3>
            <p>ギフトボックス・少量パックも各種ご用意しています。オンラインストアまたは店舗にてお求めください。</p>
          </div>
          <div className="pub-signature-cta-actions">
            <ExtLink href={product ? buyUrl(product) : storeProductUrl("daiginjo-narazuke")} className="pub-btn pub-btn-primary pub-btn-lg">オンラインストアで購入</ExtLink>
            <Link href="/shops" className="pub-btn pub-btn-ghost">店舗で購入する</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export function DXPage() {
  return (
    <main className="pub-page pub-dx-page">
      <header className="pub-page-head">
        <div className="t-label">DX Initiative</div>
        <h1 className="t-mincho">里の味みかわ の DX</h1>
        <p>八百屋がつくる、地域に根ざしたデジタル変革。</p>
      </header>

      {/* Hero */}
      <section className="pub-dx-hero">
        <div className="pub-dx-hero-inner">
          <div className="pub-dx-hero-text">
            <div className="t-label" style={{ color: "var(--c-orange-400)" }}>Our Approach</div>
            <h2 className="t-mincho">百年続く商いを、<br/>デジタルで次の世代へ。</h2>
            <p>創業から続けてきた「食卓に寄り添う八百屋」の役割を、今の暮らしに合わせて再構築しています。リアルタイム価格、弁当予約、農家との統合プラットフォーム — みかわが進める DX は、お客様・農家・地域をつなぐための地道な取り組みです。</p>
            <div className="pub-dx-hero-stats">
              <div className="stat"><b>5+</b><span>連携ツール</span></div>
              <div className="stat"><b>3</b><span>店舗 / 配達網</span></div>
              <div className="stat"><b>1</b><span>統合データ基盤</span></div>
            </div>
          </div>
          <div className="pub-dx-hero-art" aria-hidden>
            <div className="pub-dx-diagram">
              <div className="node node-customer">お客様</div>
              <div className="node node-farmer">農家</div>
              <div className="hub">
                <span className="hub-label">里の味みかわ DX</span>
              </div>
              <div className="node node-staff">スタッフ</div>
              <div className="node node-data">統合データ基盤</div>
              <svg className="pub-dx-diagram-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                <line x1="20" y1="20" x2="50" y2="50" />
                <line x1="80" y1="20" x2="50" y2="50" />
                <line x1="20" y1="80" x2="50" y2="50" />
                <line x1="80" y1="80" x2="50" y2="50" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Initiatives */}
      <section className="pub-section">
        <header className="pub-section-head">
          <div>
            <div className="t-label">Initiatives</div>
            <h3 className="t-mincho">いま動いている取り組み</h3>
            <p className="pub-lead">お客様・農家・スタッフ、それぞれの体験を一段引き上げる 6 つの仕組み。</p>
          </div>
        </header>
        <div className="pub-dx-grid">
          <article className="pub-dx-card">
            <div className="ico" aria-hidden>📡</div>
            <h4 className="t-mincho">野菜のリアルタイム価格配信</h4>
            <p>毎朝の店頭価格を 1 ボタンで LINE 友だち全員に配信。お客様は来店前に今日のおすすめと値段を確認できます。</p>
            <div className="meta">サイト + LINE 公式アカウント連携</div>
          </article>
          <article className="pub-dx-card">
            <div className="ico" aria-hidden>🍱</div>
            <h4 className="t-mincho">弁当のオンライン予約</h4>
            <p>電話受付に頼らない 24 時間オンライン予約。週替わりカタログから選んで、岩国エリアへ配達まで完結します。</p>
            <div className="meta">order.satonoaji-mikawa.net</div>
          </article>
          <article className="pub-dx-card">
            <div className="ico" aria-hidden>🛒</div>
            <h4 className="t-mincho">産地直送オンラインストア</h4>
            <p>看板商品「大吟醸の奈良漬」をはじめ、地元の食材を全国へお届け。Shopify を活用した本格 EC 基盤を運用中。</p>
            <div className="meta">www.satonoaji-mikawa.com</div>
          </article>
          <article className="pub-dx-card">
            <div className="ico" aria-hidden>🤝</div>
            <h4 className="t-mincho">アグリパートナーズ連携</h4>
            <p>協同組合「いわくにアグリパートナーズ」を立ち上げ、地元農家との連携プラットフォームを構築。畑と食卓を直接つなぎます。</p>
            <div className="meta">いわくにアグリパートナーズ</div>
          </article>
          <article className="pub-dx-card">
            <div className="ico" aria-hidden>🗄️</div>
            <h4 className="t-mincho">統合データ基盤</h4>
            <p>価格・お知らせ・商品情報を 1 つのクラウドデータベースに集約。社内 DX の全機能が同じ基盤の上で動きます。</p>
            <div className="meta">Supabase (PostgreSQL)</div>
          </article>
          <article className="pub-dx-card">
            <div className="ico" aria-hidden>🔐</div>
            <h4 className="t-mincho">統合管理コンソール</h4>
            <p>スタッフが価格・お知らせ・商品をひとつの管理画面で運用。役割別アクセス権で、現場が安全に手を動かせる設計です。</p>
            <div className="meta">Auth.js (NextAuth)</div>
          </article>
        </div>
      </section>

      {/* Roadmap */}
      <section className="pub-section">
        <header className="pub-section-head">
          <div>
            <div className="t-label">Roadmap</div>
            <h3 className="t-mincho">これから取り組むこと</h3>
            <p className="pub-lead">既存の仕組みを土台に、お客様・農家の声を反映しながら拡張していきます。</p>
          </div>
        </header>
        <ol className="pub-dx-roadmap">
          <li>
            <div className="step">Next</div>
            <div className="content">
              <h4 className="t-mincho">在庫・入荷情報のリアルタイム公開</h4>
              <p>店頭の入荷状況を価格と一緒に公開し、品切れの「行ってがっかり」をなくします。</p>
            </div>
          </li>
          <li>
            <div className="step">2026</div>
            <div className="content">
              <h4 className="t-mincho">農家側ダッシュボード</h4>
              <p>契約農家がスマートフォンから出荷予定・販売状況を確認できる仕組みを整備中です。</p>
            </div>
          </li>
          <li>
            <div className="step">2026</div>
            <div className="content">
              <h4 className="t-mincho">顧客行動データ統合</h4>
              <p>LINE 配信・予約サイト・店頭購買のデータを統合し、お一人ひとりに合わせたご案内を可能にします。</p>
            </div>
          </li>
          <li>
            <div className="step">Future</div>
            <div className="content">
              <h4 className="t-mincho">AI による需要・収穫予測</h4>
              <p>過去データと天気を組み合わせて、農家・店舗側の仕入れ判断を支援する仕組みを検討しています。</p>
            </div>
          </li>
        </ol>
      </section>

      {/* CTA */}
      <section className="pub-section pub-dx-cta">
        <div className="pub-dx-cta-inner">
          <div>
            <div className="t-label">Contact</div>
            <h3 className="t-mincho">取り組みへのお問い合わせ</h3>
            <p>取材・行政連携・パートナーシップなど、みかわの DX について詳しく知りたい方はお気軽にご連絡ください。</p>
          </div>
          <div className="pub-dx-cta-actions">
            <Link href="/shops" className="pub-btn pub-btn-primary pub-btn-lg">お問い合わせ先を見る</Link>
            <Link href="/agri" className="pub-btn pub-btn-ghost">農家との取り組みも見る</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export function BentoPage() {
  return (
    <main className="pub-page pub-bento">
      <header className="pub-page-head">
        <div className="t-label">Bento Delivery</div>
        <h1 className="t-mincho">お弁当のご予約</h1>
        <p>ヤクルト式 お弁当便 — 岩国エリア地域密着、週替わりカタログから選べる弁当配達。</p>
      </header>

      {/* Hero CTA section */}
      <section className="pub-bento-hero">
        <div className="pub-bento-hero-inner">
          <div className="pub-bento-hero-text">
            <div className="t-label" style={{ color: "var(--c-orange-400)" }}>Order Online</div>
            <h2 className="t-mincho">毎日のお食事を、<br/>八百屋がお届けします。</h2>
            <p>地元の旬の野菜を活かした、栄養バランスの整ったお弁当。週替わりカタログから選んで、ご自宅・職場へお届けします。<br/>ご家族・グループでのご利用も歓迎。</p>
            <div className="pub-bento-hero-ctas">
              <ExtLink href={EXT.bento} className="pub-btn pub-btn-primary">今すぐ予約サイトへ</ExtLink>
              <a href="#how-to-order" className="pub-btn pub-btn-ghost">注文の流れを見る</a>
            </div>
          </div>
          <div className="pub-bento-hero-art" aria-hidden>
            <div className="art-emoji">🍱</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="pub-section">
        <header className="pub-section-head">
          <div>
            <div className="t-label">Why お弁当便</div>
            <h3 className="t-mincho">里の味みかわ の弁当便、3 つの特長</h3>
          </div>
        </header>
        <div className="pub-bento-features">
          <article className="pub-bento-feature">
            <div className="emoji" aria-hidden>📅</div>
            <h4 className="t-mincho">週替わりメニュー</h4>
            <p>季節の食材を使った日替わり・週替わりの献立。専用カタログから事前に選べるので、飽きずに続けられます。</p>
          </article>
          <article className="pub-bento-feature">
            <div className="emoji" aria-hidden>🚚</div>
            <h4 className="t-mincho">岩国エリア配達</h4>
            <p>岩国市内のご自宅・職場へ、決まった時間にお届け。配達範囲・時間帯はオンライン予約サイトでご確認いただけます。</p>
          </article>
          <article className="pub-bento-feature">
            <div className="emoji" aria-hidden>🥬</div>
            <h4 className="t-mincho">八百屋ならではの食材</h4>
            <p>毎朝仕入れる新鮮な地元野菜を中心に、いわくにアグリパートナーズと連携した契約農家の食材を使用しています。</p>
          </article>
        </div>
      </section>

      {/* How to order */}
      <section id="how-to-order" className="pub-section">
        <header className="pub-section-head">
          <div>
            <div className="t-label">How to Order</div>
            <h3 className="t-mincho">ご注文の流れ</h3>
            <p className="pub-lead">3 ステップでご予約完了。所要時間は約 3 分です。</p>
          </div>
        </header>
        <ol className="pub-bento-steps">
          <li>
            <div className="num">1</div>
            <div className="content">
              <h4 className="t-mincho">予約サイトへアクセス</h4>
              <p>下のボタンから「お弁当便」予約サイトへ移動します。</p>
            </div>
          </li>
          <li>
            <div className="num">2</div>
            <div className="content">
              <h4 className="t-mincho">メニュー・配達日を選ぶ</h4>
              <p>週替わりカタログから召し上がりたいメニューを、お届け日時とともに選択します。</p>
            </div>
          </li>
          <li>
            <div className="num">3</div>
            <div className="content">
              <h4 className="t-mincho">お届け先・お支払いを入力</h4>
              <p>お届け先住所とお支払い情報を入力すれば、ご予約完了。指定日時にお届けします。</p>
            </div>
          </li>
        </ol>
      </section>

      {/* Price + CTA */}
      <section className="pub-section pub-bento-cta">
        <div className="pub-bento-cta-inner">
          <div>
            <div className="t-label">Pricing</div>
            <h3 className="t-mincho">¥650 / 1食〜</h3>
            <p>定期便・単発ご注文どちらにも対応しています。詳細価格は予約サイトでご確認ください。</p>
          </div>
          <ExtLink href={EXT.bento} className="pub-btn pub-btn-primary pub-btn-lg">予約サイトへ進む</ExtLink>
        </div>
      </section>
    </main>
  );
}
