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
import { formatPriceMessage, todayHeadline } from "../lib/format-price-message";
import { nameInitial } from "../lib/veggie-badge";
import { lookupZip } from "../lib/zipcloud";

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
  { key: "orders",    icon: "🎁", label: "贈答注文作成" },
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
        <a className="adm-side-item adm-side-item-link"
          href="/" target="_blank" rel="noopener noreferrer">
          <span className="ico">↗</span>
          <span>サイトを見る</span>
        </a>
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
  const [channels, setChannels] = useState({ web: true, line: true, ig: false });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [fanout, setFanout] = useState(null);
  const [busy, setBusy] = useState(false);

  const toggle = (k) => setChannels((c) => ({ ...c, [k]: !c[k] }));

  const onPickImage = (e) => {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
    setImagePreview(f ? URL.createObjectURL(f) : null);
  };
  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const submit = async () => {
    if (!title.trim()) { setStatus({ kind: "err", msg: "タイトルを入力してください" }); return; }
    const ch = Object.entries(channels).filter(([, v]) => v).map(([k]) => k);
    if (ch.length === 0) { setStatus({ kind: "err", msg: "配信先を1つ以上選んでください" }); return; }
    setBusy(true);
    setStatus({ kind: "info", msg: "配信中…" });
    setFanout(null);

    const fd = new FormData();
    fd.append("title", title);
    fd.append("body", body);
    fd.append("emoji", emoji);
    fd.append("source", ch[0]);
    fd.append("channels", ch.join(","));
    if (imageFile) fd.append("image", imageFile);

    try {
      const r = await fetch("/api/posts", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.hint || j.error || `HTTP ${r.status}`);
      setFanout(j.fanout || {});
      const summary = Object.entries(j.fanout || {})
        .map(([k, v]) => `${({web:"サイト",line:"LINE",ig:"Instagram"})[k] || k}: ${v.ok ? "✓" : "✗"}`)
        .join("　");
      setStatus({ kind: "ok", msg: summary || "投稿しました" });
      // Reset form
      setTitle(""); setBody("");
      clearImage();
    } catch (e) {
      setStatus({ kind: "err", msg: `配信失敗: ${e.message}` });
    } finally {
      setBusy(false);
    }
  };

  const presets = ["📣","🍅","🥒","🥬","🌽","🌱","🎁","📅","🔥","📸"];

  return (
    <AdminPage title="クイック投稿" lead="サイト・LINE に同時配信。画像を添付するとLINEにも画像付きで送られます。Instagramは現在 admin での自動配信に未対応です（チェックを入れても投稿は記録のみ）。">
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
          <label className="adm-field">
            <span>画像（任意）</span>
            <div className="adm-image-picker">
              {imagePreview ? (
                <div className="adm-image-preview">
                  <img src={imagePreview} alt="プレビュー" />
                  <button type="button" className="adm-btn-link adm-btn-danger" onClick={clearImage}>画像を削除</button>
                </div>
              ) : (
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickImage} className="adm-input" />
              )}
            </div>
          </label>
        </section>

        <section className="adm-card">
          <h3>② 配信先と確認</h3>
          <div className="adm-channels">
            <ChannelChip active={channels.web}  onToggle={() => toggle("web")}  color="#2d5a3d">サイト掲載</ChannelChip>
            <ChannelChip active={channels.line} onToggle={() => toggle("line")} color="#06a448">LINE 配信</ChannelChip>
            <ChannelChip active={channels.ig}   onToggle={() => toggle("ig")}   color="#c8703a">Instagram（記録のみ）</ChannelChip>
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
                {imagePreview && (
                  <div style={{ marginTop: 10, maxWidth: 240 }}>
                    <img src={imagePreview} alt="" style={{ width: "100%", borderRadius: 8 }} />
                  </div>
                )}
              </div>
            </div>
          </div>
          {fanout && (
            <ul className="adm-fanout">
              {Object.entries(fanout).map(([k, v]) => (
                <li key={k} className={v.ok ? "ok" : "err"}>
                  <b>{({web:"サイト掲載",line:"LINE 配信",ig:"Instagram"})[k] || k}</b>
                  {v.ok ? " — 完了" : ` — 失敗: ${v.reason || v.body || `HTTP ${v.status}`}`}
                </li>
              ))}
            </ul>
          )}
          <div className="adm-actions">
            {status && <div className={`adm-status adm-status-${status.kind}`}>{status.msg}</div>}
            <button className="adm-btn adm-btn-primary" onClick={submit} disabled={busy}>
              {busy ? "配信中…" : "配信する"}
            </button>
          </div>
        </section>
      </div>
    </AdminPage>
  );
}

// ── Price Manager ───────────────────────────────────────────
/**
 * Staged price editor.
 *
 * On mount, GETs /api/prices. Edits accumulate in local state (the
 * "draft list"); nothing hits the server until the admin clicks 保存.
 *
 *   serverPrices  — last known persisted state (baseline)
 *   prices        — working copy the UI edits against
 *   isDirty       — true when working copy differs from baseline
 *
 * 保存ボタンは差分件数を表示し、押下で PUT /api/prices → 成功時に
 * baseline を引き上げ、失敗時はそのまま留まる（再試行可能）。
 * 破棄ボタンで working copy を baseline まで戻す。離脱前 confirm で
 * 未保存変更の取りこぼしを防ぐ。
 */
function PriceManager() {
  const [serverPrices, setServerPrices] = useState(null); // baseline
  const [prices, setPrices] = useState(null);             // working copy
  const [draft, setDraft] = useState({});
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState({ emoji: "🍅", name: "", priceJpy: "", unit: "/ 1パック" });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  // Bumped on discard so uncontrolled inputs (defaultValue-based) drop
  // their typed-but-unflushed state and re-mount with baseline values.
  const [revision, setRevision] = useState(0);

  // Initial fetch.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/prices", { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!alive) return;
        setServerPrices(data);
        setPrices(data);
      } catch (e) {
        if (alive) setStatus({ kind: "err", msg: `読み込み失敗: ${e.message}` });
      }
    })();
    return () => { alive = false; };
  }, []);

  // Dirty detection + per-row diff count for the save-button label.
  const isDirty = prices !== null
    && serverPrices !== null
    && JSON.stringify(prices) !== JSON.stringify(serverPrices);
  const changeCount = useMemo(() => {
    if (!isDirty || !prices || !serverPrices) return 0;
    const baseById = Object.fromEntries(serverPrices.map((p) => [p.id, p]));
    const nextById = Object.fromEntries(prices.map((p) => [p.id, p]));
    const ids = new Set([...Object.keys(baseById), ...Object.keys(nextById)]);
    let n = 0;
    for (const id of ids) {
      const a = baseById[id], b = nextById[id];
      if (!a || !b) { n++; continue; }
      if (JSON.stringify(a) !== JSON.stringify(b)) n++;
    }
    return n;
  }, [prices, serverPrices, isDirty]);

  // Warn before reload when unsaved.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Persist the working copy. Returns true on success so the broadcast
  // flow can chain a fanout call.
  const save = async () => {
    if (!isDirty || saving) return false;
    setSaving(true);
    setStatus({ kind: "info", msg: "保存中…" });
    try {
      const r = await fetch("/api/prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prices),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.hint || j.error || `HTTP ${r.status}`);
      }
      setServerPrices(prices); // baseline = working copy
      setStatus({ kind: "ok", msg: `${changeCount}件の変更を保存しました` });
      setTimeout(() => setStatus((s) => (s?.kind === "ok" ? null : s)), 2500);
      return true;
    } catch (e) {
      setStatus({ kind: "err", msg: `保存失敗: ${e.message}` });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Save (if dirty) + broadcast today's price board to LINE.
  // Also creates an entry in hp.posts so it shows up in /news and the
  // News Manager history. IG is included in channels for record-only.
  const saveAndBroadcast = async () => {
    if (saving) return;
    if (!confirm("本日の価格表を LINE 友だち全員に配信します。よろしいですか？")) return;

    // Step 1: save current edits (skip if clean)
    if (isDirty) {
      const ok = await save();
      if (!ok) return; // 保存に失敗したら配信しない
    }

    // Step 2: broadcast
    setSaving(true);
    setStatus({ kind: "info", msg: "LINE 配信中…" });
    try {
      const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
      const fd = new FormData();
      fd.append("title", todayHeadline());
      fd.append("body", formatPriceMessage(prices, { siteUrl }));
      fd.append("emoji", "🌟");
      fd.append("source", "line");
      fd.append("channels", "web,line,ig");
      const r = await fetch("/api/posts", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.hint || j.error || `HTTP ${r.status}`);
      const f = j.fanout || {};
      const parts = [];
      parts.push(`サイト ${f.web?.ok ? "✓" : "—"}`);
      parts.push(`LINE ${f.line?.ok ? "✓" : "✗"}${f.line?.ok ? "" : `(${f.line?.reason || f.line?.body || ""})`}`);
      parts.push(`IG ${f.ig?.ok ? "✓" : "—"}`);
      setStatus({
        kind: f.line?.ok ? "ok" : "err",
        msg: parts.join("　"),
      });
    } catch (e) {
      setStatus({ kind: "err", msg: `配信失敗: ${e.message}` });
    } finally {
      setSaving(false);
    }
  };

  // Revert working copy to baseline.
  const discard = () => {
    if (!isDirty) return;
    if (!confirm(`未保存の変更 ${changeCount} 件を破棄しますか？`)) return;
    setPrices(serverPrices);
    setDraft({});
    setAdding(false);
    setStatus(null);
    setRevision((v) => v + 1); // force input remount
  };

  // Local-only edit helpers (no network).
  const update = (id, patch) =>
    setPrices((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  // Swap with neighbor — array order becomes the position column on save.
  const moveRow = (id, delta) =>
    setPrices((cur) => {
      const i = cur.findIndex((p) => p.id === id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= cur.length) return cur;
      const next = cur.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const flush = (id) => {
    const d = draft[id]; if (!d) return;
    if (d.priceJpy != null) update(id, { priceJpy: yenToInt(d.priceJpy) });
    setDraft((s) => { const { [id]: _, ...rest } = s; return rest; });
  };
  const removeRow = (id) => setPrices((cur) => cur.filter((p) => p.id !== id));
  const addRow = () => {
    if (!newRow.name) return;
    const id = `v-${Date.now().toString(36)}`;
    setPrices((cur) => [
      { ...newRow, id, priceJpy: yenToInt(newRow.priceJpy), visible: true, featured: false },
      ...cur,
    ]);
    setNewRow({ emoji: "🍅", name: "", priceJpy: "", unit: "/ 1パック" });
    setAdding(false);
  };

  if (prices === null) {
    return (
      <AdminPage title="価格管理" lead="読み込み中…">
        {status && <div className={`adm-status adm-status-${status.kind}`}>{status.msg}</div>}
      </AdminPage>
    );
  }

  return (
    <AdminPage title="価格管理"
      lead="編集してから「保存」で公開反映。「保存して LINE 配信」で本日の価格表を LINE 友だち全員に配信＋お知らせ履歴に記録します。"
      action={
        <div className="adm-page-action-row">
          {status && <span className={`adm-status adm-status-${status.kind} adm-status-pill`}>{status.msg}</span>}
          {isDirty && (
            <button className="adm-btn" onClick={discard} disabled={saving}>破棄</button>
          )}
          <button className="adm-btn" onClick={save}
            disabled={!isDirty || saving}
            title="価格をサーバに保存（LINE には送らない）">
            {saving ? "保存中…" : isDirty ? `保存 (${changeCount}件)` : "保存済み"}
          </button>
          <button className="adm-btn adm-btn-primary" onClick={saveAndBroadcast}
            disabled={saving}
            title="価格を保存して LINE 友だち全員に配信">
            {saving ? "配信中…" : isDirty ? `保存して LINE 配信 (${changeCount}件)` : "今の価格を LINE 配信"}
          </button>
          <button className="adm-btn" onClick={() => setAdding(true)} disabled={saving}>＋ 品目を追加</button>
        </div>
      }>
      <table className="adm-table">
        <thead>
          <tr><th></th><th></th><th>品目</th><th>単位</th><th>価格</th><th>表示</th><th>目玉</th><th></th></tr>
        </thead>
        <tbody>
          {prices.map((p, idx) => (
            <tr key={`${p.id}-${revision}`}>
              <td>
                <div className="adm-list-reorder">
                  <button className="adm-reorder-btn"
                    onClick={() => moveRow(p.id, -1)}
                    disabled={idx === 0}
                    title="上へ移動（保存ボタンで確定）"
                    aria-label="上へ移動">▲</button>
                  <button className="adm-reorder-btn"
                    onClick={() => moveRow(p.id, +1)}
                    disabled={idx === prices.length - 1}
                    title="下へ移動（保存ボタンで確定）"
                    aria-label="下へ移動">▼</button>
                </div>
              </td>
              <td>
                <input className="adm-input adm-input-sm adm-emoji-input"
                  defaultValue={p.emoji || ""}
                  placeholder={nameInitial(p.name)}
                  maxLength={4}
                  title="絵文字が無い場合は空欄のままでOK。頭文字バッジで自動表示されます。"
                  onBlur={(e) => { const v = e.target.value.trim(); if (v !== (p.emoji || "")) update(p.id, { emoji: v }); }}
                  onKeyDown={(e) => e.key === "Enter" && e.target.blur()} />
              </td>
              <td>
                <input className="adm-input adm-input-sm t-mincho" style={{ minWidth: 90 }}
                  defaultValue={p.name}
                  onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== p.name) update(p.id, { name: v }); }}
                  onKeyDown={(e) => e.key === "Enter" && e.target.blur()} />
              </td>
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
                  onClick={() => confirm(`${p.name} を削除しますか？（保存ボタンで確定）`) && removeRow(p.id)}>削除</button>
              </td>
            </tr>
          ))}
          {adding && (
            <tr className="adm-row-add">
              <td />
              <td><input className="adm-input adm-input-sm adm-emoji-input" maxLength={4}
                placeholder={nameInitial(newRow.name) || "🍅"}
                title="絵文字が無い場合は空欄のままでOK。頭文字バッジで自動表示されます。"
                value={newRow.emoji} onChange={(e) => setNewRow({ ...newRow, emoji: e.target.value })} /></td>
              <td><input className="adm-input adm-input-sm" placeholder="品名" value={newRow.name} onChange={(e) => setNewRow({ ...newRow, name: e.target.value })} /></td>
              <td><input className="adm-input adm-input-sm" placeholder="/ 単位" value={newRow.unit} onChange={(e) => setNewRow({ ...newRow, unit: e.target.value })} /></td>
              <td><input className="adm-input adm-input-sm" placeholder="280" value={newRow.priceJpy} onChange={(e) => setNewRow({ ...newRow, priceJpy: e.target.value })} /></td>
              <td colSpan={3}>
                <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={addRow}>追加</button>
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
  const { data: session } = useSession();
  const isOwner = session?.user?.role === "owner";
  const [posts, setPosts] = useState(null);
  const [busy, setBusy] = useState(null);
  const [status, setStatus] = useState(null);

  const load = async () => {
    try {
      const r = await fetch("/api/posts", { cache: "no-store" });
      const data = await r.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setStatus({ kind: "err", msg: `読み込み失敗: ${e.message}` });
    }
  };
  useEffect(() => { load(); }, []);

  const archive = async (id) => {
    if (!confirm("この投稿をアーカイブ（非公開化）しますか？")) return;
    setBusy(id);
    try {
      const r = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      if (!r.ok) throw new Error((await r.json()).error || `HTTP ${r.status}`);
      setPosts((cur) => cur.filter((p) => p.id !== id));
      setStatus({ kind: "ok", msg: "アーカイブしました" });
      setTimeout(() => setStatus((s) => (s?.kind === "ok" ? null : s)), 2000);
    } catch (e) {
      setStatus({ kind: "err", msg: `失敗: ${e.message}` });
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id) => {
    if (!confirm("この投稿を完全に削除しますか？")) return;
    setBusy(id);
    try {
      const r = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!r.ok && r.status !== 204) throw new Error(`HTTP ${r.status}`);
      setPosts((cur) => cur.filter((p) => p.id !== id));
      setStatus({ kind: "ok", msg: "削除しました" });
      setTimeout(() => setStatus((s) => (s?.kind === "ok" ? null : s)), 2000);
    } catch (e) {
      setStatus({ kind: "err", msg: `失敗: ${e.message}` });
    } finally {
      setBusy(null);
    }
  };

  if (posts === null) {
    return <AdminPage title="お知らせ管理" lead="読み込み中…" />;
  }

  return (
    <AdminPage title="お知らせ管理"
      lead="クイック投稿で配信した過去の投稿。アーカイブで公開非表示、削除で完全消去。"
      action={status && <span className={`adm-status adm-status-${status.kind} adm-status-pill`}>{status.msg}</span>}>
      <table className="adm-table">
        <thead>
          <tr><th>日付</th><th>配信先</th><th>タイトル</th><th></th></tr>
        </thead>
        <tbody>
          {posts.length === 0 && (
            <tr><td colSpan={4} style={{ padding: 24, color: "var(--c-text-sub)", textAlign: "center" }}>投稿はまだありません。</td></tr>
          )}
          {posts.map((n) => (
            <tr key={n.id}>
              <td className="t-en" style={{ fontSize: 12, color: "var(--c-text-sub)" }}>{n.date}</td>
              <td>
                {n.channels?.includes("web")  && <span className="pub-tag news">サイト</span>}{" "}
                {n.channels?.includes("line") && <span className="pub-tag line">LINE</span>}{" "}
                {n.channels?.includes("ig")   && <span className="pub-tag ig">IG</span>}
              </td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {n.imageUrl
                    ? <img src={n.imageUrl} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }} />
                    : <span style={{ fontSize: 18 }}>{n.emoji}</span>}
                  <div>
                    <div className="t-mincho" style={{ color: "var(--c-text)", fontSize: 14 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: "var(--c-text-sub)", marginTop: 3 }}>{n.body?.slice(0, 60)}{n.body?.length > 60 ? "…" : ""}</div>
                  </div>
                </div>
              </td>
              <td>
                <button className="adm-btn-link" onClick={() => archive(n.id)} disabled={busy === n.id}>アーカイブ</button>
                {isOwner && (
                  <button className="adm-btn-link adm-btn-danger" onClick={() => remove(n.id)} disabled={busy === n.id}>削除</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminPage>
  );
}

// ── Product Manager ─────────────────────────────────────────
/**
 * Staged product editor.
 *
 * Same submit-button model as PriceManager: GET /api/products on mount,
 * edits accumulate in the working copy, 保存 PUTs the full list. Edit
 * pane on the right reads/writes the working copy entry.
 */
function ProductManager() {
  const [serverProducts, setServerProducts] = useState(null);
  const [products, setProducts] = useState(null);
  const [editingId, setEditingId] = useState(null);  // "new", a product id, or null
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/products?all=1", { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!alive) return;
        setServerProducts(data);
        setProducts(data);
      } catch (e) {
        if (alive) setStatus({ kind: "err", msg: `読み込み失敗: ${e.message}` });
      }
    })();
    return () => { alive = false; };
  }, []);

  const isDirty = products !== null && serverProducts !== null
    && JSON.stringify(products) !== JSON.stringify(serverProducts);
  const changeCount = useMemo(() => {
    if (!isDirty) return 0;
    const baseById = Object.fromEntries(serverProducts.map((p) => [p.id, p]));
    const nextById = Object.fromEntries(products.map((p) => [p.id, p]));
    const ids = new Set([...Object.keys(baseById), ...Object.keys(nextById)]);
    let n = 0;
    for (const id of ids) {
      const a = baseById[id], b = nextById[id];
      if (!a || !b) { n++; continue; }
      if (JSON.stringify(a) !== JSON.stringify(b)) n++;
    }
    return n;
  }, [products, serverProducts, isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const save = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    setStatus({ kind: "info", msg: "保存中…" });
    try {
      const r = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(products),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.hint || j.error || `HTTP ${r.status}`);
      setServerProducts(products);
      setStatus({ kind: "ok", msg: `${changeCount}件の変更を保存しました` });
      setTimeout(() => setStatus((s) => (s?.kind === "ok" ? null : s)), 2500);
    } catch (e) {
      setStatus({ kind: "err", msg: `保存失敗: ${e.message}` });
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    if (!isDirty) return;
    if (!confirm(`未保存の変更 ${changeCount} 件を破棄しますか？`)) return;
    setProducts(serverProducts);
    setEditingId(null);
    setStatus(null);
  };

  // Pull products from Shopify into hp.products, then reload the list.
  // Server-side merge keeps local presentation fields (position /
  // visible / unit / category); unsaved local edits would be lost, so
  // we require a clean state first.
  const syncFromShopify = async () => {
    if (saving) return;
    if (isDirty) {
      setStatus({ kind: "err", msg: "未保存の変更があります。保存または破棄してから同期してください。" });
      return;
    }
    if (!confirm("Shopify の商品情報を取り込みます。商品名・価格・説明・画像が Shopify の内容で上書きされます（表示順・表示/非表示はそのまま）。よろしいですか？")) return;
    setSaving(true);
    setStatus({ kind: "info", msg: "Shopify と同期中…" });
    try {
      const r = await fetch("/api/shopify/sync", { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.hint || j.error || `HTTP ${r.status}`);
      // Reload the authoritative list.
      const r2 = await fetch("/api/products?all=1", { cache: "no-store" });
      const data = await r2.json();
      setServerProducts(data);
      setProducts(data);
      setEditingId(null);
      setStatus({ kind: "ok", msg: `同期完了: 更新${j.updated}件・新規${j.created}件・ローカル専用${j.localOnly}件` });
    } catch (e) {
      setStatus({ kind: "err", msg: `同期失敗: ${e.message}` });
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = (id) => {
    if (!confirm("削除しますか？（保存ボタンで確定）")) return;
    setProducts((cur) => cur.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  // Upload a product image to Supabase Storage and set image_url on
  // the working copy. UI feedback via the shared status pill.
  const uploadProductImage = async (id, file) => {
    if (!file) return;
    setStatus({ kind: "info", msg: "画像アップロード中…" });
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch("/api/products/upload", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.hint || j.error || `HTTP ${r.status}`);
      updateProduct(id, { imageUrl: j.url });
      setStatus({ kind: "ok", msg: "画像を貼りました（保存ボタンで確定）" });
      setTimeout(() => setStatus((s) => (s?.kind === "ok" ? null : s)), 2500);
    } catch (e) {
      setStatus({ kind: "err", msg: `画像アップロード失敗: ${e.message}` });
    }
  };

  // Swap product with neighbor. Order in the working array drives the
  // position field on save (setProducts assigns index → position).
  const moveProduct = (id, delta) =>
    setProducts((cur) => {
      const i = cur.findIndex((p) => p.id === id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= cur.length) return cur;
      const next = cur.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const startNew = () => {
    const id = `p-${Date.now().toString(36)}`;
    const newP = {
      id, handle: `new-${id}`, title: "新規商品", category: "看板",
      priceJpy: 0, unit: "", desc: "", imgTone: "green", visible: true,
    };
    setProducts((cur) => [newP, ...cur]);
    setEditingId(id);
  };

  const updateProduct = (id, patch) =>
    setProducts((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  if (products === null) {
    return <AdminPage title="商品管理" lead="読み込み中…" />;
  }

  const editing = editingId ? products.find((p) => p.id === editingId) : null;

  return (
    <AdminPage title="商品管理"
      lead="編集して「保存」で公開反映。「Shopify から同期」で商品名・価格・説明・画像をストアの内容に揃えます（表示順・表示/非表示はこちらの設定を維持）。"
      action={
        <div className="adm-page-action-row">
          {status && <span className={`adm-status adm-status-${status.kind} adm-status-pill`}>{status.msg}</span>}
          {isDirty && <button className="adm-btn" onClick={discard} disabled={saving}>破棄</button>}
          <button className="adm-btn adm-btn-primary" onClick={save} disabled={!isDirty || saving}>
            {saving ? "保存中…" : isDirty ? `保存 (${changeCount}件)` : "保存済み"}
          </button>
          <button className="adm-btn" onClick={syncFromShopify} disabled={saving}
            title="Shopify の商品情報を取り込みます">⇆ Shopify から同期</button>
          <button className="adm-btn" onClick={startNew} disabled={saving}>＋ 商品を追加</button>
        </div>
      }>
      <div className="adm-grid two">
        <section className="adm-card">
          <h3>商品一覧 ({products.length})</h3>
          <ul className="adm-list">
            {products.map((p, idx) => (
              <li key={p.id} className={`${editingId === p.id ? "is-active" : ""} ${!p.visible ? "is-hidden" : ""}`}>
                <div className="adm-list-reorder">
                  <button className="adm-reorder-btn"
                    onClick={(e) => { e.stopPropagation(); moveProduct(p.id, -1); }}
                    disabled={idx === 0}
                    title="上へ移動（保存ボタンで確定）"
                    aria-label="上へ移動">▲</button>
                  <button className="adm-reorder-btn"
                    onClick={(e) => { e.stopPropagation(); moveProduct(p.id, +1); }}
                    disabled={idx === products.length - 1}
                    title="下へ移動（保存ボタンで確定）"
                    aria-label="下へ移動">▼</button>
                </div>
                {p.imageUrl
                  ? <img className="adm-mini-img" src={p.imageUrl} alt="" />
                  : <div className={`adm-mini-img tone-${p.imgTone || "default"}`} />}
                <div className="info">
                  <div className="t-mincho">
                    {p.title} {!p.visible && <small style={{ color: "#b8423a" }}>(非表示)</small>}
                    {p.syncedAt && <span className="adm-sync-badge" title={`Shopify 同期済み (${p.syncedAt.slice(0, 10)})`}>Shopify</span>}
                  </div>
                  <div className="meta">{p.category}　{fmt(p.priceJpy)}{p.unit}</div>
                </div>
                <div className="adm-list-actions">
                  <button
                    className={`adm-toggle adm-toggle-sm ${p.visible ? "is-on" : ""}`}
                    onClick={(e) => { e.stopPropagation(); updateProduct(p.id, { visible: !p.visible }); }}
                    title={p.visible ? "クリックで非表示にする（保存ボタンで確定）" : "クリックで表示に戻す（保存ボタンで確定）"}>
                    <span /> {p.visible ? "表示中" : "非表示"}
                  </button>
                  <button className="adm-btn-link" onClick={() => setEditingId(p.id)}>編集</button>
                  <button className="adm-btn-link adm-btn-danger" onClick={() => removeProduct(p.id)}>削除</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="adm-card">
          <h3>{editing ? "商品を編集" : "商品を選択"}</h3>
          {!editing && <div className="adm-empty">左の一覧から商品を選択するか、「＋ 商品を追加」してください。</div>}
          {editing && (
            <div className="adm-form">
              <label className="adm-field"><span>商品名</span>
                <input className="adm-input" value={editing.title}
                  onChange={(e) => updateProduct(editing.id, { title: e.target.value })} />
              </label>
              <label className="adm-field"><span>URLスラグ (handle)</span>
                <input className="adm-input" value={editing.handle}
                  onChange={(e) => updateProduct(editing.id, { handle: e.target.value.replace(/\s+/g, "-") })} />
                <small style={{ color: "var(--c-text-sub)", marginTop: 4 }}>
                  Shopify の商品ハンドルと揃えると、カート・購入ボタンが正しく Shopify の該当商品ページに飛びます。
                </small>
              </label>
              <label className="adm-field">
                <span>商品画像</span>
                <div className="adm-image-picker">
                  {editing.imageUrl ? (
                    <div className="adm-image-preview">
                      <img src={editing.imageUrl} alt="プレビュー" />
                      <div className="adm-image-actions">
                        <input type="file" accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => uploadProductImage(editing.id, e.target.files?.[0])} />
                        <button type="button" className="adm-btn-link adm-btn-danger"
                          onClick={() => updateProduct(editing.id, { imageUrl: "" })}>画像を外す</button>
                      </div>
                    </div>
                  ) : (
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="adm-input"
                      onChange={(e) => uploadProductImage(editing.id, e.target.files?.[0])} />
                  )}
                  <small style={{ color: "var(--c-text-sub)" }}>
                    JPEG / PNG / WebP、最大 8MB。Supabase Storage の product-images バケットに保存されます。
                  </small>
                </div>
              </label>
              <div className="adm-row">
                <label className="adm-field"><span>カテゴリ</span>
                  <input className="adm-input" value={editing.category}
                    onChange={(e) => updateProduct(editing.id, { category: e.target.value })} />
                </label>
                <label className="adm-field"><span>画像トーン</span>
                  <select className="adm-input" value={editing.imgTone || ""}
                    onChange={(e) => updateProduct(editing.id, { imgTone: e.target.value })}>
                    <option value="">標準</option>
                    <option value="green">グリーン</option>
                    <option value="orange">オレンジ</option>
                  </select>
                </label>
              </div>
              <div className="adm-row">
                <label className="adm-field"><span>価格</span>
                  <div className="adm-price-input"><span>¥</span>
                    <input className="adm-input" value={editing.priceJpy}
                      onChange={(e) => updateProduct(editing.id, { priceJpy: yenToInt(e.target.value) })} />
                  </div>
                </label>
                <label className="adm-field"><span>単位</span>
                  <input className="adm-input" value={editing.unit}
                    onChange={(e) => updateProduct(editing.id, { unit: e.target.value })} placeholder="/ セット" />
                </label>
              </div>
              <label className="adm-field"><span>説明</span>
                <textarea className="adm-input" rows={3} value={editing.desc}
                  onChange={(e) => updateProduct(editing.id, { desc: e.target.value })} />
              </label>
              <label className="adm-field" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <button type="button"
                  className={`adm-toggle ${editing.visible ? "is-on" : ""}`}
                  onClick={() => updateProduct(editing.id, { visible: !editing.visible })}>
                  <span /> {editing.visible ? "表示中" : "非表示"}
                </button>
                <small style={{ color: "var(--c-text-sub)" }}>非表示にすると公開 /products から外れます</small>
              </label>
              <div className="adm-actions">
                <button className="adm-btn-link" onClick={() => setEditingId(null)}>閉じる</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminPage>
  );
}

// ── Order Manager (贈答注文 → Shopify 下書き注文) ────────────
/**
 * 看板商品を 1 つ選び、送り主情報 + 複数の送り先住所を入力すると、
 * 送り先ごとに Shopify の下書き注文を 1 件ずつ作成する。
 *
 * 決済・在庫引当はしない。作成されるのはあくまで「下書き」で、以降は
 * Shopify 管理画面でスタッフが内容確認・請求書送付・会計処理を行う
 * 想定。billing_address に送り主、shipping_address に送り先を入れる
 * ことで、贈答特有の「注文者と届け先が別人」という形を表現している。
 */
const emptyRecipient = () => ({
  id: `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  name: "", zip: "", pref: "", city: "", address1: "", address2: "", phone: "",
  quantity: 1, note: "",
});

// 大きめのタップ領域 (−/＋ボタン + 中央の数値) の数量ステッパー。
// タブレットでテンキーを出さずに増減でき、直接タップ入力もできる。
const QuantityStepper = ({ value, onChange, disabled }) => (
  <div className="adm-qty-stepper">
    <button type="button" className="adm-qty-btn" disabled={disabled || value <= 1}
      onClick={() => onChange(Math.max(1, value - 1))} aria-label="数量を減らす">−</button>
    <input className="adm-qty-input" type="text" inputMode="numeric" value={value}
      disabled={disabled}
      onChange={(e) => {
        const n = parseInt(e.target.value.replace(/[^\d]/g, ""), 10);
        onChange(Number.isFinite(n) && n > 0 ? n : 1);
      }} />
    <button type="button" className="adm-qty-btn" disabled={disabled}
      onClick={() => onChange(value + 1)} aria-label="数量を増やす">＋</button>
  </div>
);

function OrderManager() {
  const [products, setProducts] = useState(null);
  const [handle, setHandle] = useState("");
  const [sender, setSender] = useState({
    name: "", phone: "", email: "",
    zip: "", pref: "", city: "", address1: "", address2: "",
  });
  const [recipients, setRecipients] = useState([emptyRecipient()]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/products?all=1", { cache: "no-store" });
        const data = await r.json();
        if (!alive) return;
        const signature = (Array.isArray(data) ? data : []).filter((p) => p.category === "看板");
        setProducts(signature);
        if (signature.length > 0) setHandle(signature[0].handle);
      } catch (e) {
        if (alive) setStatus({ kind: "err", msg: `商品の読み込みに失敗: ${e.message}` });
      }
    })();
    loadHistory();
    return () => { alive = false; };
  }, []);

  const loadHistory = async () => {
    try {
      const r = await fetch("/api/shopify/draft-orders", { cache: "no-store" });
      if (!r.ok) return;
      setHistory(await r.json());
    } catch { /* history is best-effort */ }
  };

  const product = products?.find((p) => p.handle === handle) || null;

  // patch は { ...fields } の他、(prevRecipient) => ({ ...fields }) の
  // 関数形式も受け付ける。郵便番号検索は非同期で結果が返るため、
  // その時点の最新値 (ユーザーが検索中にさらに手入力した内容) を
  // 元に合成しないと入力内容を上書きしてしまう。
  const updateRecipient = (id, patch) =>
    setRecipients((cur) => cur.map((r) =>
      r.id === id ? { ...r, ...(typeof patch === "function" ? patch(r) : patch) } : r));
  const addRecipient = () => setRecipients((cur) => [...cur, emptyRecipient()]);
  const removeRecipient = (id) =>
    setRecipients((cur) => (cur.length > 1 ? cur.filter((r) => r.id !== id) : cur));

  const resetForm = () => {
    setSender({ name: "", phone: "", email: "", zip: "", pref: "", city: "", address1: "", address2: "" });
    setRecipients([emptyRecipient()]);
    setResults(null);
    setStatus(null);
    setZipStatus({});
  };

  // 郵便番号が7桁揃ったタイミングで住所検索し、都道府県・市区町村を
  // 自動入力。町域名は「町名・番地」欄に、既存の入力が無いときだけ
  // 補完する (すでに番地まで入力済みなら上書きしない)。
  const [zipStatus, setZipStatus] = useState({}); // key -> loading|found|notfound
  const autofillFromZip = (key, rawZip, apply) => {
    const digits = String(rawZip || "").replace(/[^\d]/g, "");
    if (digits.length !== 7) {
      setZipStatus((s) => { if (!(key in s)) return s; const n = { ...s }; delete n[key]; return n; });
      return;
    }
    setZipStatus((s) => ({ ...s, [key]: "loading" }));
    lookupZip(digits).then((addr) => {
      setZipStatus((s) => ({ ...s, [key]: addr ? "found" : "notfound" }));
      if (addr) apply(addr);
    });
  };
  const ZipHint = ({ zipKey }) => {
    const st = zipStatus[zipKey];
    if (!st) return null;
    if (st === "loading") return <small className="adm-zip-hint">検索中…</small>;
    if (st === "found") return <small className="adm-zip-hint is-ok">住所を自動入力しました</small>;
    return <small className="adm-zip-hint is-warn">該当する住所が見つかりませんでした</small>;
  };

  const submit = async () => {
    if (submitting) return;
    if (!product) { setStatus({ kind: "err", msg: "商品を選択してください" }); return; }
    if (!sender.name.trim()) { setStatus({ kind: "err", msg: "送り主のお名前を入力してください" }); return; }
    const validRecipients = recipients.filter((r) => r.name.trim());
    if (validRecipients.length === 0) { setStatus({ kind: "err", msg: "送り先を1件以上入力してください" }); return; }
    if (!confirm(`${product.title} の下書き注文を ${validRecipients.length}件 Shopify に作成します。よろしいですか？`)) return;

    setSubmitting(true);
    setStatus({ kind: "info", msg: `送信中… (0/${validRecipients.length})` });
    setResults(null);
    try {
      const r = await fetch("/api/shopify/draft-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: { handle: product.handle, title: product.title, priceJpy: product.priceJpy, variantId: product.variantId },
          sender,
          recipients: validRecipients,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.hint || j.error || `HTTP ${r.status}`);
      setResults(j);
      setStatus({
        kind: j.failed === 0 ? "ok" : "err",
        msg: `完了: 成功 ${j.succeeded}件 / 失敗 ${j.failed}件`,
      });
      loadHistory();
    } catch (e) {
      setStatus({ kind: "err", msg: `送信失敗: ${e.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  if (products === null) {
    return <AdminPage title="贈答注文作成" lead="読み込み中…" />;
  }

  if (products.length === 0) {
    return (
      <AdminPage title="贈答注文作成" lead="看板商品が見つかりません。">
        <div className="adm-empty">商品管理でカテゴリ「看板」の商品を登録してから利用してください。</div>
      </AdminPage>
    );
  }

  return (
    <AdminPage title="贈答注文作成"
      lead="看板商品を選び、送り主・送り先を入力すると Shopify に下書き注文を作成します。決済・発送はされません。内容確認後、Shopify 管理画面から請求書送付等を行ってください。"
      action={status && <span className={`adm-status adm-status-${status.kind} adm-status-pill`}>{status.msg}</span>}>
      <div className="adm-grid two adm-order-form">
        <section className="adm-card">
          <h3>① 商品を選ぶ</h3>
          <label className="adm-field">
            <span>看板商品</span>
            <select className="adm-input" value={handle} onChange={(e) => setHandle(e.target.value)}>
              {products.map((p) => (
                <option key={p.handle} value={p.handle}>{p.title} — {fmt(p.priceJpy)}{p.unit}</option>
              ))}
            </select>
          </label>
          {product && (
            <div className="adm-order-preview">
              {product.imageUrl
                ? <img src={product.imageUrl} alt="" />
                : <div className={`adm-mini-img tone-${product.imgTone || "default"}`} />}
              <div>
                <div className="t-mincho">{product.title}</div>
                <div className="meta">{fmt(product.priceJpy)}{product.unit}</div>
                {!product.variantId && (
                  <small className="adm-order-warn">※ Shopify 未連携商品 — カスタム明細として下書き注文に計上されます</small>
                )}
              </div>
            </div>
          )}

          <h3 style={{ marginTop: 20 }}>② 送り主情報</h3>
          <label className="adm-field"><span>お名前 *</span>
            <input className="adm-input" value={sender.name} autoComplete="name"
              onChange={(e) => setSender({ ...sender, name: e.target.value })} placeholder="山田 太郎" />
          </label>
          <div className="adm-row">
            <label className="adm-field"><span>電話番号</span>
              <input className="adm-input" type="tel" inputMode="tel" autoComplete="tel" value={sender.phone}
                onChange={(e) => setSender({ ...sender, phone: e.target.value })} placeholder="0827-XX-XXXX" />
            </label>
            <label className="adm-field"><span>メールアドレス</span>
              <input className="adm-input" type="email" inputMode="email" autoComplete="email" value={sender.email}
                onChange={(e) => setSender({ ...sender, email: e.target.value })} placeholder="任意（請求書送付用）" />
            </label>
          </div>
          <div className="adm-row">
            <label className="adm-field"><span>郵便番号</span>
              <input className="adm-input" inputMode="numeric" autoComplete="postal-code" value={sender.zip}
                onChange={(e) => {
                  const v = e.target.value;
                  setSender((s) => ({ ...s, zip: v }));
                  autofillFromZip("sender", v, (addr) => setSender((s) => ({
                    ...s, pref: addr.pref, city: addr.city,
                    address1: s.address1 || addr.town,
                  })));
                }} placeholder="740-0000" />
              <ZipHint zipKey="sender" />
            </label>
            <label className="adm-field"><span>都道府県</span>
              <input className="adm-input" autoComplete="address-level1" value={sender.pref}
                onChange={(e) => setSender({ ...sender, pref: e.target.value })} placeholder="山口県" />
            </label>
          </div>
          <div className="adm-row">
            <label className="adm-field"><span>市区町村</span>
              <input className="adm-input" autoComplete="address-level2" value={sender.city}
                onChange={(e) => setSender({ ...sender, city: e.target.value })} placeholder="岩国市" />
            </label>
            <label className="adm-field"><span>町名・番地</span>
              <input className="adm-input" autoComplete="address-line1" value={sender.address1}
                onChange={(e) => setSender({ ...sender, address1: e.target.value })} placeholder="尾津町5-11-1" />
            </label>
          </div>
          <label className="adm-field"><span>建物名・部屋番号</span>
            <input className="adm-input" autoComplete="address-line2" value={sender.address2}
              onChange={(e) => setSender({ ...sender, address2: e.target.value })} placeholder="任意" />
          </label>
        </section>

        <section className="adm-card">
          <h3>③ 送り先（複数可）</h3>
          <div className="adm-recipient-list">
            {recipients.map((r, idx) => (
              <div key={r.id} className="adm-recipient">
                <div className="adm-recipient-head">
                  <b>送り先 {idx + 1}</b>
                  {recipients.length > 1 && (
                    <button type="button" className="adm-btn-link adm-btn-danger" onClick={() => removeRecipient(r.id)}>削除</button>
                  )}
                </div>
                <label className="adm-field"><span>お名前 *</span>
                  <input className="adm-input" value={r.name}
                    onChange={(e) => updateRecipient(r.id, { name: e.target.value })} placeholder="鈴木 花子" />
                </label>
                <div className="adm-row">
                  <label className="adm-field"><span>郵便番号</span>
                    <input className="adm-input" inputMode="numeric" value={r.zip}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateRecipient(r.id, { zip: v });
                        autofillFromZip(r.id, v, (addr) => updateRecipient(r.id, (prev) => ({
                          pref: addr.pref, city: addr.city,
                          address1: prev.address1 || addr.town,
                        })));
                      }} placeholder="740-0000" />
                    <ZipHint zipKey={r.id} />
                  </label>
                  <label className="adm-field"><span>都道府県</span>
                    <input className="adm-input" value={r.pref}
                      onChange={(e) => updateRecipient(r.id, { pref: e.target.value })} placeholder="山口県" />
                  </label>
                </div>
                <div className="adm-row">
                  <label className="adm-field"><span>市区町村</span>
                    <input className="adm-input" value={r.city}
                      onChange={(e) => updateRecipient(r.id, { city: e.target.value })} placeholder="岩国市" />
                  </label>
                  <label className="adm-field"><span>町名・番地</span>
                    <input className="adm-input" value={r.address1}
                      onChange={(e) => updateRecipient(r.id, { address1: e.target.value })} placeholder="尾津町5-11-1" />
                  </label>
                </div>
                <label className="adm-field"><span>建物名・部屋番号</span>
                  <input className="adm-input" value={r.address2}
                    onChange={(e) => updateRecipient(r.id, { address2: e.target.value })} placeholder="任意" />
                </label>
                <div className="adm-row">
                  <label className="adm-field"><span>電話番号</span>
                    <input className="adm-input" type="tel" inputMode="tel" value={r.phone}
                      onChange={(e) => updateRecipient(r.id, { phone: e.target.value })} placeholder="配送連絡用" />
                  </label>
                  <label className="adm-field"><span>数量</span>
                    <QuantityStepper value={r.quantity}
                      onChange={(n) => updateRecipient(r.id, { quantity: n })} />
                  </label>
                </div>
                <label className="adm-field"><span>備考（のし・メッセージ等）</span>
                  <input className="adm-input" value={r.note}
                    onChange={(e) => updateRecipient(r.id, { note: e.target.value })} placeholder="御中元／御歳暮／お祝い等" />
                </label>
              </div>
            ))}
          </div>
          <button type="button" className="adm-btn adm-btn-add-recipient" onClick={addRecipient} disabled={submitting}>＋ 送り先を追加</button>

          <div className="adm-actions" style={{ marginTop: 18 }}>
            <button className="adm-btn-link" onClick={resetForm} disabled={submitting}>フォームをクリア</button>
            <button className="adm-btn adm-btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? "送信中…" : `Shopify に下書き注文を作成 (${recipients.filter((r) => r.name.trim()).length}件)`}
            </button>
          </div>

          {results && (
            <ul className="adm-fanout" style={{ marginTop: 16 }}>
              {results.results.map((r) => (
                <li key={r.index} className={r.ok ? "ok" : "err"}>
                  <b>{r.recipientName || `送り先${r.index + 1}`}</b>
                  {r.ok
                    ? <> — 下書き注文 {r.draftOrderName} を作成しました　<a href={r.draftOrderUrl} target="_blank" rel="noopener noreferrer">Shopifyで開く ↗</a></>
                    : <> — 失敗: {r.error}</>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {history && history.length > 0 && (
        <section className="adm-card" style={{ marginTop: 22 }}>
          <h3>直近の送信履歴</h3>
          <table className="adm-table">
            <thead>
              <tr><th>日時</th><th>商品</th><th>送り先</th><th>状態</th><th></th></tr>
            </thead>
            <tbody>
              {history.slice(0, 20).map((h) => (
                <tr key={h.id}>
                  <td className="t-en" style={{ fontSize: 12, color: "var(--c-text-sub)" }}>
                    {new Date(h.createdAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ fontSize: 13 }}>{h.productTitle}</td>
                  <td style={{ fontSize: 13 }}>{h.recipientName}</td>
                  <td>
                    {h.status === "success"
                      ? <span className="pub-tag news" style={{ background: "rgba(6,164,72,0.12)", color: "var(--c-line)" }}>成功</span>
                      : <span className="pub-tag news" style={{ background: "rgba(184,66,58,0.1)", color: "#b8423a" }}>失敗</span>}
                  </td>
                  <td>
                    {h.shopifyDraftOrderUrl && <a href={h.shopifyDraftOrderUrl} target="_blank" rel="noopener noreferrer">Shopify ↗</a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
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
      case "orders":   return <OrderManager />;
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
