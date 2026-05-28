"use client";

/**
 * Admin app — working prototype.
 *
 * Authentication is now handled by Auth.js (NextAuth v5); the role-based
 * page filter lives in `../lib/auth`. The data layer (MikawaAPI) is still
 * client-side / localStorage in the prototype phase.
 */
import { useState, useEffect, useMemo } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import MikawaAPI from "../lib/api";
import * as Auth from "../lib/auth";

function useAdminStore() {
  const [s, setS] = useState(() => MikawaAPI.getState());
  useEffect(() => MikawaAPI.on(setS), []);
  return s;
}

const fmt = (n) => "¥" + n.toLocaleString();
const yenToInt = (s) => parseInt(String(s).replace(/[^\d]/g, ""), 10) || 0;

// ── Sidebar ─────────────────────────────────────────────────
const ALL_ITEMS = [
  { key: "post",      icon: "✍︎", label: "クイック投稿" },
  { key: "prices",    icon: "₸",  label: "価格管理" },
  { key: "news",      icon: "📣", label: "お知らせ管理" },
  { key: "products",  icon: "🥬", label: "商品管理" },
  { key: "sns",       icon: "⇆",  label: "SNS連携状況" },
];

const AdminSidebar = ({ current, onNav, session }) => {
  const allowed = Auth.pagesFor(session?.role);
  const items = ALL_ITEMS.filter((i) => allowed.includes(i.key));
  const isOwner = session?.role === "owner";
  return (
    <aside className="adm-side">
      <div className="adm-side-brand">
        <img src="/logo.png" alt="里の味みかわ" />
        <small className="kicker">ADMIN CONSOLE</small>
      </div>
      <div className="adm-side-user">
        <div className="who">
          <span className={`role-badge role-${session?.role}`}>{session?.role === "owner" ? "OWNER" : "STAFF"}</span>
          <span className="name">{session?.name}</span>
        </div>
        <button className="adm-side-logout" onClick={() => signOut({ redirect: false })}>ログアウト</button>
      </div>
      <nav className="adm-side-nav">
        {items.map((i) => (
          <button key={i.key}
            className={`adm-side-item ${current === i.key ? "is-active" : ""}`}
            onClick={() => onNav(i.key)}>
            <span className="ico">{i.icon}</span>
            <span>{i.label}</span>
          </button>
        ))}
      </nav>
      {isOwner && (
        <div className="adm-side-foot">
          <button className="adm-side-reset" onClick={() => {
            if (confirm("初期データに戻しますか？")) MikawaAPI.reset();
          }}>初期データに戻す</button>
        </div>
      )}
    </aside>
  );
};

// ── Login screen ────────────────────────────────────────────
function AdminLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e?.preventDefault();
    setError(null);
    setBusy(true);
    const res = await signIn("credentials", { user: user.trim(), pass, redirect: false });
    setBusy(false);
    if (res?.error) setError("ユーザー名またはパスワードが違います");
  };
  const quick = async (u) => {
    setBusy(true);
    await signIn("credentials", { user: u, pass: u, redirect: false });
    setBusy(false);
  };
  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={submit}>
        <div className="adm-login-brand">
          <img src="/logo.png" alt="里の味みかわ" />
          <small className="kicker">ADMIN CONSOLE</small>
        </div>
        <h2 className="t-mincho">管理画面にログイン</h2>
        <label className="adm-field">
          <span>ユーザー名</span>
          <input className="adm-input" autoFocus value={user}
            onChange={(e) => setUser(e.target.value)} placeholder="admin / staff" />
        </label>
        <label className="adm-field">
          <span>パスワード</span>
          <input className="adm-input" type="password" value={pass}
            onChange={(e) => setPass(e.target.value)} />
        </label>
        {error && <div className="adm-status adm-status-err">{error}</div>}
        <button className="adm-btn adm-btn-primary adm-login-submit" type="submit" disabled={busy}>
          {busy ? "認証中…" : "ログイン"}
        </button>
        <div className="adm-login-hint">
          <p className="t-label">DEMO ACCOUNTS</p>
          <div className="adm-login-quick">
            <button type="button" onClick={() => quick("admin")} className="adm-login-quickbtn">
              <b>admin</b> / admin <small>オーナー (全機能)</small>
            </button>
            <button type="button" onClick={() => quick("staff")} className="adm-login-quickbtn">
              <b>staff</b> / staff <small>スタッフ (投稿・価格のみ)</small>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Page wrapper ────────────────────────────────────────────
const AdminPage = ({ title, lead, action, children }) => (
  <main className="adm-main">
    <header className="adm-page-head">
      <div>
        <div className="t-label">Admin</div>
        <h1 className="t-mincho">{title}</h1>
        {lead && <p>{lead}</p>}
      </div>
      {action && <div className="adm-page-action">{action}</div>}
    </header>
    <div className="adm-page-body">{children}</div>
  </main>
);

// ── Quick Post ──────────────────────────────────────────────
const ChannelChip = ({ active, onToggle, color, children }) => (
  <button
    className={`adm-channel ${active ? "is-on" : ""}`}
    style={{ "--c": color }}
    onClick={onToggle}
    type="button">
    <span className="dot" /> {children}
  </button>
);

function QuickPost() {
  const [emoji, setEmoji] = useState("📣");
  const [title, setTitle] = useState("");
  const [body,  setBody]  = useState("");
  const [channels, setChannels] = useState({ web: true, line: true, ig: true });
  const [status, setStatus] = useState(null);
  const toggle = (k) => setChannels((c) => ({ ...c, [k]: !c[k] }));

  const submit = async () => {
    if (!title.trim()) { setStatus({ kind: "err", msg: "タイトルを入力してください" }); return; }
    const ch = Object.entries(channels).filter(([, v]) => v).map(([k]) => k);
    if (ch.length === 0) { setStatus({ kind: "err", msg: "配信先を1つ以上選んでください" }); return; }
    setStatus({ kind: "info", msg: "配信中..." });
    await MikawaAPI.news.post({ title, body, emoji, channels: ch, source: ch[0] });
    setStatus({ kind: "ok", msg: `${ch.map((c) => ({web:"サイト",line:"LINE",ig:"Instagram"}[c])).join("・")} に投稿しました` });
    setTitle(""); setBody("");
    setTimeout(() => setStatus(null), 3500);
  };

  const presets = ["📣","🍅","🥒","🥬","🌽","🌱","🎁","📅","🔥"];

  return (
    <AdminPage title="クイック投稿" lead="サイト・LINE・Instagram に同時配信。1か所の入力で完結します。">
      <div className="adm-grid two">
        <section className="adm-card">
          <h3>① 内容を入力</h3>
          <label className="adm-field">
            <span>アイコン</span>
            <div className="adm-emoji-row">
              {presets.map((e) => (
                <button key={e} type="button"
                  className={`adm-emoji ${emoji === e ? "is-active" : ""}`}
                  onClick={() => setEmoji(e)}>{e}</button>
              ))}
            </div>
          </label>
          <label className="adm-field">
            <span>タイトル *</span>
            <input className="adm-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="本日の入荷：岩国の朝採れトマト ..." />
          </label>
          <label className="adm-field">
            <span>本文</span>
            <textarea className="adm-input" rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="販売価格・販売開始時間・なくなり次第終了など" />
          </label>
        </section>

        <section className="adm-card">
          <h3>② 配信先と確認</h3>
          <div className="adm-channels">
            <ChannelChip active={channels.web}  onToggle={() => toggle("web")}  color="#2d5a3d">サイト掲載</ChannelChip>
            <ChannelChip active={channels.line} onToggle={() => toggle("line")} color="#06a448">LINE 配信</ChannelChip>
            <ChannelChip active={channels.ig}   onToggle={() => toggle("ig")}   color="#c8703a">Instagram</ChannelChip>
          </div>
          <div className="adm-preview">
            <div className="adm-preview-head">プレビュー</div>
            <div className="pub-news-item" style={{ borderBottom: "none", padding: "12px 0" }}>
              <div className="thumb">{emoji}</div>
              <div className="content">
                <div className="meta">
                  <span>{new Date().toISOString().slice(0,10)}</span>
                  {channels.ig   && <span className="pub-tag ig">Instagram</span>}
                  {channels.line && <span className="pub-tag line">LINE</span>}
                  {channels.web && !channels.ig && !channels.line && <span className="pub-tag news">お知らせ</span>}
                </div>
                <div className="title t-mincho">{title || "（タイトル未入力）"}</div>
                <p className="body" style={{ whiteSpace: "pre-line" }}>{body || "本文プレビューはここに表示されます。"}</p>
              </div>
            </div>
          </div>
          <div className="adm-actions">
            {status && <div className={`adm-status adm-status-${status.kind}`}>{status.msg}</div>}
            <button className="adm-btn adm-btn-primary" onClick={submit}>配信する</button>
          </div>
        </section>
      </div>
    </AdminPage>
  );
}

// ── Price Manager ───────────────────────────────────────────
function PriceManager() {
  const store = useAdminStore();
  const [draft, setDraft] = useState({});
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState({ emoji: "🍅", name: "", priceJpy: "", unit: "/ 1パック" });

  const update = (id, patch) => MikawaAPI.prices.update(id, patch);
  const flush = (id) => {
    const d = draft[id]; if (!d) return;
    if (d.priceJpy != null) update(id, { priceJpy: yenToInt(d.priceJpy) });
    setDraft((s) => { const { [id]: _, ...rest } = s; return rest; });
  };

  return (
    <AdminPage title="価格管理"
      lead="毎朝の販売価格を更新。表示ON/OFFと目玉設定で公開側がリアルタイムに切り替わります。"
      action={<button className="adm-btn" onClick={() => setAdding(true)}>＋ 品目を追加</button>}>
      <table className="adm-table">
        <thead>
          <tr><th></th><th>品目</th><th>単位</th><th>価格</th><th>表示</th><th>目玉</th><th></th></tr>
        </thead>
        <tbody>
          {store.dailyPrices.map((p) => (
            <tr key={p.id}>
              <td><div className="adm-emoji-cell">{p.emoji}</div></td>
              <td className="t-mincho" style={{ fontSize: 14 }}>{p.name}</td>
              <td><input className="adm-input adm-input-sm" defaultValue={p.unit} onBlur={(e) => update(p.id, { unit: e.target.value })} /></td>
              <td>
                <div className="adm-price-input">
                  <span>¥</span>
                  <input className="adm-input adm-input-sm"
                    defaultValue={p.priceJpy}
                    onChange={(e) => setDraft((s) => ({ ...s, [p.id]: { priceJpy: e.target.value } }))}
                    onBlur={() => flush(p.id)}
                    onKeyDown={(e) => e.key === "Enter" && e.target.blur()} />
                </div>
              </td>
              <td>
                <button className={`adm-toggle ${p.visible ? "is-on" : ""}`}
                  onClick={() => update(p.id, { visible: !p.visible })}>
                  <span /> {p.visible ? "表示中" : "非表示"}
                </button>
              </td>
              <td>
                <button className={`adm-star ${p.featured ? "is-on" : ""}`}
                  onClick={() => update(p.id, { featured: !p.featured })}
                  title="目玉商品にする">★</button>
              </td>
              <td>
                <button className="adm-btn-link adm-btn-danger"
                  onClick={() => confirm(`${p.name} を削除しますか？`) && MikawaAPI.prices.remove(p.id)}>削除</button>
              </td>
            </tr>
          ))}
          {adding && (
            <tr className="adm-row-add">
              <td><input className="adm-input adm-input-sm" maxLength={2} value={newRow.emoji} onChange={(e) => setNewRow({ ...newRow, emoji: e.target.value })} /></td>
              <td><input className="adm-input adm-input-sm" placeholder="品名" value={newRow.name} onChange={(e) => setNewRow({ ...newRow, name: e.target.value })} /></td>
              <td><input className="adm-input adm-input-sm" placeholder="/ 単位" value={newRow.unit} onChange={(e) => setNewRow({ ...newRow, unit: e.target.value })} /></td>
              <td><input className="adm-input adm-input-sm" placeholder="280" value={newRow.priceJpy} onChange={(e) => setNewRow({ ...newRow, priceJpy: e.target.value })} /></td>
              <td colSpan={3}>
                <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={async () => {
                  if (!newRow.name) return;
                  await MikawaAPI.prices.create({ ...newRow, priceJpy: yenToInt(newRow.priceJpy) });
                  setNewRow({ emoji: "🍅", name: "", priceJpy: "", unit: "/ 1パック" });
                  setAdding(false);
                }}>追加</button>
                <button className="adm-btn-link" onClick={() => setAdding(false)}>キャンセル</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </AdminPage>
  );
}

// ── News Manager ────────────────────────────────────────────
function NewsManager() {
  const store = useAdminStore();
  return (
    <AdminPage title="お知らせ管理" lead="過去の投稿を編集・アーカイブ。配信先タグでフィルタも可能。">
      <table className="adm-table">
        <thead>
          <tr><th>日付</th><th>配信先</th><th>タイトル</th><th></th></tr>
        </thead>
        <tbody>
          {store.posts.map((n) => (
            <tr key={n.id}>
              <td className="t-en" style={{ fontSize: 12, color: "var(--c-text-sub)" }}>{n.date}</td>
              <td>
                {n.channels.includes("web")  && <span className="pub-tag news">サイト</span>}{" "}
                {n.channels.includes("line") && <span className="pub-tag line">LINE</span>}{" "}
                {n.channels.includes("ig")   && <span className="pub-tag ig">IG</span>}
              </td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{n.emoji}</span>
                  <div>
                    <div className="t-mincho" style={{ color: "var(--c-text)", fontSize: 14 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: "var(--c-text-sub)", marginTop: 3 }}>{n.body?.slice(0, 60)}{n.body?.length > 60 ? "…" : ""}</div>
                  </div>
                </div>
              </td>
              <td>
                <button className="adm-btn-link adm-btn-danger" onClick={() => confirm("この投稿を削除しますか？") && MikawaAPI.news.remove(n.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminPage>
  );
}

// ── Product Manager ─────────────────────────────────────────
function ProductManager() {
  const store = useAdminStore();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", category: "", priceJpy: "", unit: "", desc: "", imgTone: "green" });

  const open = (p) => { setEditing(p?.id || "new"); setForm(p ? { ...p, priceJpy: String(p.priceJpy) } : { title: "", category: "看板", priceJpy: "", unit: "", desc: "", imgTone: "green" }); };
  const save = async () => {
    const payload = { ...form, priceJpy: yenToInt(form.priceJpy) };
    if (editing && editing !== "new") payload.id = editing;
    await MikawaAPI.shopify.upsertProduct(payload);
    setEditing(null);
  };
  const remove = (id) => confirm("削除しますか？") && MikawaAPI.shopify.deleteProduct(id);

  return (
    <AdminPage title="商品管理"
      lead="Shopify連携データを編集（プロトタイプではローカルにモック）。"
      action={<button className="adm-btn adm-btn-primary" onClick={() => open(null)}>＋ 商品を追加</button>}>
      <div className="adm-grid two">
        <section className="adm-card">
          <h3>商品一覧</h3>
          <ul className="adm-list">
            {store.products.map((p) => (
              <li key={p.id} className={editing === p.id ? "is-active" : ""}>
                <div className={`adm-mini-img tone-${p.imgTone || "default"}`} />
                <div className="info">
                  <div className="t-mincho">{p.title}</div>
                  <div className="meta">{p.category}　{fmt(p.priceJpy)}{p.unit}</div>
                </div>
                <div className="adm-list-actions">
                  <button className="adm-btn-link" onClick={() => open(p)}>編集</button>
                  <button className="adm-btn-link adm-btn-danger" onClick={() => remove(p.id)}>削除</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="adm-card">
          <h3>{editing === "new" ? "新規商品を追加" : editing ? "商品を編集" : "商品を選択"}</h3>
          {!editing && <div className="adm-empty">左の一覧から商品を選択するか、「＋ 商品を追加」してください。</div>}
          {editing && (
            <div className="adm-form">
              <label className="adm-field"><span>商品名</span><input className="adm-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
              <div className="adm-row">
                <label className="adm-field"><span>カテゴリ</span><input className="adm-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
                <label className="adm-field"><span>画像トーン</span>
                  <select className="adm-input" value={form.imgTone || ""} onChange={(e) => setForm({ ...form, imgTone: e.target.value })}>
                    <option value="">標準</option>
                    <option value="green">グリーン</option>
                    <option value="orange">オレンジ</option>
                  </select>
                </label>
              </div>
              <div className="adm-row">
                <label className="adm-field"><span>価格</span>
                  <div className="adm-price-input"><span>¥</span><input className="adm-input" value={form.priceJpy} onChange={(e) => setForm({ ...form, priceJpy: e.target.value })} /></div>
                </label>
                <label className="adm-field"><span>単位</span><input className="adm-input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="/ セット" /></label>
              </div>
              <label className="adm-field"><span>説明</span><textarea className="adm-input" rows={3} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></label>
              <div className="adm-actions">
                <button className="adm-btn-link" onClick={() => setEditing(null)}>キャンセル</button>
                <button className="adm-btn adm-btn-primary" onClick={save}>保存</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminPage>
  );
}

// ── SNS Status ──────────────────────────────────────────────
function SnsStatus() {
  const store = useAdminStore();
  const [busy, setBusy] = useState(null);

  const Card = ({ name, label, children }) => {
    const c = store.connections[name];
    const sync = async () => { setBusy(name); await MikawaAPI.connections.sync(name); setBusy(null); };
    return (
      <section className="adm-conn">
        <div className="adm-conn-head">
          <div>
            <div className="t-en">{label}</div>
            <h3 className="t-mincho">{c.connected ? "連携中" : "未接続"}</h3>
          </div>
          <button className={`adm-toggle adm-toggle-lg ${c.connected ? "is-on" : ""}`}
            onClick={() => MikawaAPI.connections.toggle(name, !c.connected)}>
            <span /> {c.connected ? "ON" : "OFF"}
          </button>
        </div>
        <div className="adm-conn-body">{children}</div>
        <div className="adm-conn-foot">
          <span>最終同期 {c.lastSync}</span>
          <button className="adm-btn-link" disabled={busy === name} onClick={sync}>{busy === name ? "同期中…" : "今すぐ同期"}</button>
        </div>
      </section>
    );
  };

  return (
    <AdminPage title="SNS連携状況" lead="各サービスとの連携状態を確認。プロトタイプではモックですが、本番では実APIキーで同様に管理できます。">
      <div className="adm-grid three">
        <Card name="shopify" label="Shopify Storefront">
          <div className="adm-kv"><span>ショップ</span><b>{store.connections.shopify.shop}</b></div>
          <div className="adm-kv"><span>同期間隔</span><b>{store.connections.shopify.syncIntervalMin}分</b></div>
          <div className="adm-kv"><span>商品数</span><b>{store.products.length}</b></div>
        </Card>
        <Card name="instagram" label="Instagram Basic Display">
          <div className="adm-kv"><span>アカウント</span><b>{store.connections.instagram.handle}</b></div>
          <div className="adm-kv"><span>同期間隔</span><b>{store.connections.instagram.syncIntervalMin}分</b></div>
          <div className="adm-kv"><span>取得済み投稿</span><b>{store.posts.filter((p) => p.channels.includes("ig")).length}</b></div>
        </Card>
        <Card name="line" label="LINE Messaging">
          <div className="adm-kv"><span>チャネル</span><b>{store.connections.line.channel}</b></div>
          <div className="adm-kv"><span>友だち数</span><b>{store.connections.line.reach.toLocaleString()}</b></div>
          <div className="adm-kv"><span>累計配信</span><b>{store.posts.filter((p) => p.channels.includes("line")).length}件</b></div>
        </Card>
      </div>
    </AdminPage>
  );
}

// ── Admin root ──────────────────────────────────────────────
function AdminApp() {
  const { data, status } = useSession();
  const user = data?.user;
  const role = user?.role;
  const [route, setRoute] = useState("post");

  // Clamp the route to what the current role can access. Falls back to
  // the first allowed page if the user landed on something forbidden
  // (e.g. staff logged out of an owner-only page).
  useEffect(() => {
    if (!role) return;
    const allowed = Auth.pagesFor(role);
    if (!allowed.includes(route)) setRoute(allowed[0] || "post");
  }, [role, route]);

  const Page = useMemo(() => {
    switch (route) {
      case "prices":   return <PriceManager />;
      case "news":     return <NewsManager />;
      case "products": return <ProductManager />;
      case "sns":      return <SnsStatus />;
      default:         return <QuickPost />;
    }
  }, [route]);

  if (status === "loading") {
    return <div className="adm-login"><div className="adm-login-card"><p>読み込み中…</p></div></div>;
  }
  if (!user) return <AdminLogin />;

  return (
    <div className="adm-root">
      <AdminSidebar current={route} onNav={setRoute} session={user} />
      {Page}
    </div>
  );
}

export default AdminApp;
