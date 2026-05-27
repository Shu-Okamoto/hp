/* global React */

// ── 2. Architecture diagram ─────────────────────────────────
const Arch = () => (
  <div style={{
    width: 1180, padding: 40, background: "var(--paper)",
    border: "2.5px solid var(--ink)", borderRadius: 8,
    fontFamily: '"Kosugi Maru", sans-serif',
    boxShadow: "8px 8px 0 rgba(26,26,26,0.08)",
  }}>
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: "Caveat", letterSpacing: "0.18em", fontSize: 12, color: "var(--pen)" }}>SYSTEM ARCHITECTURE</div>
      <h2 style={{ fontFamily: "Caveat", fontSize: 28, fontWeight: 700, margin: "4px 0 0" }}>システム全体アーキテクチャ</h2>
    </div>

    {/* Diagram */}
    <div style={{
      border: "1.5px solid var(--ink)", borderRadius: 8, padding: 30,
      background: "rgba(26,26,26,0.02)", marginBottom: 24
    }}>
      {/* Layer 1: Users */}
      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 30 }}>
        {[
          { ico: "👤", title: "一般ユーザー", sub: "スマホ / PC ブラウザ" },
          { ico: "👨‍💼", title: "店舗スタッフ", sub: "管理画面" },
          { ico: "🚜", title: "農家・組合", sub: "アグリパートナーズ" },
        ].map((u, i) => (
          <div key={i} style={{
            border: "2px solid var(--ink)", borderRadius: 8, padding: "10px 18px",
            background: "var(--paper)", textAlign: "center", minWidth: 180
          }}>
            <div style={{ fontSize: 26 }}>{u.ico}</div>
            <div style={{ fontFamily: "Caveat", fontSize: 16, fontWeight: 700 }}>{u.title}</div>
            <div style={{ fontSize: 10, color: "var(--ink-3)" }}>{u.sub}</div>
          </div>
        ))}
      </div>

      {/* Arrows down */}
      <div style={{ display: "flex", justifyContent: "space-around", margin: "0 0 8px" }}>
        {[1,2,3].map(i => <div key={i} style={{ fontFamily: "Caveat", fontSize: 18, color: "var(--ink-2)" }}>↓</div>)}
      </div>

      {/* Layer 2: Frontend (Next.js + Vercel) */}
      <div style={{
        border: "2px solid var(--green-mid, #3d7a52)",
        background: "rgba(61,122,82,0.06)",
        borderRadius: 8, padding: 16, marginBottom: 16
      }}>
        <div style={{ fontFamily: "Caveat", fontSize: 14, color: "var(--ink-3)", marginBottom: 8 }}>
          FRONTEND · Next.js (App Router) on Vercel
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ border: "1.5px solid var(--ink)", padding: 10, borderRadius: 4, background: "var(--paper)" }}>
            <div style={{ fontWeight: 700, fontSize: 12 }}>📱 公開サイト</div>
            <div style={{ fontSize: 10, color: "var(--ink-2)", marginTop: 4 }}>
              トップ／商品／価格／お知らせ／店舗／予約／取り組み
            </div>
          </div>
          <div style={{ border: "1.5px solid var(--ink)", padding: 10, borderRadius: 4, background: "var(--paper)" }}>
            <div style={{ fontWeight: 700, fontSize: 12 }}>🔐 管理画面（要認証）</div>
            <div style={{ fontSize: 10, color: "var(--ink-2)", marginTop: 4 }}>
              クイック投稿／価格管理／お知らせ／SNS連携状況
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", margin: "0 0 8px" }}>
        <div style={{ fontFamily: "Caveat", fontSize: 18, color: "var(--ink-2)" }}>↕ API Routes / Server Actions</div>
      </div>

      {/* Layer 3: Backend (Supabase) */}
      <div style={{
        border: "2px solid var(--ink)",
        borderRadius: 8, padding: 16, marginBottom: 16,
        background: "var(--paper)"
      }}>
        <div style={{ fontFamily: "Caveat", fontSize: 14, color: "var(--ink-3)", marginBottom: 8 }}>
          BACKEND · Supabase
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            ["🗄️ Postgres DB", "posts / prices / shops / categories / channels"],
            ["🔑 Auth", "管理画面のログイン（メール+パス・もしくは Magic Link）"],
            ["📁 Storage", "投稿画像・商品写真・店舗写真"],
          ].map(([t, s]) => (
            <div key={t} style={{ border: "1.5px solid var(--ink)", padding: 10, borderRadius: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{t}</div>
              <div style={{ fontSize: 10, color: "var(--ink-2)", marginTop: 4 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", margin: "0 0 8px" }}>
        <div style={{ fontFamily: "Caveat", fontSize: 18, color: "var(--ink-2)" }}>↕ External APIs</div>
      </div>

      {/* Layer 4: External services */}
      <div style={{
        border: "2px dashed var(--pen)", borderRadius: 8, padding: 16,
        background: "rgba(200,69,31,0.04)"
      }}>
        <div style={{ fontFamily: "Caveat", fontSize: 14, color: "var(--pen)", marginBottom: 8 }}>
          EXTERNAL SERVICES
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
          {[
            ["📷 Instagram", "Basic Display API", "ストーリー・投稿取得＋投稿"],
            ["💬 LINE", "Messaging API", "公式アカウントへ一斉配信"],
            ["🛒 Shopify", "Storefront API", "商品データ取得"],
            ["🗺️ Google Maps", "Embed API", "店舗マップ"],
          ].map(([n, api, desc]) => (
            <div key={n} style={{ border: "1.5px solid var(--ink)", padding: 10, borderRadius: 4, background: "var(--paper)" }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{n}</div>
              <div style={{ fontSize: 10, color: "var(--pen)", marginTop: 2 }}>{api}</div>
              <div style={{ fontSize: 10, color: "var(--ink-2)", marginTop: 2 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Hosting note */}
    <div style={{
      padding: 14, border: "1.5px dashed var(--ink-3)", borderRadius: 6,
      fontSize: 12, lineHeight: 1.7
    }}>
      <strong style={{ fontFamily: "Caveat", fontSize: 14, display: "block", marginBottom: 4 }}>
        ホスティング・運用
      </strong>
      Vercel（Next.js本体・自動デプロイ）／ Supabase（DB・認証・画像Storage）／
      旧 satonoaji-mikawa.net は301リダイレクト → satonoaji-mikawa.com
    </div>
  </div>
);

// ── Data Model ─────────────────────────────────────────────
const DataModel = () => {
  const tables = [
    {
      name: "posts", desc: "お知らせ・投稿",
      cols: [
        ["id", "uuid PK"],
        ["title", "text"],
        ["body", "text"],
        ["category", "enum(news/event/agri/sale)"],
        ["image_urls", "text[]"],
        ["status", "enum(draft/published/scheduled)"],
        ["published_at", "timestamptz"],
        ["channels", "jsonb { site, line, ig }"],
        ["ig_post_id", "text · 配信成功時"],
        ["line_message_id", "text · 配信成功時"],
        ["created_by", "uuid FK → users"],
        ["created_at / updated_at", "timestamptz"],
      ]
    },
    {
      name: "prices", desc: "今日の販売価格",
      cols: [
        ["id", "uuid PK"],
        ["vegetable_name", "text"],
        ["emoji_or_image", "text"],
        ["price", "int"],
        ["unit", "text · /個 /本 /束 等"],
        ["sort_order", "int · 並び順"],
        ["is_visible", "bool · 表示ON/OFF"],
        ["ig_synced_at", "timestamptz"],
        ["updated_at", "timestamptz"],
      ]
    },
    {
      name: "shops", desc: "店舗",
      cols: [
        ["id", "uuid PK"],
        ["name", "text"],
        ["address", "text"],
        ["lat / lng", "float"],
        ["phone", "text"],
        ["hours", "jsonb"],
        ["is_open_today", "bool"],
        ["photo_url", "text"],
      ]
    },
    {
      name: "delivery_logs", desc: "SNS配信ログ",
      cols: [
        ["id", "uuid PK"],
        ["post_id", "uuid FK → posts"],
        ["channel", "enum(line/ig)"],
        ["status", "enum(success/failed)"],
        ["external_id", "text"],
        ["error_message", "text"],
        ["sent_at", "timestamptz"],
      ]
    },
    {
      name: "admin_users", desc: "管理ユーザー（Supabase Auth連携）",
      cols: [
        ["id", "uuid PK"],
        ["email", "text"],
        ["role", "enum(owner/staff)"],
        ["last_login_at", "timestamptz"],
      ]
    },
    {
      name: "sns_credentials", desc: "API認証情報（暗号化保存）",
      cols: [
        ["id", "uuid PK"],
        ["service", "enum(instagram/line)"],
        ["access_token", "text · encrypted"],
        ["refresh_token", "text · encrypted"],
        ["expires_at", "timestamptz"],
      ]
    },
  ];

  return (
    <div style={{
      width: 1180, padding: 40, background: "var(--paper)",
      border: "2.5px solid var(--ink)", borderRadius: 8,
      fontFamily: '"Kosugi Maru", sans-serif',
      boxShadow: "8px 8px 0 rgba(26,26,26,0.08)",
    }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "Caveat", letterSpacing: "0.18em", fontSize: 12, color: "var(--pen)" }}>DATA MODEL</div>
        <h2 style={{ fontFamily: "Caveat", fontSize: 28, fontWeight: 700, margin: "4px 0 0" }}>テーブル設計案</h2>
        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>Supabase (PostgreSQL) — 主要6テーブル</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {tables.map((t) => (
          <div key={t.name} style={{ border: "1.5px solid var(--ink)", borderRadius: 6, overflow: "hidden" }}>
            <div style={{
              background: "var(--ink)", color: "var(--paper)",
              padding: "8px 12px", display: "flex", justifyContent: "space-between"
            }}>
              <span style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 16 }}>{t.name}</span>
              <span style={{ fontSize: 11, opacity: 0.8 }}>{t.desc}</span>
            </div>
            {t.cols.map((c, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "150px 1fr",
                padding: "6px 12px", fontSize: 11,
                borderBottom: i < t.cols.length - 1 ? "1px dashed var(--ink-3)" : "none"
              }}>
                <div style={{ fontFamily: "Caveat", fontWeight: 700 }}>{c[0]}</div>
                <div style={{ color: "var(--ink-2)" }}>{c[1]}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── API spec / integration flows ────────────────────────────
const ApiSpec = () => (
  <div style={{
    width: 1180, padding: 40, background: "var(--paper)",
    border: "2.5px solid var(--ink)", borderRadius: 8,
    fontFamily: '"Kosugi Maru", sans-serif',
    boxShadow: "8px 8px 0 rgba(26,26,26,0.08)",
  }}>
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: "Caveat", letterSpacing: "0.18em", fontSize: 12, color: "var(--pen)" }}>API & INTEGRATIONS</div>
      <h2 style={{ fontFamily: "Caveat", fontSize: 28, fontWeight: 700, margin: "4px 0 0" }}>API仕様 ／ 外部連携フロー</h2>
    </div>

    {/* Quick post flow */}
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontFamily: "Caveat", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
        ① クイック投稿 → 同時配信フロー
      </h3>
      <div style={{ display: "flex", alignItems: "stretch", gap: 8, fontSize: 11 }}>
        {[
          ["管理画面", "送信ボタン押下"],
          ["POST /api/posts", "Next.js Server Action"],
          ["DB保存", "posts テーブル"],
          ["並列実行", "Channels に応じて分岐"],
          ["Instagram API", "Graph API /media → /publish"],
          ["LINE API", "/v2/bot/message/broadcast"],
          ["delivery_logs", "結果を記録"],
        ].map((step, i, arr) => (
          <React.Fragment key={i}>
            <div style={{
              flex: 1, border: "1.5px solid var(--ink)", borderRadius: 4,
              padding: 8, background: "var(--paper)"
            }}>
              <div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 12 }}>{step[0]}</div>
              <div style={{ color: "var(--ink-2)", marginTop: 2, fontSize: 10 }}>{step[1]}</div>
            </div>
            {i < arr.length - 1 && (
              <div style={{ display: "flex", alignItems: "center", color: "var(--ink-3)" }}>→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>

    {/* Endpoints */}
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontFamily: "Caveat", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
        ② 内部API（Next.js API Routes / Server Actions）
      </h3>
      <div style={{ border: "1.5px solid var(--ink)", borderRadius: 6, overflow: "hidden", fontSize: 11 }}>
        {[
          ["GET", "/api/posts", "公開済みお知らせ一覧（フィルタ・ページング）", "公開"],
          ["POST", "/api/posts", "新規投稿＋同時配信", "要認証"],
          ["PATCH", "/api/posts/:id", "編集", "要認証"],
          ["DELETE", "/api/posts/:id", "削除", "要認証"],
          ["GET", "/api/prices", "本日の価格一覧（is_visible=true）", "公開"],
          ["PATCH", "/api/prices/:id", "価格更新／表示ON-OFF", "要認証"],
          ["POST", "/api/prices/sync-ig", "Instagramストーリーへ同期", "要認証"],
          ["GET", "/api/shops", "店舗一覧", "公開"],
          ["GET", "/api/sns/status", "IG・LINE 接続状態", "要認証"],
          ["POST", "/api/sns/reauth", "API再認証", "要認証"],
        ].map((row, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "70px 280px 1fr 80px",
            padding: "8px 12px",
            borderBottom: i < 9 ? "1px dashed var(--ink-3)" : "none",
            background: i === 0 ? "rgba(26,26,26,0.05)" : "transparent",
            alignItems: "center"
          }}>
            <span style={{
              fontWeight: 700, fontFamily: "Caveat", fontSize: 13,
              color: row[0] === "GET" ? "var(--ink)" : row[0] === "POST" ? "var(--pen)" : row[0] === "PATCH" ? "var(--green-mid, #3d7a52)" : "var(--ink-3)"
            }}>{row[0]}</span>
            <code style={{ fontFamily: "ui-monospace, monospace", fontSize: 11 }}>{row[1]}</code>
            <span>{row[2]}</span>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 10,
              background: row[3] === "要認証" ? "var(--ink)" : "transparent",
              color: row[3] === "要認証" ? "var(--paper)" : "var(--ink-3)",
              border: row[3] === "公開" ? "1px dashed var(--ink-3)" : "none",
              textAlign: "center"
            }}>{row[3]}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Env vars */}
    <div>
      <h3 style={{ fontFamily: "Caveat", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
        ③ 環境変数（Vercelで設定）
      </h3>
      <div style={{
        background: "rgba(26,26,26,0.04)", border: "1.5px solid var(--ink)",
        borderRadius: 6, padding: 14, fontFamily: "ui-monospace, monospace",
        fontSize: 11, lineHeight: 1.9, color: "var(--ink)"
      }}>
        SUPABASE_URL=...<br/>
        SUPABASE_ANON_KEY=...<br/>
        SUPABASE_SERVICE_ROLE_KEY=...&nbsp;&nbsp;&nbsp;<span style={{ color: "var(--pen)" }}># server-only</span><br/>
        INSTAGRAM_APP_ID=...<br/>
        INSTAGRAM_APP_SECRET=...<br/>
        INSTAGRAM_ACCESS_TOKEN=...&nbsp;&nbsp;&nbsp;<span style={{ color: "var(--pen)" }}># 60日refresh必要</span><br/>
        LINE_CHANNEL_ACCESS_TOKEN=...<br/>
        LINE_CHANNEL_SECRET=...<br/>
        SHOPIFY_STOREFRONT_TOKEN=...<br/>
        GOOGLE_MAPS_API_KEY=...<br/>
      </div>
    </div>
  </div>
);

// ── 3. Handoff doc for Claude Code ─────────────────────────
const Handoff = () => (
  <div style={{
    width: 1180, padding: 40, background: "var(--paper)",
    border: "2.5px solid var(--ink)", borderRadius: 8,
    fontFamily: '"Kosugi Maru", sans-serif',
    boxShadow: "8px 8px 0 rgba(26,26,26,0.08)",
    lineHeight: 1.7
  }}>
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: "Caveat", letterSpacing: "0.18em", fontSize: 12, color: "var(--pen)" }}>HANDOFF · CLAUDE CODE</div>
      <h2 style={{ fontFamily: "Caveat", fontSize: 28, fontWeight: 700, margin: "4px 0 0" }}>開発ハンドオフ資料</h2>
      <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>このプロジェクトを Claude Code に渡してフルスタック実装する際の指示書</div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, fontSize: 12 }}>
      <div>
        <h4 style={{ fontFamily: "Caveat", fontSize: 16, marginBottom: 6, color: "var(--pen)" }}>
          ▶ プロジェクト初期化（推奨コマンド）
        </h4>
        <div style={{
          background: "rgba(26,26,26,0.04)", border: "1.5px solid var(--ink)",
          borderRadius: 4, padding: 12, fontFamily: "ui-monospace, monospace",
          fontSize: 10, lineHeight: 1.8
        }}>
          npx create-next-app@latest satonoaji-mikawa --ts --tailwind --app<br/>
          cd satonoaji-mikawa<br/>
          npm i @supabase/supabase-js @supabase/ssr<br/>
          npm i zod react-hook-form<br/>
          npm i @upstash/qstash&nbsp;&nbsp;<span style={{ color: "var(--ink-3)" }}># 予約投稿用</span>
        </div>

        <h4 style={{ fontFamily: "Caveat", fontSize: 16, marginTop: 18, marginBottom: 6, color: "var(--pen)" }}>
          ▶ ディレクトリ構成
        </h4>
        <div style={{
          background: "rgba(26,26,26,0.04)", border: "1.5px solid var(--ink)",
          borderRadius: 4, padding: 12, fontFamily: "ui-monospace, monospace",
          fontSize: 10, lineHeight: 1.7
        }}>
          app/<br/>
          ├ (public)/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "var(--ink-3)" }}># 公開サイト</span><br/>
          │ ├ page.tsx<br/>
          │ ├ products/<br/>
          │ ├ prices/<br/>
          │ ├ news/<br/>
          │ └ shops/<br/>
          ├ (admin)/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "var(--ink-3)" }}># 認証必須</span><br/>
          │ ├ post/<br/>
          │ ├ prices/<br/>
          │ └ news/<br/>
          ├ api/<br/>
          └ layout.tsx<br/>
          components/<br/>
          lib/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "var(--ink-3)" }}># supabase / sns clients</span>
        </div>

        <h4 style={{ fontFamily: "Caveat", fontSize: 16, marginTop: 18, marginBottom: 6, color: "var(--pen)" }}>
          ▶ 認証フロー
        </h4>
        <ul style={{ fontSize: 11, paddingLeft: 18, margin: 0 }}>
          <li>Supabase Auth（Magic Link推奨：店舗スタッフが迷わない）</li>
          <li>middleware.ts で /admin/* を保護</li>
          <li>role=owner / staff で権限切り分け</li>
        </ul>
      </div>

      <div>
        <h4 style={{ fontFamily: "Caveat", fontSize: 16, marginBottom: 6, color: "var(--pen)" }}>
          ▶ 実装フェーズ（推奨順）
        </h4>
        <ol style={{ fontSize: 11, paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
          <li><b>Phase 1：基盤</b> — Next.js + Supabase接続 + 認証 + 公開トップ静的版</li>
          <li><b>Phase 2：管理基盤</b> — 管理画面ログイン + お知らせCRUD</li>
          <li><b>Phase 3：価格管理</b> — 価格テーブル + ストーリーリングへの動的反映</li>
          <li><b>Phase 4：SNS連携</b> — IG/LINEクライアント実装 + 同時送信</li>
          <li><b>Phase 5：EC連携</b> — Shopify Storefront APIで商品データ表示</li>
          <li><b>Phase 6：仕上げ</b> — 予約投稿 / 配信ログ / 旧サイトリダイレクト</li>
        </ol>

        <h4 style={{ fontFamily: "Caveat", fontSize: 16, marginTop: 18, marginBottom: 6, color: "var(--pen)" }}>
          ▶ 重要な実装ポイント
        </h4>
        <ul style={{ fontSize: 11, paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
          <li><b>Instagram トークン更新：</b>60日でexpire。Vercel Cronで月1回 refresh</li>
          <li><b>LINE Broadcast 上限：</b>無料プランは月1000通まで。要見積もり</li>
          <li><b>ストーリーリングの実画像：</b>Storage URLをCDN経由で。<code>next/image</code>必須</li>
          <li><b>SR / 静的化：</b>公開ページは ISR 60秒、価格は revalidate=300（5分）</li>
          <li><b>失敗時のリトライ：</b>SNS配信失敗は <code>delivery_logs</code> に記録、UIで再送ボタン</li>
        </ul>

        <h4 style={{ fontFamily: "Caveat", fontSize: 16, marginTop: 18, marginBottom: 6, color: "var(--pen)" }}>
          ▶ デザイン参照
        </h4>
        <ul style={{ fontSize: 11, paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
          <li>ハイファイC案（このプロジェクト内）→ トップページのコンポーネント・カラー・タイポを忠実に再現</li>
          <li>ローファイ管理画面ワイヤー → 構造をそのまま実装、UIはshadcn/uiで統一推奨</li>
          <li>カラートークンは <code>tailwind.config.ts</code> に定義済として扱う</li>
        </ul>
      </div>
    </div>

    <div style={{
      marginTop: 24, padding: 14, background: "rgba(200,69,31,0.06)",
      border: "1.5px dashed var(--pen)", borderRadius: 6, fontSize: 12
    }}>
      <strong style={{ fontFamily: "Caveat", fontSize: 14, color: "var(--pen)", display: "block", marginBottom: 4 }}>
        次に Claude Code に渡す入力イメージ
      </strong>
      「このプロジェクトのデザインとドキュメントを参照して、Phase 1（Next.js + Supabase + 公開トップの静的版）を実装してください。
      <br/>カラートークン・コンポーネント構成は <code>hifi-c.jsx</code> と <code>hifi.css</code> を忠実に再現。
      <br/>テーブル定義は <code>DataModel</code> アートボード参照。」
    </div>
  </div>
);

window.Arch = Arch;
window.DataModel = DataModel;
window.ApiSpec = ApiSpec;
window.Handoff = Handoff;
