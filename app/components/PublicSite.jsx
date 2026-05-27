"use client";

/**
 * Public site — responsive (mobile-first, scales to desktop ≥ 960px).
 * Subscribes to MikawaAPI's change channel for live updates.
 *
 * Component split:
 *   <AppBar/> <Stories/> <Hero/> <ProductGrid/> <NewsList/> <AgriBlock/> <ShopMap/> <Footer/>
 *   <BottomNav/> + sticky <PriceCTA/> for mobile
 */

import { useState, useEffect, useMemo } from "react";
import MikawaAPI from "../lib/api";

// ── Hook: live store ────────────────────────────────────────
function useStore() {
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
};

// ── Logo ────────────────────────────────────────────────────
const Logo = ({ size = "md", inverse = false }) => (
  <div className={`pub-logo pub-logo-${size} ${inverse ? "inv" : ""}`}>
    <div className="mark">里</div>
    <div className="name">さとの味みかわ<small>SATONOAJI MIKAWA</small></div>
  </div>
);

// ── Breadcrumb ──────────────────────────────────────────────
const Breadcrumb = ({ items, onNav }) => (
  <nav className="pub-breadcrumb" aria-label="パンくず">
    {items.map((it, i) => {
      const last = i === items.length - 1;
      return (
        <span key={i} className="pub-breadcrumb-item">
          {it.to && !last ? (
            <button className="pub-link-reset pub-breadcrumb-link" onClick={() => onNav(it.to)}>{it.label}</button>
          ) : (
            <span className={last ? "is-current" : ""}>{it.label}</span>
          )}
          {!last && <span className="sep" aria-hidden>/</span>}
        </span>
      );
    })}
  </nav>
);

// ── App bar (mobile) + Top nav (desktop) ────────────────────
const AppBar = ({ onNav, current }) => {
  const items = [
    { key: "home",     label: "ホーム" },
    { key: "products", label: "商品・メニュー" },
    { key: "price",    label: "今日の価格" },
    { key: "news",     label: "お知らせ" },
    { key: "shops",    label: "店舗一覧" },
    { key: "agri",     label: "農家との取り組み" },
  ];
  return (
    <header className="pub-appbar">
      <div className="pub-appbar-inner">
        <button className="pub-link-reset" onClick={() => onNav("home")} aria-label="ホームへ">
          <Logo />
        </button>
        <nav className="pub-topnav" aria-label="グローバルナビ">
          {items.map((i) => (
            <button key={i.key}
              onClick={() => onNav(i.key)}
              className={`pub-topnav-item ${current === i.key ? "is-active" : ""}`}>
              {i.label}
            </button>
          ))}
        </nav>
        <div className="pub-appbar-icons" aria-hidden>
          <button className="pub-icon-btn">{Ico.search}</button>
          <button className="pub-icon-btn pub-only-mobile">{Ico.menu}</button>
        </div>
      </div>
    </header>
  );
};

// ── Stories: today's prices ─────────────────────────────────
const Stories = ({ prices, onMore }) => {
  const list = prices.filter((p) => p.visible);
  return (
    <section className="pub-stories">
      <header className="pub-section-head">
        <div>
          <div className="t-label">Today's Price</div>
          <h2 className="t-mincho">今日の販売価格</h2>
          <p className="pub-lead">毎朝、店頭の値段をそのままお届け。</p>
        </div>
        <div className="pub-section-meta">
          <div className="pub-date">{new Date().toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit", weekday: "short" })}</div>
          <button className="pub-link" onClick={onMore}>すべて見る {Ico.arrow}</button>
        </div>
      </header>
      <div className="pub-story-row">
        {list.map((v, i) => (
          <button key={v.id} className="pub-story" onClick={onMore}>
            <div className={`pub-story-ring ${v.featured ? "is-featured" : ""}`}>
              <div className="inner"><div className="veg">{v.emoji}</div></div>
            </div>
            <div className="name">{v.name}</div>
            <div className="price">¥{v.priceJpy}</div>
          </button>
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
        <h1 className="t-mincho">農家と共に、<br/>畑から<span className="accent">食卓</span>へ。</h1>
        <p>昔ながらの八百屋が届ける、新しい食のかたち。<br/>愛知の畑から、毎日の食卓へ。</p>
        <div className="pub-hero-ctas">
          <a className="pub-btn pub-btn-primary">商品を見る {Ico.arrow}</a>
          <a className="pub-btn pub-btn-ghost">ブランドの想い</a>
        </div>
      </div>
      <div className="pub-hero-art" aria-hidden>
        <div className="art-photo art-1" />
        <div className="art-photo art-2" />
        <div className="art-stamp t-en">est. 2024</div>
      </div>
    </div>
  </section>
);

// ── Product grid ────────────────────────────────────────────
const ProductGrid = ({ products, onOpen }) => (
  <section className="pub-section pub-products">
    <header className="pub-section-head">
      <div>
        <div className="t-label">Our Products</div>
        <h3 className="t-mincho">畑とつながる、5つのかたち</h3>
        <p className="pub-lead">農家と協同で生み出した、地域の食をつなぐ仕事たち。</p>
      </div>
    </header>
    <div className="pub-product-grid">
      {products.map((p) => (
        <article key={p.id} className="pub-pcard is-clickable"
          onClick={() => onOpen && onOpen(p.id)}
          tabIndex={0}
          role="link"
          onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && onOpen) { e.preventDefault(); onOpen(p.id); } }}>
          <div className={`img tone-${p.imgTone || "default"}`}>
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
        </article>
      ))}
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

const NewsList = ({ posts, compact = false, onOpen }) => (
  <section className="pub-section pub-news">
    <header className="pub-section-head">
      <div>
        <div className="t-label">News & Updates</div>
        <h3 className="t-mincho">お知らせ</h3>
        <p className="pub-lead">SNS・店舗・イベント情報を一覧で。</p>
      </div>
    </header>
    <ul className="pub-news-list">
      {(compact ? posts.slice(0, 4) : posts).map((n) => {
        const m = sourceMeta[n.source] || sourceMeta.news;
        return (
          <li key={n.id}
            className={`pub-news-item ${onOpen ? "is-clickable" : ""}`}
            onClick={() => onOpen && onOpen(n.id)}
            tabIndex={onOpen ? 0 : -1}
            role={onOpen ? "link" : undefined}
            onKeyDown={(e) => { if (onOpen && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onOpen(n.id); } }}>
            <div className="thumb" aria-hidden>{n.emoji}</div>
            <div className="content">
              <div className="meta">
                <span>{n.date}</span>
                <span className={`pub-tag ${m.cls}`}>{m.label}</span>
              </div>
              <div className="title t-mincho">{n.title}</div>
              {!compact && <p className="body">{n.body}</p>}
            </div>
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
        <p>協同組合「いわくにアグリパートナーズ」と連携し、規格外野菜を活かす商品開発・販路拡大に取り組んでいます。畑で働く人たちの声を、食卓まで届けることが、私たちの仕事です。</p>
        <a className="pub-link inv">取り組みを詳しく見る {Ico.arrow}</a>
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
        <p className="pub-lead">愛知県内に3店舗。直接お越しください。</p>
      </div>
    </header>
    <div className="pub-shops-grid">
      <div className="pub-map" aria-label="店舗マップ">
        {shops.map((s, i) => (
          <div key={s.id} className="map-pin" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
            <span>{i + 1}</span>
          </div>
        ))}
      </div>
      <ul className="pub-shop-list">
        {shops.map((s, i) => (
          <li key={s.id}>
            <div className="num">{i + 1}</div>
            <div className="info">
              <div className="name t-mincho">{s.name}</div>
              <div className="meta">{s.addr}</div>
              <div className="meta">営業 {s.hours}　／　TEL {s.tel}</div>
            </div>
            <a className="pub-link">経路 {Ico.arrow}</a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

// ── Footer ──────────────────────────────────────────────────
const Footer = ({ shops }) => (
  <footer className="pub-footer">
    <div className="pub-footer-inner">
      <div className="col col-brand">
        <Logo size="lg" inverse />
        <div className="tagline t-mincho">農家と共に、<br/>畑から食卓へ。</div>
      </div>
      <div className="col">
        <h5 className="t-en">Sitemap</h5>
        <ul><li>ホーム</li><li>商品・メニュー</li><li>今日の価格</li><li>お知らせ</li><li>店舗一覧</li></ul>
      </div>
      <div className="col">
        <h5 className="t-en">Services</h5>
        <ul><li>オンラインショップ</li><li>お弁当のご予約</li><li>農家との取り組み</li><li>アグリパートナーズ</li><li>お問い合わせ</li></ul>
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
      <span>運営：株式会社さとの味みかわ</span>
      <span>特定商取引法 ／ プライバシーポリシー</span>
      <span className="t-en copy">© 2026 SATONOAJI MIKAWA</span>
    </div>
  </footer>
);

// ── Sticky bottom: price CTA + bottom nav (mobile) ──────────
const PriceCTA = ({ onClick }) => (
  <button className="pub-pricecta" onClick={onClick}>
    <span className="ico">{Ico.tag}</span>
    <span className="label"><small>TODAY'S PRICE</small>今日の販売価格を見る</span>
    <span className="arrow">→</span>
  </button>
);

const BottomNav = ({ current, onNav }) => {
  const items = [
    { key: "home",     ico: Ico.home, label: "ホーム" },
    { key: "products", ico: Ico.bag,  label: "商品" },
    { key: "price",    ico: Ico.tag,  label: "価格" },
    { key: "shops",    ico: Ico.pin,  label: "店舗" },
    { key: "news",     ico: Ico.list, label: "お知らせ" },
  ];
  return (
    <nav className="pub-bnav" aria-label="モバイルナビ">
      {items.map((i) => (
        <button key={i.key}
          className={`pub-bnav-item ${current === i.key ? "is-active" : ""}`}
          onClick={() => onNav(i.key)}>
          <span className="ico">{i.ico}</span>
          <span>{i.label}</span>
        </button>
      ))}
    </nav>
  );
};

// ── Pages ───────────────────────────────────────────────────
const HomePage = ({ store, onNav, onOpenProduct, onOpenNews }) => (
  <>
    <Stories prices={store.dailyPrices} onMore={() => onNav("price")} />
    <Hero />
    <ProductGrid products={store.products} onOpen={onOpenProduct} />
    <NewsList posts={store.posts} compact onOpen={onOpenNews} />
    <AgriBlock />
    <ShopMap shops={store.shops} />
  </>
);

const ProductsPage = ({ store, onOpenProduct }) => (
  <main className="pub-page">
    <header className="pub-page-head">
      <div className="t-label">Products</div>
      <h1 className="t-mincho">商品・メニュー</h1>
      <p>農家直送の旬から、加工品・お弁当まで。気になるものをタップしてください。</p>
    </header>
    <ProductGrid products={store.products} onOpen={onOpenProduct} />
  </main>
);

const ProductDetailPage = ({ store, id, onNav, onOpenProduct }) => {
  const product = store.products.find((p) => p.id === id);
  if (!product) {
    return (
      <main className="pub-page">
        <div className="pub-page-head">
          <Breadcrumb
            items={[{ label: "ホーム", to: "home" }, { label: "商品・メニュー", to: "products" }, { label: "見つかりません" }]}
            onNav={onNav}
          />
          <h1 className="t-mincho">商品が見つかりません</h1>
          <p>削除されたか、URLが間違っている可能性があります。</p>
          <button className="pub-btn pub-btn-ghost" style={{ marginTop: 16 }} onClick={() => onNav("products")}>商品一覧へ戻る</button>
        </div>
      </main>
    );
  }
  const related = store.products.filter((p) => p.id !== product.id).slice(0, 3);
  return (
    <main className="pub-page pub-detail">
      <div className="pub-detail-head">
        <Breadcrumb
          items={[
            { label: "ホーム", to: "home" },
            { label: "商品・メニュー", to: "products" },
            { label: product.title },
          ]}
          onNav={onNav}
        />
      </div>
      <article className="pub-detail-product">
        <div className={`pub-detail-hero img tone-${product.imgTone || "default"}`}>
          <span className="tag">{product.category}</span>
        </div>
        <div className="pub-detail-body">
          <h1 className="t-mincho">{product.title}</h1>
          <p className="pub-detail-desc">{product.desc}</p>
          <div className="pub-detail-pricerow">
            <div className="price">¥{product.priceJpy.toLocaleString()}<small>{product.unit}</small></div>
            <div className="pub-detail-ctas">
              <a className="pub-btn pub-btn-primary">カートに入れる {Ico.arrow}</a>
              <a className="pub-btn pub-btn-ghost">店舗で予約</a>
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
            {related.map((p) => (
              <article key={p.id} className="pub-pcard is-clickable"
                onClick={() => onOpenProduct(p.id)}
                tabIndex={0}
                role="link"
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenProduct(p.id); } }}>
                <div className={`img tone-${p.imgTone || "default"}`}>
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
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

const PricePage = ({ store }) => {
  const featured = store.dailyPrices.filter((p) => p.featured && p.visible);
  const rest     = store.dailyPrices.filter((p) => !p.featured && p.visible);
  return (
    <main className="pub-page">
      <header className="pub-page-head">
        <div className="t-label">Today's Price</div>
        <h1 className="t-mincho">今日の販売価格</h1>
        <p>{new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}　毎朝更新</p>
      </header>
      {featured.length > 0 && (
        <section className="pub-section">
          <div className="t-label">Today's Pick</div>
          <h3 className="t-mincho" style={{ marginTop: 4 }}>本日の目玉商品</h3>
          <div className="pub-feature-grid">
            {featured.map((p) => (
              <article key={p.id} className="pub-feature-card">
                <div className="emoji">{p.emoji}</div>
                <div className="body">
                  <h4 className="t-mincho">{p.name}</h4>
                  <div className="price">¥{p.priceJpy}<small>{p.unit}</small></div>
                </div>
                <span className="ribbon t-en">Today's Pick</span>
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
};

const NewsPage = ({ store, onOpenNews }) => {
  const [filter, setFilter] = useState("all");
  const tabs = [
    { key: "all",   label: "すべて" },
    { key: "ig",    label: "Instagram" },
    { key: "line",  label: "LINE" },
    { key: "event", label: "イベント" },
    { key: "news",  label: "お知らせ" },
  ];
  const filtered = filter === "all" ? store.posts : store.posts.filter((p) => p.source === filter);
  return (
    <main className="pub-page">
      <header className="pub-page-head">
        <div className="t-label">News</div>
        <h1 className="t-mincho">お知らせ</h1>
        <p>サイト・LINE・Instagramの最新情報を1つに。</p>
      </header>
      <div className="pub-filter-row">
        {tabs.map((t) => (
          <button key={t.key}
            className={`pub-chip ${filter === t.key ? "is-active" : ""}`}
            onClick={() => setFilter(t.key)}>{t.label}</button>
        ))}
      </div>
      <NewsList posts={filtered} onOpen={onOpenNews} />
    </main>
  );
};

const NewsDetailPage = ({ store, id, onNav, onOpenNews }) => {
  const post = store.posts.find((p) => p.id === id);
  if (!post) {
    return (
      <main className="pub-page">
        <div className="pub-page-head">
          <Breadcrumb
            items={[{ label: "ホーム", to: "home" }, { label: "お知らせ", to: "news" }, { label: "見つかりません" }]}
            onNav={onNav}
          />
          <h1 className="t-mincho">お知らせが見つかりません</h1>
          <p>削除されたか、URLが間違っている可能性があります。</p>
          <button className="pub-btn pub-btn-ghost" style={{ marginTop: 16 }} onClick={() => onNav("news")}>お知らせ一覧へ戻る</button>
        </div>
      </main>
    );
  }
  const m = sourceMeta[post.source] || sourceMeta.news;
  const related = store.posts.filter((p) => p.id !== post.id).slice(0, 4);
  return (
    <main className="pub-page pub-detail">
      <div className="pub-detail-head">
        <Breadcrumb
          items={[
            { label: "ホーム", to: "home" },
            { label: "お知らせ", to: "news" },
            { label: post.title },
          ]}
          onNav={onNav}
        />
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
                <li key={n.id}
                  className="pub-news-item is-clickable"
                  onClick={() => onOpenNews(n.id)}
                  tabIndex={0}
                  role="link"
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenNews(n.id); } }}>
                  <div className="thumb" aria-hidden>{n.emoji}</div>
                  <div className="content">
                    <div className="meta">
                      <span>{n.date}</span>
                      <span className={`pub-tag ${mm.cls}`}>{mm.label}</span>
                    </div>
                    <div className="title t-mincho">{n.title}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
};

const ShopsPage = ({ store }) => (
  <main className="pub-page">
    <header className="pub-page-head">
      <div className="t-label">Shops</div>
      <h1 className="t-mincho">店舗一覧</h1>
      <p>愛知県内に3店舗。営業時間・アクセス情報をご案内します。</p>
    </header>
    <ShopMap shops={store.shops} />
  </main>
);

const AgriPage = () => (
  <main className="pub-page">
    <header className="pub-page-head">
      <div className="t-label">Agri Partners</div>
      <h1 className="t-mincho">農家との取り組み</h1>
      <p>協同組合いわくにアグリパートナーズと共に、地域の畑をつなぐ。</p>
    </header>
    <AgriBlock />
  </main>
);

// ── Public Site root ────────────────────────────────────────
// Route shape: { name: string, id?: string }. Top-level tabs map to a route
// name only; detail pages add an id. The AppBar / BottomNav highlight by the
// "tab" of the current route — product-detail still highlights "products",
// news-detail still highlights "news".
const tabOf = (name) => {
  if (name === "product-detail") return "products";
  if (name === "news-detail")    return "news";
  return name;
};

function PublicSite() {
  const store = useStore();
  const [route, setRoute] = useState({ name: "home" });

  // navigate accepts a string ("home") or an object ({ name, id })
  const nav = (next) => setRoute(typeof next === "string" ? { name: next } : next);
  const openProduct = (id) => setRoute({ name: "product-detail", id });
  const openNews    = (id) => setRoute({ name: "news-detail",    id });

  // Anchor scrolling on page change
  useEffect(() => {
    const el = document.querySelector(".pub-scroll");
    if (el) el.scrollTo({ top: 0, behavior: "instant" });
  }, [route.name, route.id]);

  const Page = useMemo(() => {
    switch (route.name) {
      case "products":        return <ProductsPage      store={store} onOpenProduct={openProduct} />;
      case "product-detail":  return <ProductDetailPage store={store} id={route.id} onNav={nav} onOpenProduct={openProduct} />;
      case "price":           return <PricePage         store={store} />;
      case "news":            return <NewsPage          store={store} onOpenNews={openNews} />;
      case "news-detail":     return <NewsDetailPage    store={store} id={route.id} onNav={nav} onOpenNews={openNews} />;
      case "shops":           return <ShopsPage         store={store} />;
      case "agri":            return <AgriPage          />;
      default:                return <HomePage          store={store} onNav={nav} onOpenProduct={openProduct} onOpenNews={openNews} />;
    }
  }, [route, store]);

  const activeTab = tabOf(route.name);

  return (
    <div className="pub-root">
      <AppBar onNav={nav} current={activeTab} />
      <div className="pub-scroll">
        {Page}
        <Footer shops={store.shops} />
      </div>
      {activeTab !== "price" && <PriceCTA onClick={() => nav("price")} />}
      <BottomNav current={activeTab} onNav={nav} />
    </div>
  );
}

export default PublicSite;
