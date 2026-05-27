/* global React */
const { Fragment } = React;

// ============================================================
// SHARED PRIMITIVES
// ============================================================

const AppBar = ({ title = "さとの味みかわ" }) => (
  <div className="appbar">
    <div className="logo">{title}</div>
    <div className="icons">
      <span>≡</span>
    </div>
  </div>
);

const Pin = ({ n, style }) => (
  <div className="pin" style={style}>{n}</div>
);

const BottomNav = ({ active = "home", variant = "default" }) => {
  const items = variant === "fab"
    ? [
        { k: "home", label: "ホーム" },
        { k: "products", label: "商品" },
        { k: "fab",  label: "今日", fab: true },
        { k: "shops", label: "店舗" },
        { k: "menu",  label: "メニュー" },
      ]
    : variant === "icons-only"
    ? [
        { k: "home", label: "" },
        { k: "products", label: "" },
        { k: "price", label: "" },
        { k: "shops", label: "" },
        { k: "menu",  label: "" },
      ]
    : [
        { k: "home", label: "ホーム" },
        { k: "products", label: "商品" },
        { k: "price", label: "価格" },
        { k: "shops", label: "店舗" },
        { k: "menu",  label: "メニュー" },
      ];
  return (
    <div className="bnav">
      {items.map(it => (
        <div key={it.k} className={`bnav-item ${active === it.k ? "active" : ""}`}>
          {it.fab ? (
            <div style={{
              width: 44, height: 44, border: "2.5px solid currentColor",
              borderRadius: "50%", marginTop: -18, background: "var(--paper)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Caveat", fontSize: 14
            }}>価格</div>
          ) : (
            <div className="ico" />
          )}
          {it.label && <span>{it.label}</span>}
        </div>
      ))}
    </div>
  );
};

const Stories = ({ count = 6 }) => (
  <div className="stories">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="story">
        <div className={`story-ring ${i > 3 ? "viewed" : ""}`} />
        <div>{["きゅうり","トマト","なす","ぶどう","じゃがいも","ねぎ"][i] || "野菜"}</div>
      </div>
    ))}
  </div>
);

const ConceptScroll = () => (
  <div className="hscroll" style={{ paddingBottom: 8 }}>
    {["農家直送", "地域密着", "全国発送", "オンライン", "農家支援"].map((c, i) => (
      <div key={i} className="hscroll-card" style={{ width: 110, height: 110 }}>
        <div className="img" style={{ height: 60 }} />
        <div className="body" style={{ textAlign: "center", fontFamily: "Caveat" }}>{c}</div>
      </div>
    ))}
  </div>
);

const ProductScroll = ({ label = "商品・メニュー" }) => (
  <Fragment>
    <div className="sec-head">
      <h3>{label}</h3>
      <span className="more">すべて →</span>
    </div>
    <div className="hscroll">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="hscroll-card">
          <div className="img" />
          <div className="body">
            <div className="line med" style={{ height: 4 }} />
            <div className="line short" style={{ height: 3, opacity: 0.4 }} />
          </div>
        </div>
      ))}
    </div>
  </Fragment>
);

const NewsList = ({ items = 3, dense = false }) => (
  <Fragment>
    <div className="sec-head">
      <h3>お知らせ</h3>
      <span className="more">一覧 →</span>
    </div>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="news-item">
        <div className="meta">
          <span>2026.04.{20 + i}</span>
          <span className={`tag ${["tag-ig","tag-line","tag-event"][i % 3]}`}>
            {["IG","LINE","イベント"][i % 3]}
          </span>
        </div>
        {!dense && <div className="line long" style={{ height: 4, marginTop: 4 }} />}
        {!dense && <div className="line med" style={{ height: 3, opacity: 0.4 }} />}
      </div>
    ))}
  </Fragment>
);

const AgriBlock = () => (
  <div style={{ margin: "16px 14px", border: "1.5px solid var(--ink)", borderRadius: 6, padding: 12 }}>
    <div className="handwriting" style={{ fontSize: 14, marginBottom: 4 }}>
      アグリパートナーズ連携
    </div>
    <div className="line long" style={{ height: 3, opacity: 0.5 }} />
    <div className="line med" style={{ height: 3, opacity: 0.5 }} />
    <div style={{
      marginTop: 8, height: 70, background:
        "repeating-linear-gradient(135deg, transparent 0, transparent 6px, rgba(26,26,26,0.1) 6px, rgba(26,26,26,0.1) 7px)",
      border: "1px dashed var(--ink-3)", borderRadius: 4,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Caveat", fontSize: 12, color: "var(--ink-2)"
    }}>
      農家／畑 写真エリア
    </div>
  </div>
);

const ShopMap = () => (
  <Fragment>
    <div className="sec-head"><h3>店舗一覧</h3><span className="more">地図 →</span></div>
    <div style={{ margin: "0 14px 16px", border: "1.5px solid var(--ink)", borderRadius: 6, height: 130, position: "relative",
      background: "repeating-linear-gradient(0deg, transparent 0 19px, rgba(26,26,26,0.08) 19px 20px), repeating-linear-gradient(90deg, transparent 0 19px, rgba(26,26,26,0.08) 19px 20px)" }}>
      <div style={{ position: "absolute", top: 30, left: 60 }}>📍</div>
      <div style={{ position: "absolute", top: 80, left: 200 }}>📍</div>
      <div style={{ position: "absolute", top: 60, left: 280 }}>📍</div>
      <div style={{ position: "absolute", bottom: 6, right: 8, fontFamily: "Caveat", fontSize: 11, color: "var(--ink-3)" }}>
        Google Maps
      </div>
    </div>
  </Fragment>
);

// ============================================================
// HERO VARIATIONS
// ============================================================

const HeroFullBleed = () => (
  <Fragment>
    <div className="hero-img" style={{ height: 360 }}>
      <div style={{ fontFamily: "Caveat", fontSize: 12, opacity: 0.7 }}>
        〔 畑の写真／農家の手元 〕
      </div>
      <div style={{ marginTop: 14, fontSize: 18, fontWeight: 600, lineHeight: 1.5 }}>
        農家と共に、<br/>畑から食卓へ。
      </div>
      <div style={{ marginTop: 6, fontSize: 11, opacity: 0.85 }}>
        昔ながらの八百屋が届ける、<br/>新しい食のかたち。
      </div>
    </div>
    <div className="cta primary">今日の販売価格を見る</div>
    <div className="cta secondary">商品・メニュー</div>
    <div className="cta">店舗・予約</div>
  </Fragment>
);

const HeroCopyFirst = () => (
  <div style={{ padding: "30px 18px 14px" }}>
    <div className="handwriting" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em" }}>
      SATONOAJI MIKAWA
    </div>
    <h1 style={{
      fontFamily: '"Kosugi Maru", serif',
      fontSize: 28, fontWeight: 500, lineHeight: 1.4,
      margin: "10px 0 6px"
    }}>
      農家と共に、<br/>畑から<span className="accent-only" style={{ color: "var(--accent-orange)" }}>食卓</span><span className="mono-only">食卓</span>へ。
    </h1>
    <p style={{ fontSize: 12, color: "var(--ink-2)", margin: "0 0 16px" }}>
      昔ながらの八百屋が届ける、新しい食のかたち。
    </p>
    <div className="cta primary" style={{ margin: "6px 0" }}>今日の販売価格</div>
    <div className="cta secondary" style={{ margin: "6px 0" }}>商品・メニュー</div>
    <div className="cta" style={{ margin: "6px 0" }}>店舗・予約</div>
    <div style={{ marginTop: 16, height: 100,
      background: "repeating-linear-gradient(135deg, transparent 0 6px, rgba(26,26,26,0.1) 6px 7px)",
      border: "1px dashed var(--ink-3)", borderRadius: 4,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Caveat", fontSize: 12, color: "var(--ink-2)"
    }}>
      副次的なビジュアル（小）
    </div>
  </div>
);

const HeroStoryFirst = () => (
  <Fragment>
    <div style={{ padding: "14px 14px 4px" }}>
      <div className="handwriting" style={{ fontSize: 14, marginBottom: 2 }}>
        今日の販売価格 <span style={{ color: "var(--ink-3)", fontSize: 12 }}>→ Instagram</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>毎朝更新・タップで詳細</div>
    </div>
    <Stories count={7} />
    <div style={{ padding: "10px 18px 6px" }}>
      <h1 style={{
        fontFamily: '"Kosugi Maru", serif',
        fontSize: 22, fontWeight: 500, lineHeight: 1.45,
        margin: "0 0 4px"
      }}>
        農家と共に、畑から食卓へ。
      </h1>
      <p style={{ fontSize: 11, color: "var(--ink-2)", margin: 0 }}>
        昔ながらの八百屋が届ける、新しい食のかたち。
      </p>
    </div>
    <div className="cta primary">商品・メニュー</div>
    <div className="cta secondary">弁当のご予約</div>
  </Fragment>
);

const HeroSplit = () => (
  <Fragment>
    <div className="hero-img" style={{ height: 220 }}>
      <div style={{ fontFamily: "Caveat", fontSize: 11, opacity: 0.7 }}>
        〔 農家の風景 〕
      </div>
      <div style={{ marginTop: 8, fontSize: 16, fontWeight: 600 }}>
        農家と共に、<br/>畑から食卓へ。
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "10px 14px" }}>
      <div style={{ border: "1.5px solid var(--ink)", borderRadius: 4, padding: 10, height: 80 }}>
        <div className="handwriting" style={{ fontSize: 13 }}>商品・メニュー</div>
        <div className="line med" style={{ height: 3, opacity: 0.5 }} />
        <div style={{ position: "absolute", marginTop: 24, fontFamily: "Caveat", color: "var(--ink-3)", fontSize: 12 }}>→</div>
      </div>
      <div style={{ border: "1.5px solid var(--ink)", borderRadius: 4, padding: 10, height: 80,
        background: "rgba(26,26,26,0.04)" }}>
        <div className="handwriting" style={{ fontSize: 13 }}>今日の価格</div>
        <div className="line med" style={{ height: 3, opacity: 0.5 }} />
      </div>
      <div style={{ border: "1.5px solid var(--ink)", borderRadius: 4, padding: 10, height: 80 }}>
        <div className="handwriting" style={{ fontSize: 13 }}>店舗・地図</div>
        <div className="line short" style={{ height: 3, opacity: 0.5 }} />
      </div>
      <div style={{ border: "1.5px solid var(--ink)", borderRadius: 4, padding: 10, height: 80 }}>
        <div className="handwriting" style={{ fontSize: 13 }}>弁当の予約</div>
        <div className="line short" style={{ height: 3, opacity: 0.5 }} />
      </div>
    </div>
  </Fragment>
);

// ============================================================
// FULL TOP PAGES — 4 variations
// ============================================================

const TopPageA = () => (
  <Fragment>
    <AppBar />
    <Pin n="1" style={{ top: 60, right: 12 }} />
    <HeroFullBleed />
    <Pin n="2" style={{ top: 470, right: 12 }} />
    <div className="sec-head"><h3>今日の販売価格</h3><span className="more">→</span></div>
    <Stories />
    <div className="sec-head"><h3>コンセプト</h3></div>
    <ConceptScroll />
    <NewsList items={3} />
    <AgriBlock />
    <ProductScroll />
    <ShopMap />
    <div style={{ height: 80 }} />
    <BottomNav active="home" />
  </Fragment>
);

const TopPageB = () => (
  <Fragment>
    <AppBar />
    <Pin n="1" style={{ top: 60, right: 12 }} />
    <HeroCopyFirst />
    <Pin n="2" style={{ top: 420, right: 12 }} />
    <div className="sec-head"><h3>今日の販売価格</h3><span className="more">→</span></div>
    <Stories />
    <ProductScroll />
    <div className="sec-head"><h3>コンセプト</h3></div>
    <ConceptScroll />
    <NewsList items={3} />
    <AgriBlock />
    <ShopMap />
    <div style={{ height: 80 }} />
    <BottomNav active="home" />
  </Fragment>
);

const TopPageC = () => (
  <Fragment>
    <AppBar />
    <Pin n="1" style={{ top: 60, right: 12 }} />
    <HeroStoryFirst />
    <Pin n="2" style={{ top: 320, right: 12 }} />
    <div className="sec-head"><h3>コンセプト</h3></div>
    <ConceptScroll />
    <ProductScroll />
    <NewsList items={2} />
    <AgriBlock />
    <ShopMap />
    <div style={{ height: 80 }} />
    <BottomNav active="home" variant="fab" />
  </Fragment>
);

const TopPageD = () => (
  <Fragment>
    <AppBar />
    <Pin n="1" style={{ top: 60, right: 12 }} />
    <HeroSplit />
    <Pin n="2" style={{ top: 430, right: 12 }} />
    <div className="sec-head"><h3>今日の販売価格</h3><span className="more">→</span></div>
    <Stories />
    <ProductScroll />
    <NewsList items={2} dense />
    <div className="sec-head"><h3>コンセプト</h3></div>
    <ConceptScroll />
    <AgriBlock />
    <ShopMap />
    <div style={{ height: 80 }} />
    <BottomNav active="home" />
  </Fragment>
);

// ============================================================
// SUB-PAGES
// ============================================================

const ProductsPage = () => (
  <Fragment>
    <AppBar title="商品・メニュー" />
    <Pin n="1" style={{ top: 60, right: 12 }} />
    <div style={{ padding: "12px 14px 6px" }}>
      <div className="handwriting" style={{ fontSize: 18 }}>商品・メニュー</div>
      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Shopify連携</div>
    </div>
    {/* category chips */}
    <div className="hscroll" style={{ paddingBottom: 6 }}>
      {["すべて","野菜","加工品","弁当","ギフト"].map((c, i) => (
        <div key={i} style={{
          flexShrink: 0, padding: "6px 14px",
          border: i === 0 ? "2px solid var(--ink)" : "1.5px solid var(--ink-3)",
          borderRadius: 16, fontFamily: "Caveat", fontSize: 13,
          background: i === 0 ? "var(--ink)" : "transparent",
          color: i === 0 ? "var(--paper)" : "var(--ink-2)"
        }}>{c}</div>
      ))}
    </div>
    <Pin n="2" style={{ top: 200, right: 12 }} />
    {/* grid */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "8px 14px" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ border: "1.5px solid var(--ink)", borderRadius: 6 }}>
          <div className="hero-img" style={{ height: 110, padding: 0, borderBottom: "1.5px solid var(--ink)" }} />
          <div style={{ padding: 8 }}>
            <div className="line long" style={{ height: 4 }} />
            <div className="line short" style={{ height: 3, opacity: 0.5 }} />
            <div style={{ marginTop: 6, fontFamily: "Caveat", fontWeight: 700, fontSize: 14 }} className="accent-only" >
              <span style={{ color: "var(--accent-orange)" }}>¥ ◯◯◯</span>
            </div>
            <div style={{ marginTop: 6, fontFamily: "Caveat", fontWeight: 700, fontSize: 14 }} className="mono-only">¥ ◯◯◯</div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ height: 80 }} />
    <BottomNav active="products" />
  </Fragment>
);

const PricePage = () => (
  <Fragment>
    <AppBar title="今日の販売価格" />
    <Pin n="1" style={{ top: 60, right: 12 }} />
    <div style={{ padding: "12px 14px 6px" }}>
      <div className="handwriting" style={{ fontSize: 20 }}>今日の販売価格</div>
      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>2026.04.26 更新 ／ Instagram連動</div>
    </div>
    <Stories count={7} />
    <Pin n="2" style={{ top: 230, right: 12 }} />
    {/* large featured */}
    <div style={{ margin: "10px 14px", border: "2px solid var(--ink)", borderRadius: 8, overflow: "hidden" }}>
      <div className="hero-img" style={{ height: 180, padding: 0, borderBottom: "1.5px solid var(--ink)" }} />
      <div style={{ padding: 12 }}>
        <div className="handwriting" style={{ fontSize: 16 }}>本日の目玉</div>
        <div className="line long" style={{ height: 4 }} />
        <div style={{ marginTop: 4, fontFamily: "Caveat", fontWeight: 700, fontSize: 18 }} className="accent-only">
          <span style={{ color: "var(--accent-orange)" }}>¥ ◯◯◯</span>
        </div>
        <div style={{ marginTop: 4, fontFamily: "Caveat", fontWeight: 700, fontSize: 18 }} className="mono-only">¥ ◯◯◯</div>
      </div>
    </div>
    <Pin n="3" style={{ top: 510, right: 12 }} />
    {/* list */}
    <div className="sec-head"><h3>本日の野菜一覧</h3></div>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} style={{
        display: "flex", gap: 10, padding: "10px 14px",
        borderBottom: "1px dashed var(--ink-3)"
      }}>
        <div style={{ width: 50, height: 50,
          background: "repeating-linear-gradient(135deg, transparent 0 6px, rgba(26,26,26,0.1) 6px 7px)",
          border: "1px solid var(--ink)", borderRadius: 4 }} />
        <div style={{ flex: 1 }}>
          <div className="line med" style={{ height: 4 }} />
          <div className="line short" style={{ height: 3, opacity: 0.4 }} />
        </div>
        <div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 15, alignSelf: "center" }} className="accent-only">
          <span style={{ color: "var(--accent-orange)" }}>¥ ◯◯◯</span>
        </div>
        <div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 15, alignSelf: "center" }} className="mono-only">¥ ◯◯◯</div>
      </div>
    ))}
    <div style={{ height: 80 }} />
    <BottomNav active="price" />
  </Fragment>
);

const NewsPage = () => (
  <Fragment>
    <AppBar title="お知らせ" />
    <Pin n="1" style={{ top: 60, right: 12 }} />
    <div style={{ padding: "12px 14px 6px" }}>
      <div className="handwriting" style={{ fontSize: 20 }}>お知らせ一覧</div>
      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>SNS（IG・LINE）と店舗情報を一元表示</div>
    </div>
    {/* filter chips */}
    <div className="hscroll" style={{ paddingBottom: 6 }}>
      {["すべて","Instagram","LINE","イベント","アグリ","お知らせ"].map((c, i) => (
        <div key={i} style={{
          flexShrink: 0, padding: "5px 12px",
          border: i === 0 ? "2px solid var(--ink)" : "1.5px solid var(--ink-3)",
          borderRadius: 16, fontFamily: "Caveat", fontSize: 12,
          background: i === 0 ? "var(--ink)" : "transparent",
          color: i === 0 ? "var(--paper)" : "var(--ink-2)"
        }}>{c}</div>
      ))}
    </div>
    <Pin n="2" style={{ top: 200, right: 12 }} />
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="news-item" style={{ paddingTop: 12, paddingBottom: 12 }}>
        <div className="meta">
          <span>2026.04.{26 - i}</span>
          <span className={`tag ${["tag-ig","tag-line","tag-event","tag-ig"][i % 4]}`}>
            {["IG","LINE","イベント","IG"][i % 4]}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          {i % 2 === 0 && <div style={{
            width: 64, height: 64, flexShrink: 0,
            background: "repeating-linear-gradient(135deg, transparent 0 5px, rgba(26,26,26,0.1) 5px 6px)",
            border: "1px solid var(--ink)", borderRadius: 4
          }} />}
          <div style={{ flex: 1 }}>
            <div className="line long" style={{ height: 4 }} />
            <div className="line long" style={{ height: 3, opacity: 0.5 }} />
            <div className="line med" style={{ height: 3, opacity: 0.5 }} />
          </div>
        </div>
      </div>
    ))}
    <div style={{ height: 80 }} />
    <BottomNav active="menu" />
  </Fragment>
);

const ShopsPage = () => (
  <Fragment>
    <AppBar title="店舗一覧" />
    <Pin n="1" style={{ top: 60, right: 12 }} />
    <div style={{ padding: "12px 14px 6px" }}>
      <div className="handwriting" style={{ fontSize: 20 }}>店舗一覧</div>
    </div>
    <div style={{ margin: "0 14px", border: "1.5px solid var(--ink)", borderRadius: 6, height: 200, position: "relative",
      background: "repeating-linear-gradient(0deg, transparent 0 19px, rgba(26,26,26,0.08) 19px 20px), repeating-linear-gradient(90deg, transparent 0 19px, rgba(26,26,26,0.08) 19px 20px)" }}>
      <div style={{ position: "absolute", top: 50, left: 80, fontSize: 22 }}>📍</div>
      <div style={{ position: "absolute", top: 110, left: 200, fontSize: 22 }}>📍</div>
      <div style={{ position: "absolute", top: 80, left: 270, fontSize: 22 }}>📍</div>
      <div style={{ position: "absolute", bottom: 6, right: 8, fontFamily: "Caveat", fontSize: 11, color: "var(--ink-3)" }}>
        Google Maps Embed
      </div>
    </div>
    <Pin n="2" style={{ top: 320, right: 12 }} />
    {/* shop cards */}
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} style={{
        margin: "12px 14px", border: "1.5px solid var(--ink)", borderRadius: 6,
        display: "flex", overflow: "hidden"
      }}>
        <div style={{
          width: 100, flexShrink: 0,
          background: "repeating-linear-gradient(135deg, transparent 0 6px, rgba(26,26,26,0.1) 6px 7px)",
          borderRight: "1.5px solid var(--ink)"
        }} />
        <div style={{ padding: 10, flex: 1 }}>
          <div className="handwriting" style={{ fontSize: 15 }}>{["みかわ本店","みかわ西尾店","みかわ岡崎店","みかわ豊田店"][i]}</div>
          <div className="line long" style={{ height: 3, opacity: 0.5 }} />
          <div className="line med" style={{ height: 3, opacity: 0.5 }} />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <span className="tag">営業中</span>
            <span style={{ fontFamily: "Caveat", fontSize: 11, color: "var(--ink-3)" }}>9:00 - 19:00</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <span style={{ border: "1.5px solid var(--ink)", padding: "3px 8px", fontFamily: "Caveat", fontSize: 11, borderRadius: 3 }}>
              ☎ 電話
            </span>
            <span style={{ border: "1.5px solid var(--ink)", padding: "3px 8px", fontFamily: "Caveat", fontSize: 11, borderRadius: 3 }}>
              ↗ 経路
            </span>
          </div>
        </div>
      </div>
    ))}
    <div style={{ height: 80 }} />
    <BottomNav active="shops" />
  </Fragment>
);

// expose
Object.assign(window, {
  AppBar, BottomNav, Stories, ConceptScroll, ProductScroll, NewsList,
  AgriBlock, ShopMap, Pin,
  HeroFullBleed, HeroCopyFirst, HeroStoryFirst, HeroSplit,
  TopPageA, TopPageB, TopPageC, TopPageD,
  ProductsPage, PricePage, NewsPage, ShopsPage,
});
