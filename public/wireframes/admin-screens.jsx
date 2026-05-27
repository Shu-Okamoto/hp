/* global React */

// Admin desktop frame components — same lo-fi vocabulary as wireframes

const NAV_ITEMS = [
  ["📝", "クイック投稿", "投稿"],
  ["💰", "価格管理", "価格"],
  ["📢", "お知らせ管理", "お知らせ"],
  ["🔗", "SNS連携状況", "SNS"],
  ["🏪", "店舗情報", "店舗"],
  ["📊", "アクセス分析", "分析"],
  ["⚙️", "設定", "設定"],
];

const SidebarNav = ({ active, onClose }) => (
  <>
    <div style={{ padding: "0 16px 12px", borderBottom: "1px dashed var(--ink-3)", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 16 }}>さとの味みかわ</div>
        <div style={{ fontSize: 10, color: "var(--ink-3)", fontFamily: "Caveat", letterSpacing: "0.1em" }}>ADMIN PANEL</div>
      </div>
      {onClose && (
        <div style={{
          width: 32, height: 32, border: "1.5px solid var(--ink)", borderRadius: 4,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Caveat", fontSize: 18, fontWeight: 700, cursor: "pointer"
        }}>✕</div>
      )}
    </div>
    {NAV_ITEMS.map(([ico, label, key]) => (
      <div key={key} style={{
        padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 10,
        fontSize: 13, minHeight: 44,
        background: active === key ? "var(--ink)" : "transparent",
        color: active === key ? "var(--paper)" : "var(--ink)",
        borderLeft: active === key ? "3px solid var(--pen)" : "3px solid transparent",
      }}>
        <span style={{ fontSize: 14 }}>{ico}</span>
        <span>{label}</span>
      </div>
    ))}
  </>
);

// ─── Desktop browser-style admin frame ─────────────────────
const AdminFrame = ({ title, children, sidebar = "投稿" }) => (
  <div style={{
    width: 1180, height: 760,
    border: "2.5px solid var(--ink)", borderRadius: 8, overflow: "hidden",
    background: "var(--paper)", boxShadow: "8px 8px 0 rgba(26,26,26,0.08)",
    display: "flex", flexDirection: "column",
    fontFamily: '"Kosugi Maru", sans-serif',
  }}>
    <div style={{
      height: 36, borderBottom: "1.5px solid var(--ink)",
      display: "flex", alignItems: "center", padding: "0 12px",
      gap: 10, background: "rgba(26,26,26,0.04)"
    }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[1,2,3].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid var(--ink)" }} />)}
      </div>
      <div style={{
        flex: 1, height: 22, border: "1.5px solid var(--ink)",
        borderRadius: 4, background: "var(--paper)", fontFamily: "Caveat", fontSize: 12,
        display: "flex", alignItems: "center", padding: "0 10px", color: "var(--ink-2)"
      }}>admin.satonoaji-mikawa.com / {title}</div>
    </div>
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <div style={{ width: 200, borderRight: "1.5px solid var(--ink)", padding: "16px 0", background: "rgba(26,26,26,0.02)", flexShrink: 0 }}>
        <SidebarNav active={sidebar} />
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "20px 28px" }}>
        {children}
      </div>
    </div>
  </div>
);

// ─── Mobile admin frame (with toggleable sidebar / hamburger) ──
const MobileAdminFrame = ({ title, children, sidebar = "投稿", drawerOpen = false }) => (
  <div style={{
    width: 390, height: 780,
    border: "2.5px solid var(--ink)", borderRadius: 36, overflow: "hidden",
    background: "var(--paper)", boxShadow: "6px 6px 0 rgba(26,26,26,0.08)",
    position: "relative", fontFamily: '"Kosugi Maru", sans-serif'
  }}>
    {/* Notch */}
    <div style={{
      position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
      width: 110, height: 22, background: "var(--ink)", borderRadius: 14, zIndex: 30
    }} />
    {/* Top app bar */}
    <div style={{
      position: "absolute", top: 38, left: 0, right: 0, height: 52,
      borderBottom: "1.5px solid var(--ink)", background: "var(--paper)",
      display: "flex", alignItems: "center", padding: "0 14px", gap: 10, zIndex: 20
    }}>
      <div style={{
        width: 36, height: 36, border: "1.5px solid var(--ink)", borderRadius: 4,
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 3,
        padding: "0 7px"
      }}>
        <div style={{ height: 2, background: "var(--ink)" }} />
        <div style={{ height: 2, background: "var(--ink)" }} />
        <div style={{ height: 2, background: "var(--ink)" }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "Caveat", fontSize: 15, fontWeight: 700, lineHeight: 1 }}>
          {NAV_ITEMS.find(n => n[2] === sidebar)?.[1] || "管理"}
        </div>
        <div style={{ fontSize: 9, color: "var(--ink-3)", fontFamily: "Caveat", letterSpacing: "0.08em" }}>ADMIN</div>
      </div>
      <div style={{
        width: 36, height: 36, border: "1.5px solid var(--ink)", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
        fontFamily: "Caveat"
      }}>👤</div>
    </div>

    {/* Content */}
    <div style={{ position: "absolute", inset: "90px 0 0", overflow: "auto", padding: "16px 14px" }}>
      {children}
    </div>

    {/* Drawer overlay */}
    {drawerOpen && (
      <>
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40
        }} />
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: 0, width: 280,
          background: "var(--paper)", zIndex: 41,
          borderRight: "1.5px solid var(--ink)",
          paddingTop: 50, overflowY: "auto",
          boxShadow: "4px 0 20px rgba(0,0,0,0.15)"
        }}>
          <SidebarNav active={sidebar} onClose />
        </div>
      </>
    )}
  </div>
);

// Mobile bottom action bar (sticky save / send)
const MobileActions = ({ children }) => (
  <div style={{
    position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 14px 14px",
    borderTop: "1.5px solid var(--ink)", background: "var(--paper)",
    display: "flex", gap: 8, zIndex: 15
  }}>{children}</div>
);

const PageHead = ({ title, sub }) => (
  <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "1.5px solid var(--ink)" }}>
    <div style={{ fontFamily: "Caveat", fontSize: 22, fontWeight: 700 }}>{title}</div>
    {sub && <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 3 }}>{sub}</div>}
  </div>
);

// ─── 1. Quick Post screen ──────────────────────────────────
const QuickPost = () => (
  <AdminFrame title="quick-post" sidebar="投稿">
    <PageHead title="クイック投稿" sub="1か所の入力で「サイト掲載」「LINE配信」「Instagram投稿」を同時送信" />

    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
      {/* Left: form */}
      <div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, marginBottom: 4, fontWeight: 600 }}>カテゴリ</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["お知らせ", "イベント", "アグリ", "セール"].map((c, i) => (
              <span key={c} className="tag" style={{
                padding: "5px 12px", fontSize: 11,
                background: i === 0 ? "var(--ink)" : "transparent",
                color: i === 0 ? "var(--paper)" : "var(--ink)",
                borderRadius: 14
              }}>{c}</span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, marginBottom: 4, fontWeight: 600 }}>タイトル</div>
          <div style={{
            border: "1.5px solid var(--ink)", borderRadius: 4, padding: "8px 10px",
            fontSize: 12, color: "var(--ink-2)", background: "var(--paper)"
          }}>本日の入荷：愛知の朝採れトマトが入りました</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, marginBottom: 4, fontWeight: 600 }}>本文</div>
          <div style={{
            border: "1.5px solid var(--ink)", borderRadius: 4, padding: 10,
            minHeight: 120, fontSize: 11, color: "var(--ink-2)", lineHeight: 1.7,
            background: "var(--paper)"
          }}>
            岡崎の◯◯農園さんから、糖度の高い完熟トマトが入荷しました。<br/>
            数量限定のため、お早めにお越しください。<br/>
            <br/>
            <span style={{ color: "var(--ink-3)" }}>※プレースホルダーテキスト</span>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, marginBottom: 4, fontWeight: 600 }}>画像</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div className="wf-fill" style={{
              width: 100, height: 100, border: "1.5px solid var(--ink)", borderRadius: 4
            }} />
            <div style={{
              width: 100, height: 100, border: "1.5px dashed var(--ink-3)", borderRadius: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Caveat", fontSize: 24, color: "var(--ink-3)"
            }}>＋</div>
          </div>
        </div>

        {/* Send-to checkboxes */}
        <div style={{
          marginTop: 24, padding: 16, border: "2px solid var(--pen)",
          borderRadius: 6, background: "rgba(200,69,31,0.04)"
        }}>
          <Pin n="2" style={{ top: -12, right: -12, position: "relative", float: "right", marginTop: -28 }} />
          <div style={{ fontFamily: "Caveat", fontSize: 16, color: "var(--pen)", marginBottom: 10 }}>
            送信先を選択
          </div>
          {[
            ["☑", "サイトに掲載する", "/お知らせ一覧に追加"],
            ["☑", "LINE公式に配信", "登録者900名へ一斉配信"],
            ["☑", "Instagram に投稿", "フィード／ストーリー切替可"],
          ].map(([cb, label, sub], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
              <span style={{
                width: 20, height: 20, border: "1.5px solid var(--ink)", borderRadius: 3,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--ink)", color: "var(--paper)", fontSize: 12
              }}>✓</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{sub}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button style={{
            padding: "12px 24px", border: "2px solid var(--ink)", background: "var(--ink)",
            color: "var(--paper)", fontFamily: "Caveat", fontSize: 16, borderRadius: 4, fontWeight: 700
          }}>同時送信する</button>
          <button style={{
            padding: "12px 18px", border: "2px solid var(--ink)", background: "transparent",
            fontFamily: "Caveat", fontSize: 14, borderRadius: 4
          }}>下書き保存</button>
          <button style={{
            padding: "12px 18px", border: "1.5px dashed var(--ink-3)", background: "transparent",
            fontFamily: "Caveat", fontSize: 14, borderRadius: 4, color: "var(--ink-3)"
          }}>予約投稿</button>
        </div>
      </div>

      {/* Right: preview */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>プレビュー</div>
        <Pin n="3" style={{ position: "relative", float: "right", marginTop: -28 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {["サイト", "LINE", "Instagram"].map((label) => (
            <div key={label} style={{ border: "1.5px solid var(--ink)", borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                padding: "6px 10px", fontFamily: "Caveat", fontSize: 12, fontWeight: 700,
                background: "var(--ink)", color: "var(--paper)"
              }}>{label}</div>
              <div style={{ padding: 10 }}>
                <div className="wf-fill" style={{ height: 60, marginBottom: 6, borderRadius: 3 }} />
                <div className="line long" style={{ height: 4 }} />
                <div className="line med" style={{ height: 3, opacity: 0.5 }} />
                <div className="line short" style={{ height: 3, opacity: 0.5 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <Pin n="1" style={{ position: "absolute", top: 60, right: 20 }} />
  </AdminFrame>
);

// ─── 2. Price Manager ──────────────────────────────────────
const PriceManager = () => (
  <AdminFrame title="prices" sidebar="価格">
    <PageHead title="今日の販売価格 — 価格管理" sub="ストーリーリングに自動反映 ／ 表示ON/OFF切替可" />

    {/* Status row */}
    <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
      <div style={{ border: "1.5px solid var(--ink)", borderRadius: 6, padding: "10px 14px", flex: 1 }}>
        <div style={{ fontSize: 10, color: "var(--ink-3)" }}>本日の表示数</div>
        <div style={{ fontFamily: "Caveat", fontSize: 24, fontWeight: 700 }}>6 / 8 種</div>
      </div>
      <div style={{ border: "1.5px solid var(--ink)", borderRadius: 6, padding: "10px 14px", flex: 1 }}>
        <div style={{ fontSize: 10, color: "var(--ink-3)" }}>最終更新</div>
        <div style={{ fontFamily: "Caveat", fontSize: 18, fontWeight: 700 }}>04.26 06:42</div>
      </div>
      <div style={{ border: "1.5px solid var(--ink)", borderRadius: 6, padding: "10px 14px", flex: 1 }}>
        <div style={{ fontSize: 10, color: "var(--ink-3)" }}>IGストーリー連動</div>
        <div style={{ fontFamily: "Caveat", fontSize: 18, fontWeight: 700, color: "var(--pen)" }}>● 自動反映 ON</div>
      </div>
      <button style={{
        padding: "0 20px", border: "2px solid var(--ink)", background: "var(--ink)",
        color: "var(--paper)", fontFamily: "Caveat", fontSize: 15, borderRadius: 6, fontWeight: 700
      }}>＋ 野菜を追加</button>
    </div>

    <Pin n="1" style={{ position: "absolute", top: 60, right: 20 }} />

    {/* Table */}
    <div style={{ border: "1.5px solid var(--ink)", borderRadius: 6, overflow: "hidden" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "60px 1fr 100px 120px 100px 100px 80px",
        padding: "10px 14px", borderBottom: "1.5px solid var(--ink)",
        fontSize: 11, fontWeight: 700, background: "rgba(26,26,26,0.05)"
      }}>
        <div>順序</div><div>野菜名</div><div>価格</div><div>単位</div><div>更新</div><div>表示</div><div>操作</div>
      </div>
      {[
        ["1", "🍅", "トマト", "280", "/個", "06:42", true],
        ["2", "🥒", "きゅうり", "120", "/本", "06:42", true],
        ["3", "🍆", "なす", "180", "/個", "06:42", true],
        ["4", "🌽", "とうもろこし", "220", "/本", "06:42", true],
        ["5", "🥬", "小松菜", "150", "/束", "06:42", true],
        ["6", "🍇", "ぶどう", "680", "/パック", "06:42", true],
        ["7", "🥕", "にんじん", "130", "/本", "04.25", false],
        ["8", "🧅", "玉ねぎ", "100", "/個", "04.25", false],
      ].map(([n, emoji, name, price, unit, updated, on], i) => (
        <div key={n} style={{
          display: "grid", gridTemplateColumns: "60px 1fr 100px 120px 100px 100px 80px",
          padding: "10px 14px", borderBottom: i < 7 ? "1px dashed var(--ink-3)" : "none",
          fontSize: 12, alignItems: "center"
        }}>
          <div style={{ fontFamily: "Caveat", color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ cursor: "grab", fontSize: 12 }}>⋮⋮</span> {n}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{emoji}</span> {name}
          </div>
          <div style={{
            border: "1px solid var(--ink-3)", borderRadius: 3, padding: "4px 8px",
            fontFamily: "Caveat", fontSize: 14, width: 70, textAlign: "right"
          }}>¥{price}</div>
          <div style={{ color: "var(--ink-3)" }}>{unit}</div>
          <div style={{ fontSize: 11, color: "var(--ink-2)" }}>{updated}</div>
          <div>
            <span style={{
              display: "inline-block", width: 36, height: 20, borderRadius: 10,
              border: "1.5px solid var(--ink)",
              background: on ? "var(--ink)" : "transparent",
              position: "relative"
            }}>
              <span style={{
                position: "absolute", top: 1.5, left: on ? 17 : 1.5,
                width: 14, height: 14, borderRadius: "50%",
                background: on ? "var(--paper)" : "var(--ink)"
              }} />
            </span>
          </div>
          <div style={{ fontFamily: "Caveat", fontSize: 12, color: "var(--ink-3)" }}>編集 · 削除</div>
        </div>
      ))}
    </div>

    <Pin n="2" style={{ position: "absolute", top: 280, right: 20 }} />

    <div style={{
      marginTop: 18, padding: 14, border: "1.5px dashed var(--pen)",
      borderRadius: 6, background: "rgba(200,69,31,0.04)",
      fontSize: 12, fontFamily: "Caveat", color: "var(--pen)", lineHeight: 1.5
    }}>
      <strong style={{ display: "block", marginBottom: 4, fontSize: 14 }}>自動反映の流れ</strong>
      管理画面で更新 → サイトのストーリーリングに即時反映 → 「Instagramにも投稿する」をONにするとIGストーリーへ自動投稿
    </div>
  </AdminFrame>
);

// ─── 3. News Manager ───────────────────────────────────────
const NewsManager = () => (
  <AdminFrame title="news" sidebar="お知らせ">
    <PageHead title="お知らせ管理" sub="投稿・編集・削除 ／ サイト・LINE・Instagram の配信状況も確認" />

    {/* Toolbar */}
    <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
      <input style={{
        flex: 1, border: "1.5px solid var(--ink)", borderRadius: 4,
        padding: "8px 12px", fontSize: 12
      }} placeholder="キーワード検索…" />
      {["すべて", "お知らせ", "イベント", "アグリ", "セール"].map((c, i) => (
        <span key={c} style={{
          padding: "5px 12px", fontSize: 11,
          background: i === 0 ? "var(--ink)" : "transparent",
          color: i === 0 ? "var(--paper)" : "var(--ink)",
          border: "1.5px solid var(--ink)",
          borderRadius: 14
        }}>{c}</span>
      ))}
      <button style={{
        padding: "8px 16px", border: "2px solid var(--ink)", background: "var(--ink)",
        color: "var(--paper)", fontFamily: "Caveat", fontSize: 14, borderRadius: 4, fontWeight: 700
      }}>＋ 新規投稿</button>
    </div>

    <Pin n="1" style={{ position: "absolute", top: 60, right: 20 }} />

    {/* Table */}
    <div style={{ border: "1.5px solid var(--ink)", borderRadius: 6, overflow: "hidden" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "100px 80px 1fr 180px 80px",
        padding: "10px 14px", borderBottom: "1.5px solid var(--ink)",
        fontSize: 11, fontWeight: 700, background: "rgba(26,26,26,0.05)"
      }}>
        <div>日付</div><div>カテゴリ</div><div>タイトル</div><div>配信先</div><div>操作</div>
      </div>
      {[
        ["04.26", "お知らせ", "本日の入荷：愛知の朝採れトマト", ["site","ig","line"], "公開"],
        ["04.25", "セール", "週末セール開催のお知らせ", ["site","line"], "公開"],
        ["04.22", "イベント", "5月「畑の収穫体験」参加者募集", ["site","ig","line"], "公開"],
        ["04.20", "お知らせ", "GW営業時間のご案内", ["site","line"], "公開"],
        ["04.18", "アグリ", "規格外トマトのジャム新商品", ["site","ig"], "公開"],
        ["04.15", "お知らせ", "（下書き）秋の新商品予告", [], "下書き"],
      ].map(([date, cat, title, channels, status], i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "100px 80px 1fr 180px 80px",
          padding: "10px 14px", borderBottom: i < 5 ? "1px dashed var(--ink-3)" : "none",
          fontSize: 12, alignItems: "center"
        }}>
          <div style={{ fontFamily: "Caveat", fontSize: 14 }}>{date}</div>
          <div><span className="tag" style={{ fontSize: 10 }}>{cat}</span></div>
          <div>{title}</div>
          <div style={{ display: "flex", gap: 4 }}>
            {["site", "ig", "line"].map(c => (
              <span key={c} style={{
                width: 24, height: 24, borderRadius: "50%", fontSize: 9,
                border: "1.5px solid var(--ink)",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: channels.includes(c) ? "var(--ink)" : "transparent",
                color: channels.includes(c) ? "var(--paper)" : "var(--ink-3)",
                fontWeight: 700
              }}>
                {c === "site" ? "W" : c === "ig" ? "IG" : "L"}
              </span>
            ))}
          </div>
          <div>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 10,
              background: status === "公開" ? "var(--ink)" : "transparent",
              color: status === "公開" ? "var(--paper)" : "var(--ink-3)",
              border: status === "下書き" ? "1px dashed var(--ink-3)" : "none"
            }}>{status}</span>
          </div>
        </div>
      ))}
    </div>

    <Pin n="2" style={{ position: "absolute", top: 230, right: 20 }} />
  </AdminFrame>
);

// ─── 4. SNS Status ─────────────────────────────────────────
const SnsStatus = () => (
  <AdminFrame title="sns-status" sidebar="SNS">
    <PageHead title="SNS連携状況" sub="Instagram・LINE の連携状態と最近の配信履歴" />

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
      {[
        { name: "Instagram", handle: "@satonoaji_mikawa", followers: "500", lastPost: "04.26 06:42", status: "接続中" },
        { name: "LINE公式", handle: "@satonoaji-mikawa", followers: "900", lastPost: "04.25 18:00", status: "接続中" },
      ].map((s, i) => (
        <div key={i} style={{ border: "1.5px solid var(--ink)", borderRadius: 6, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "Caveat", fontSize: 18, fontWeight: 700 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{s.handle}</div>
            </div>
            <span style={{
              padding: "3px 10px", fontSize: 10,
              background: "var(--ink)", color: "var(--paper)", borderRadius: 12
            }}>● {s.status}</span>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--ink-3)" }}>フォロワー</div>
              <div style={{ fontFamily: "Caveat", fontSize: 22, fontWeight: 700 }}>{s.followers}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--ink-3)" }}>最終配信</div>
              <div style={{ fontFamily: "Caveat", fontSize: 16, fontWeight: 700 }}>{s.lastPost}</div>
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button style={{
              padding: "6px 14px", border: "1.5px solid var(--ink)", borderRadius: 4,
              fontSize: 11, background: "transparent"
            }}>API再認証</button>
            <button style={{
              padding: "6px 14px", border: "1.5px solid var(--ink-3)", borderRadius: 4,
              fontSize: 11, background: "transparent", color: "var(--ink-3)"
            }}>配信ログ</button>
          </div>
        </div>
      ))}
    </div>

    <Pin n="1" style={{ position: "absolute", top: 60, right: 20 }} />

    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>最近の配信履歴</div>
    <div style={{ border: "1.5px solid var(--ink)", borderRadius: 6, overflow: "hidden" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "120px 80px 1fr 100px 80px",
        padding: "10px 14px", borderBottom: "1.5px solid var(--ink)",
        fontSize: 11, fontWeight: 700, background: "rgba(26,26,26,0.05)"
      }}>
        <div>日時</div><div>チャネル</div><div>内容</div><div>結果</div><div>操作</div>
      </div>
      {[
        ["04.26 06:42", "IG", "本日の販売価格を更新", "成功"],
        ["04.25 18:00", "LINE", "週末セール開催のお知らせ", "成功"],
        ["04.25 12:30", "IG＋LINE", "新商品のジャム入荷", "成功"],
        ["04.22 09:00", "LINE", "GW営業時間のご案内", "成功"],
        ["04.20 15:20", "IG", "アグリパートナーズ取材", "成功"],
      ].map((r, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "120px 80px 1fr 100px 80px",
          padding: "10px 14px", borderBottom: i < 4 ? "1px dashed var(--ink-3)" : "none",
          fontSize: 12, alignItems: "center"
        }}>
          <div style={{ fontFamily: "Caveat", fontSize: 13 }}>{r[0]}</div>
          <div><span className="tag" style={{ fontSize: 10 }}>{r[1]}</span></div>
          <div>{r[2]}</div>
          <div><span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 10,
            background: "var(--ink)", color: "var(--paper)"
          }}>● {r[3]}</span></div>
          <div style={{ fontFamily: "Caveat", fontSize: 11, color: "var(--ink-3)" }}>詳細</div>
        </div>
      ))}
    </div>

    <Pin n="2" style={{ position: "absolute", top: 280, right: 20 }} />
  </AdminFrame>
);

window.QuickPost = QuickPost;
window.PriceManager = PriceManager;
window.NewsManager = NewsManager;
window.SnsStatus = SnsStatus;
