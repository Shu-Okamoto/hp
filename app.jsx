/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle */

// ----- Phone wrapper -----
const Phone = ({ children, accent }) => (
  <div className={`phone ${accent ? "accent-on" : "accent-off"}`} data-accent={accent ? "on" : "off"}>
    <div className="phone-notch" />
    <div className="phone-screen">{children}</div>
  </div>
);

// ----- Annotation list -----
const Annot = ({ n, title, body }) => (
  <div className={`annot n${n}`} style={{
    paddingLeft: 28, position: "relative"
  }}>
    <div style={{
      position: "absolute", left: 0, top: 2,
      width: 20, height: 20, border: "2px solid var(--pen)",
      borderRadius: "50%", background: "var(--paper)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Caveat", fontWeight: 700, fontSize: 13, color: "var(--pen)"
    }}>{n}</div>
    <div style={{ fontFamily: "Caveat", fontSize: 18, color: "var(--pen)", lineHeight: 1.2 }}>{title}</div>
    <small style={{
      fontFamily: "Kosugi Maru, sans-serif", fontSize: 11,
      color: "var(--ink-2)", display: "block", marginTop: 4, lineHeight: 1.5
    }}>{body}</small>
  </div>
);

// ----- Frame: phone + annotations side by side -----
const Frame = ({ tag, accent, children, notes }) => (
  <div className="frame-row">
    <div className="phone-wrap">
      {tag && <div className="variation-tag">{tag}</div>}
      <Phone accent={accent}>{children}</Phone>
    </div>
    <div className="annot-col">
      {notes.map((n, i) => (
        <Annot key={i} n={i + 1} title={n.title} body={n.body} />
      ))}
    </div>
  </div>
);

// =====================================================
// APP
// =====================================================

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "topVariant": "all",
  "accentColor": false,
  "bottomNavStyle": "labels"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const accent = tweaks.accentColor;

  // Notes per variation
  const notesA = [
    { title: "フルブリードヒーロー", body: "畑の写真を全面に。コピー＋CTA縦3本を写真上に重ねる。最も「らしさ」が伝わるが画像依存度が高い。" },
    { title: "価格ストーリー（IG連動）", body: "Instagram Basic Display APIで毎朝自動取得。ストーリーリングをタップで詳細モーダル → 元投稿へ遷移。" },
  ];
  const notesB = [
    { title: "コピー主体ヒーロー", body: "和モダンの大きめ日本語タイポを主役に。差し色オン時のみ「食卓」をくすみオレンジで強調 (#c8703a)。画像が無くても成立する。" },
    { title: "価格は2スクロール目", body: "ヒーローで世界観を作ってから価格情報を提示。コピー読了率↑、価格到達率↓のトレードオフ。" },
  ];
  const notesC = [
    { title: "ストーリー先出し", body: "ファーストビューに「今日の販売価格」を最優先で配置。リピーター（毎朝価格チェック）に最適化。新規にはコンセプトの伝わりが弱い。" },
    { title: "ボトムナビにFAB", body: "中央を「今日の価格」FABに変更。価格アクセスを最短化する案。要検証：他4項目とのバランス。" },
  ];
  const notesD = [
    { title: "分割型ヒーロー", body: "上：写真＋短いコピー、下：4つのカードCTA（商品／価格／店舗／弁当）。「ハブ」型でユーザーの目的別導線が明確。" },
    { title: "コンセプトは下層へ", body: "目的指向ユーザー優先。ブランドストーリーは下層・別ページで深く伝える方針。" },
  ];

  // Sub-page notes
  const productsNotes = [
    { title: "Shopify連携", body: "Storefront APIで商品データを取得。在庫・価格はShopify側で管理。サイト側は表示のみ。" },
    { title: "2列グリッド", body: "スマホは2列、最小タップ44px。カテゴリチップで絞り込み。価格は差し色オンでくすみオレンジ。" },
  ];
  const priceNotes = [
    { title: "毎朝更新", body: "Instagramへの投稿をトリガに自動反映。管理画面の表示ON/OFFトグルで非表示制御も可。" },
    { title: "目玉商品", body: "1点だけ大きく目立たせる枠。管理画面で「目玉に設定」チェック。" },
    { title: "野菜一覧", body: "全在庫リスト。タップで詳細／IG投稿へ。" },
  ];
  const newsNotes = [
    { title: "SNS統合フィード", body: "サイト掲載・LINE配信・Instagram投稿を1つのタイムラインに統合。フィルタチップでソース絞り込み。" },
    { title: "管理画面のクイック投稿で同時送信", body: "1か所の入力で「サイト」「LINE」「IG」をチェック選択 → 同時配信。タグは自動付与。" },
  ];
  const shopsNotes = [
    { title: "Google Maps Embed", body: "全店舗ピン表示。タップで該当店舗カードへスクロール。" },
    { title: "店舗カード", body: "営業状況／時間／電話・経路ボタン。最低タップ44px。" },
  ];

  const showVariant = (key) => tweaks.topVariant === "all" || tweaks.topVariant === key;

  return (
    <DesignCanvas>
      <DCSection id="admin" title="管理画面ワイヤー" subtitle="クイック投稿・価格管理・お知らせ管理・SNS連携状況">
        <DCArtboard id="quickPost" label="① クイック投稿" width={1240} height={820}>
          <div style={{ padding: 30, background: "#f1ede2" }}><QuickPost /></div>
        </DCArtboard>
        <DCArtboard id="priceManager" label="② 価格管理" width={1240} height={820}>
          <div style={{ padding: 30, background: "#f1ede2" }}><PriceManager /></div>
        </DCArtboard>
        <DCArtboard id="newsManager" label="③ お知らせ管理" width={1240} height={820}>
          <div style={{ padding: 30, background: "#f1ede2" }}><NewsManager /></div>
        </DCArtboard>
        <DCArtboard id="snsStatus" label="④ SNS連携状況" width={1240} height={820}>
          <div style={{ padding: 30, background: "#f1ede2" }}><SnsStatus /></div>
        </DCArtboard>
      </DCSection>

      <DCSection id="docs" title="システム設計ドキュメント" subtitle="アーキテクチャ・データモデル・API仕様">
        <DCArtboard id="arch" label="① アーキテクチャ図" width={1240} height={1100}>
          <div style={{ padding: 30, background: "#f1ede2" }}><Arch /></div>
        </DCArtboard>
        <DCArtboard id="dataModel" label="② データモデル" width={1240} height={1100}>
          <div style={{ padding: 30, background: "#f1ede2" }}><DataModel /></div>
        </DCArtboard>
        <DCArtboard id="apiSpec" label="③ API仕様・連携フロー" width={1240} height={1100}>
          <div style={{ padding: 30, background: "#f1ede2" }}><ApiSpec /></div>
        </DCArtboard>
      </DCSection>

      <DCSection id="handoff" title="Claude Code ハンドオフ" subtitle="開発エンジニア・AIエージェントへの引き継ぎ資料">
        <DCArtboard id="handoff1" label="ハンドオフ資料" width={1240} height={900}>
          <div style={{ padding: 30, background: "#f1ede2" }}><Handoff /></div>
        </DCArtboard>
      </DCSection>

      <DCSection id="hifi" title="ハイファイ — C案ベース" subtitle="ブランドカラー・タイポグラフィ・実画像プレースホルダー適用">
        <DCArtboard id="hifiC" label="C+ ハイファイ" width={560} height={1000}>
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 40px", background: "#d9d2c2", minHeight: "100%" }}>
            <HiFiCPage />
          </div>
        </DCArtboard>
        <DCArtboard id="hifiCNotes" label="C+ — 設計メモ" width={520} height={1000}>
          <div style={{ padding: 40, background: "#faf5ec", height: "100%", boxSizing: "border-box", fontFamily: "Noto Sans JP, sans-serif", color: "#2d4030", fontSize: 13, lineHeight: 1.7 }}>
            <div style={{ fontFamily: "Cormorant Garamond, serif", letterSpacing: "0.22em", fontSize: 11, color: "#c8703a", marginBottom: 6 }}>DESIGN NOTES</div>
            <h2 style={{ fontFamily: "Shippori Mincho, serif", fontWeight: 500, color: "#2d5a3d", fontSize: 24, margin: "0 0 18px" }}>C案ベースの設計判断</h2>

            <h4 style={{ fontFamily: "Shippori Mincho, serif", color: "#2d5a3d", margin: "20px 0 6px", fontSize: 15 }}>カラーパレット</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {[
                ["#faf5ec", "ベース"],
                ["#f2e9d8", "セクション"],
                ["#e5d9c0", "ボーダー"],
                ["#2d5a3d", "深緑"],
                ["#3d7a52", "深緑中"],
                ["#c8703a", "オレンジ"],
                ["#e6a870", "薄オレンジ"],
                ["#f2c490", "アクセント"],
              ].map(([c, l]) => (
                <div key={c} style={{ width: 64 }}>
                  <div style={{ height: 40, background: c, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 4 }} />
                  <div style={{ fontSize: 9, marginTop: 4, fontFamily: "Cormorant Garamond, serif", letterSpacing: "0.08em", color: "#8a7a60" }}>{c}</div>
                  <div style={{ fontSize: 10 }}>{l}</div>
                </div>
              ))}
            </div>

            <h4 style={{ fontFamily: "Shippori Mincho, serif", color: "#2d5a3d", margin: "20px 0 6px", fontSize: 15 }}>タイポグラフィ</h4>
            <ul style={{ paddingLeft: 18, margin: "0 0 12px" }}>
              <li><b style={{ fontFamily: "Shippori Mincho, serif" }}>Shippori Mincho</b>：見出し・タグライン（和モダンの上品さ）</li>
              <li><b>Noto Sans JP</b>：本文・UI（500ウェイト中心、太すぎず）</li>
              <li><b style={{ fontFamily: "Cormorant Garamond, serif" }}>Cormorant Garamond</b>：英字ラベル（letter-spacing 0.22em）</li>
              <li>価格は英字フォントで大きく：くすみオレンジ #c8703a</li>
            </ul>

            <h4 style={{ fontFamily: "Shippori Mincho, serif", color: "#2d5a3d", margin: "20px 0 6px", fontSize: 15 }}>C案からの主な変更点</h4>
            <ol style={{ paddingLeft: 20, margin: "0 0 12px" }}>
              <li><b>商品 ＋ コンセプト統合：</b>「畑とつながる、5つのかたち」として1セクション化。農家直送・看板商品・弁当・加工品・オンラインを並列のカードで提示。</li>
              <li><b>ストーリーリング：</b>各リング下に価格を直接表示し、タップ前の情報密度UP。グラデリングはくすみオレンジで統一。</li>
              <li><b>スティッキー価格バー：</b>ボトムナビ上に常駐。スクロール位置に関わらず「今日の価格」へ即アクセス。</li>
              <li><b>アグリパートナーズセクション：</b>深緑背景で世界観を切り替え、ブランドの&quot;深さ&quot;を表現。</li>
              <li><b>詳細フッター：</b>サイトマップ／サービス／3店舗情報／SNS／法務情報を網羅。</li>
            </ol>

            <h4 style={{ fontFamily: "Shippori Mincho, serif", color: "#2d5a3d", margin: "20px 0 6px", fontSize: 15 }}>差し替え必要な実素材</h4>
            <ul style={{ paddingLeft: 18, margin: "0 0 12px" }}>
              <li>野菜の写真（円形クロップ用、正方形）×8〜10種</li>
              <li>商品カードのメイン写真（4:3、5枚）</li>
              <li>農家・畑のヒーロー写真（横長、1〜2枚）</li>
              <li>ロゴ（現在は「里」文字で代用中）</li>
              <li>各店舗の外観写真（任意）</li>
            </ul>

            <h4 style={{ fontFamily: "Shippori Mincho, serif", color: "#2d5a3d", margin: "20px 0 6px", fontSize: 15 }}>次のステップ案</h4>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li>サブページ（商品詳細・価格詳細・お知らせ）のハイファイ化</li>
              <li>管理画面（クイック投稿・価格管理）のワイヤー</li>
              <li>マイクロインタラクション（ストーリーリングのアニメ等）</li>
            </ul>
          </div>
        </DCArtboard>
      </DCSection>

      <DCSection id="hero" title="ローファイ — 4案（参考）" subtitle="A／B／D は参考として保存">
        {showVariant("A") && (
          <DCArtboard id="topA" label="A. フルブリード写真" width={720} height={1860}>
            <Frame tag="A — FULL BLEED" accent={accent} notes={notesA}>
              <TopPageA />
            </Frame>
          </DCArtboard>
        )}
        {showVariant("B") && (
          <DCArtboard id="topB" label="B. コピー主体" width={720} height={1860}>
            <Frame tag="B — COPY FIRST" accent={accent} notes={notesB}>
              <TopPageB />
            </Frame>
          </DCArtboard>
        )}
        {showVariant("C") && (
          <DCArtboard id="topC" label="C. ストーリー先出し" width={720} height={1860}>
            <Frame tag="C — STORY FIRST" accent={accent} notes={notesC}>
              <TopPageC />
            </Frame>
          </DCArtboard>
        )}
        {showVariant("D") && (
          <DCArtboard id="topD" label="D. 分割ハブ型" width={720} height={1860}>
            <Frame tag="D — HUB / SPLIT" accent={accent} notes={notesD}>
              <TopPageD />
            </Frame>
          </DCArtboard>
        )}
      </DCSection>

      <DCSection id="subpages" title="サブページ（主要4画面）">
        <DCArtboard id="products" label="商品・メニュー" width={720} height={1500}>
          <Frame tag="商品・メニュー" accent={accent} notes={productsNotes}>
            <ProductsPage />
          </Frame>
        </DCArtboard>
        <DCArtboard id="price" label="今日の価格" width={720} height={1700}>
          <Frame tag="今日の価格" accent={accent} notes={priceNotes}>
            <PricePage />
          </Frame>
        </DCArtboard>
        <DCArtboard id="news" label="お知らせ一覧" width={720} height={1700}>
          <Frame tag="お知らせ一覧" accent={accent} notes={newsNotes}>
            <NewsPage />
          </Frame>
        </DCArtboard>
        <DCArtboard id="shops" label="店舗一覧" width={720} height={1500}>
          <Frame tag="店舗一覧" accent={accent} notes={shopsNotes}>
            <ShopsPage />
          </Frame>
        </DCArtboard>
      </DCSection>

      <TweaksPanel title="Tweaks">
        <TweakSection label="トップページ表示">
          <TweakRadio
            label="表示"
            value={tweaks.topVariant}
            onChange={(v) => setTweak("topVariant", v)}
            options={[
              { value: "all", label: "全て" },
              { value: "A", label: "A" },
              { value: "B", label: "B" },
              { value: "C", label: "C" },
              { value: "D", label: "D" },
            ]}
          />
        </TweakSection>
        <TweakSection label="色味">
          <TweakToggle
            label="差し色をオン（ブランドカラー）"
            value={tweaks.accentColor}
            onChange={(v) => setTweak("accentColor", v)}
          />
          <div style={{ fontSize: 11, color: "#888", marginTop: 4, lineHeight: 1.4 }}>
            オフ：純モノクロのワイヤーフレーム<br/>
            オン：深緑 #2d5a3d ／ くすみオレンジ #c8703a が点在
          </div>
        </TweakSection>
      </TweaksPanel>

      {/* Legend */}
      <div className="legend">
        <strong>凡例</strong>
        <div className="row"><span className="pin-dot" /> ＝ 仕様注記（右に説明）</div>
        <div className="row" style={{ marginTop: 4 }}>
          <span style={{ width: 14, height: 14, background:
            "repeating-linear-gradient(135deg, transparent 0 4px, rgba(26,26,26,0.2) 4px 5px)",
            border: "1px solid #1a1a1a"
          }} /> ＝ 画像プレースホルダー
        </div>
      </div>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
