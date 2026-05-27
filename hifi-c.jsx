/* global React */
const HF = {};

// ── Icons (simple SVGs) ─────────────────────────────────────
const Icon = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5" strokeLinecap="round"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round"/></svg>,
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" strokeLinejoin="round"/></svg>,
  bag: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 8h14l-1 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 8V6a3 3 0 0 1 6 0v2" strokeLinejoin="round"/></svg>,
  tag: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 12V4h8l10 10-8 8z" strokeLinejoin="round"/><circle cx="8" cy="9" r="1.5"/></svg>,
  pin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>,
  list: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 6h12M8 12h12M8 18h12" strokeLinecap="round"/><circle cx="4" cy="6" r="1.2" fill="currentColor"/><circle cx="4" cy="12" r="1.2" fill="currentColor"/><circle cx="4" cy="18" r="1.2" fill="currentColor"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ig: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>,
  line: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3c5 0 9 3.3 9 7.4 0 4-4 7.3-9 7.3-.7 0-1.4-.1-2-.2L6 20l1-3.3C5 15.3 3 13 3 10.4 3 6.3 7 3 12 3z" strokeLinejoin="round"/></svg>,
  mail: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>,
};

// ── Status bar ──────────────────────────────────────────────
const StatusBar = () => (
  <div className="hifi-status">
    <span>9:41</span>
    <span className="right">
      <svg width="16" height="11" viewBox="0 0 18 12" fill="currentColor"><rect y="9" width="3" height="3" rx="0.5"/><rect x="5" y="6" width="3" height="6" rx="0.5"/><rect x="10" y="3" width="3" height="9" rx="0.5"/><rect x="15" width="3" height="12" rx="0.5"/></svg>
      <svg width="22" height="11" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="0.5" width="20" height="11" rx="2"/><rect x="2" y="2" width="14" height="8" rx="1" fill="currentColor"/><rect x="21" y="4" width="2" height="4" rx="0.5" fill="currentColor"/></svg>
    </span>
  </div>
);

// ── App bar ─────────────────────────────────────────────────
const AppBar = () => (
  <div className="h-appbar">
    <div className="h-logo">
      <div className="mark">里</div>
      <div className="name">
        さとの味みかわ
        <small>SATONOAJI MIKAWA</small>
      </div>
    </div>
    <div className="h-icons">
      {Icon.search}
      {Icon.menu}
    </div>
  </div>
);

// ── Stories — first view ────────────────────────────────────
const veggies = [
  { emoji: "🍅", name: "トマト", price: "¥280" },
  { emoji: "🥒", name: "きゅうり", price: "¥120" },
  { emoji: "🍆", name: "なす", price: "¥180" },
  { emoji: "🌽", name: "とうもろこし", price: "¥220" },
  { emoji: "🥬", name: "小松菜", price: "¥150" },
  { emoji: "🍇", name: "ぶどう", price: "¥680" },
  { emoji: "🥕", name: "にんじん", price: "¥130" },
  { emoji: "🧅", name: "玉ねぎ", price: "¥100" },
];

const Stories = () => (
  <>
    <div className="h-story-head">
      <div>
        <div className="label">Today's Price</div>
        <h2>今日の販売価格</h2>
      </div>
      <div className="date">04.26 SUN<br/>毎朝更新</div>
    </div>
    <div className="h-stories">
      {veggies.map((v, i) => (
        <div key={i} className="h-story">
          <div className={`h-story-ring ${i > 5 ? "viewed" : ""}`}>
            <div className="inner">
              <div className="veg">{v.emoji}</div>
            </div>
          </div>
          <div className="name">{v.name}</div>
          <div className="price">{v.price}</div>
        </div>
      ))}
    </div>
  </>
);

// ── Hero ────────────────────────────────────────────────────
const Hero = () => (
  <div className="h-hero">
    <div className="ja-en">From Farm to Table</div>
    <h1>農家と共に、<br/>畑から<span className="accent">食卓</span>へ。</h1>
    <p>昔ながらの八百屋が届ける、新しい食のかたち。<br/>愛知の畑から、毎日の食卓へ。</p>
  </div>
);

// ── Concept + Product unified section ───────────────────────
const conceptProducts = [
  { tag: "農家直送", title: "三河の畑から", desc: "契約農家の朝採れ野菜を、その日のうちに店頭へ。", price: null, photoClass: "" },
  { tag: "看板商品", title: "三河野菜の旬セット", desc: "旬の野菜10品をバランスよく詰め合わせ。", price: "2,480", unit: "/ セット", photoClass: "green" },
  { tag: "弁当配達", title: "ヤクルト式 お弁当便", desc: "週替わりのカタログから選べる、地域密着の弁当配達。", price: "650", unit: "/ 1食〜", photoClass: "orange" },
  { tag: "加工品", title: "農家のジャム・漬物", desc: "規格外野菜から生まれる、季節の保存食。全国発送可。", price: "880", unit: "〜", photoClass: "" },
  { tag: "オンライン", title: "産直オンラインストア", desc: "全国どこからでも、三河の旬をお取り寄せ。", price: null, photoClass: "green" },
];

const Section = () => (
  <div className="h-section">
    <div className="h-sec-label">Our Story · Our Products</div>
    <h3 className="h-sec-title">畑とつながる、5つのかたち</h3>
    <p className="h-sec-lead">農家と協同で生み出した、地域の食をつなぐ仕事たち。</p>
    <div className="h-pcards">
      {conceptProducts.map((c, i) => (
        <div key={i} className="h-pcard">
          <div className={`img ${c.photoClass}`}>
            <span className="tag-pill">{c.tag}</span>
          </div>
          <div className="body">
            <h4>{c.title}</h4>
            <p>{c.desc}</p>
            {c.price && <div className="price">¥{c.price}<small>{c.unit}</small></div>}
            {!c.price && <div className="price" style={{ fontSize: 13, color: "var(--green)", display: "flex", alignItems: "center", gap: 4 }}>詳しく見る <span style={{ fontSize: 14 }}>→</span></div>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── News ────────────────────────────────────────────────────
const news = [
  { date: "2026.04.26", tag: "ig", tagLabel: "Instagram", title: "本日の入荷：愛知の朝採れトマトが入りました", emoji: "🍅" },
  { date: "2026.04.25", tag: "line", tagLabel: "LINE", title: "週末セール開催のお知らせ・15時から店頭にて", emoji: "🎁" },
  { date: "2026.04.22", tag: "event", tagLabel: "イベント", title: "5月「畑の収穫体験」参加者募集中", emoji: "🌱" },
  { date: "2026.04.20", tag: "news", tagLabel: "お知らせ", title: "ゴールデンウィーク営業時間のご案内", emoji: "📅" },
];

const News = () => (
  <div style={{ padding: "32px 22px", background: "var(--beige-base)" }}>
    <div className="h-sec-label">News & Updates</div>
    <h3 className="h-sec-title">お知らせ</h3>
    <p className="h-sec-lead">SNS・店舗・イベント情報を一覧で。</p>
    <div>
      {news.map((n, i) => (
        <div key={i} className="h-news-item">
          <div className="h-news-thumb">{n.emoji}</div>
          <div style={{ flex: 1 }}>
            <div className="h-news-meta">
              <span>{n.date}</span>
              <span className={`h-tag ${n.tag}`}>{n.tagLabel}</span>
            </div>
            <div className="h-news-title">{n.title}</div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 16, textAlign: "center" }}>
      <a style={{ fontSize: 12, color: "var(--green)", fontWeight: 600, letterSpacing: "0.04em" }}>
        お知らせ一覧を見る →
      </a>
    </div>
  </div>
);

// ── Agri Partners ───────────────────────────────────────────
const Agri = () => (
  <div style={{ padding: "0 22px" }}>
    <div className="h-agri">
      <div className="h-sec-label">Iwakuni Agri Partners</div>
      <h3>農家と共に、ものづくり。</h3>
      <p>協同組合「いわくにアグリパートナーズ」と連携し、規格外野菜を活かす商品開発・販路拡大に取り組んでいます。</p>
      <div className="photo">〔 農家・畑の風景写真 〕</div>
      <a className="link">取り組みを詳しく見る {Icon.arrow}</a>
    </div>
  </div>
);

// ── Shops ───────────────────────────────────────────────────
const shops = [
  { name: "みかわ本店", addr: "愛知県岡崎市本町◯-◯", hours: "9:00 - 19:00", x: 80, y: 60 },
  { name: "みかわ西尾店", addr: "愛知県西尾市駅前◯-◯", hours: "9:00 - 19:00", x: 200, y: 110 },
  { name: "みかわ豊田店", addr: "愛知県豊田市駅前◯-◯", hours: "10:00 - 20:00", x: 270, y: 50 },
];

const Shops = () => (
  <div style={{ padding: "32px 22px 8px", background: "var(--beige-base)" }}>
    <div className="h-sec-label">Our Shops</div>
    <h3 className="h-sec-title">店舗一覧</h3>
    <p className="h-sec-lead">愛知県内に3店舗。直接お越しください。</p>
    <div className="h-map">
      {shops.map((s, i) => (
        <div key={i} className="pin" style={{ left: s.x, top: s.y }}><span>{i + 1}</span></div>
      ))}
    </div>
    {shops.map((s, i) => (
      <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < shops.length - 1 ? "1px solid var(--beige-deep)" : "none", alignItems: "center" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--orange)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Shippori Mincho, serif", fontSize: 14, color: "var(--green)", fontWeight: 500 }}>{s.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-sub)", marginTop: 2 }}>{s.addr} ／ {s.hours}</div>
        </div>
        <a style={{ color: "var(--orange)", fontSize: 11, fontWeight: 600 }}>経路 →</a>
      </div>
    ))}
  </div>
);

// ── Footer ──────────────────────────────────────────────────
const Footer = () => (
  <div className="h-footer">
    <div className="f-logo">
      <div className="mark">里</div>
      <div className="name">
        さとの味みかわ
        <small>SATONOAJI MIKAWA</small>
      </div>
    </div>
    <div className="f-tagline">
      農家と共に、<br/>畑から食卓へ。
    </div>

    <div className="f-cols">
      <div>
        <h5>Sitemap</h5>
        <ul>
          <li>ホーム</li>
          <li>商品・メニュー</li>
          <li>今日の価格</li>
          <li>お知らせ</li>
          <li>店舗一覧</li>
        </ul>
      </div>
      <div>
        <h5>Services</h5>
        <ul>
          <li>オンラインショップ</li>
          <li>お弁当のご予約</li>
          <li>農家との取り組み</li>
          <li>アグリパートナーズ</li>
          <li>お問い合わせ</li>
        </ul>
      </div>
    </div>

    <div className="f-shops">
      <h5>Shops</h5>
      {shops.map((s, i) => (
        <div key={i} className="f-shop">
          <div className="name">{s.name}</div>
          <div className="meta">
            <span>{s.hours}</span>
            <span>{s.addr}</span>
          </div>
        </div>
      ))}
    </div>

    <h5>Follow Us</h5>
    <div className="f-sns">
      <a>{Icon.ig}</a>
      <a>{Icon.line}</a>
      <a>{Icon.mail}</a>
    </div>

    <div className="f-legal">
      <span>運営：株式会社さとの味みかわ</span>
      <span>特定商取引法 ／ プライバシーポリシー</span>
      <span className="copy">© 2026 SATONOAJI MIKAWA</span>
    </div>
  </div>
);

// ── Sticky price bar ────────────────────────────────────────
const PriceBar = () => (
  <div className="h-price-bar">
    <div className="ico">{Icon.tag}</div>
    <div className="label">
      <small>TODAY'S PRICE</small>
      今日の販売価格を見る
    </div>
    <div className="arrow">→</div>
  </div>
);

// ── Bottom nav ──────────────────────────────────────────────
const BottomNav = () => {
  const items = [
    { ico: Icon.home, label: "ホーム", active: true },
    { ico: Icon.bag, label: "商品" },
    { ico: Icon.tag, label: "価格" },
    { ico: Icon.pin, label: "店舗" },
    { ico: Icon.list, label: "メニュー" },
  ];
  return (
    <div className="h-bnav">
      {items.map((it, i) => (
        <div key={i} className={`h-bnav-item ${it.active ? "active" : ""}`}>
          <div className="ico">{it.ico}</div>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Phone shell (hi-fi C page) ──────────────────────────────
const HiFiCPage = () => (
  <div className="hifi-phone">
    <div className="hifi-notch" />
    <StatusBar />
    <div className="hifi-screen">
      <AppBar />
      <Stories />
      <Hero />
      <Section />
      <News />
      <Agri />
      <Shops />
      <div className="h-bottom-pad" />
      <Footer />
    </div>
    <PriceBar />
    <BottomNav />
  </div>
);

window.HiFiCPage = HiFiCPage;
