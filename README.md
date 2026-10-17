# 里の味みかわ — 実装プロトタイプ

Next.js 14 (App Router) + Auth.js v5 on Vercel.

## ローカル開発

```bash
npm install
echo "AUTH_SECRET=$(openssl rand -hex 32)" > .env.local
npm run dev    # http://localhost:3000
```

公開サイトは `/` から、管理画面は `/admin` から。ワイヤーフレームは preview/dev では `/wireframes`（本番では 410）。

## 本番ビルド

```bash
npm run build
npm start
```

## Vercel デプロイ

1. リポジトリを Vercel で **New Project** から取り込む
2. Framework Preset は自動で **Next.js** が選択される
3. **Environment Variables** に最低限以下を設定する:
   - `AUTH_SECRET` — `openssl rand -hex 32` で生成した値（必須）
4. Deploy

### URL 一覧

| パス | 用途 |
| --- | --- |
| `/` | 公開サイト・ホーム |
| `/products` | 商品一覧 |
| `/products/[handle]` | 商品詳細（SSG、OGP 付き） |
| `/news` | お知らせ一覧 |
| `/news/[id]` | お知らせ詳細（SSG、OGP 付き） |
| `/price` | 今日の販売価格 |
| `/shops` | 店舗一覧 |
| `/agri` | 農家との取り組み |
| `/admin` | 管理コンソール（Auth.js Credentials） |
| `/sitemap.xml`, `/robots.txt` | 自動生成 |

### 認証（管理画面）

デモアカウント（プロトタイプ用ハードコード）:

| ユーザー | パスワード | ロール | 利用可能ページ |
| --- | --- | --- | --- |
| `admin` | `admin` | owner | 全機能 |
| `staff` | `staff` | staff | クイック投稿・価格管理のみ |

本番では `auth.js` の `ACCOUNTS` 配列を DB ルックアップ＋bcrypt ハッシュに差し替え。

### 環境変数

| 変数 | 用途 | 必須 |
| --- | --- | --- |
| `AUTH_SECRET` | Auth.js のセッション署名キー | ✅ |
| `NEXT_PUBLIC_API_MODE` | `mock`(既定) / `real` を切替 | – |
| `NEXT_PUBLIC_SITE_URL` | sitemap.xml / robots.txt / OGP の絶対 URL | – (Vercel が自動推論) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | 店舗ページのミニマップ | 地図表示時 |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | ベクター地図のスタイル ID（Cloud Console で作成） | – (未設定なら `DEMO_MAP_ID`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL | 価格表示・編集時 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon (public) キー。`/price` の読み取り・RLS でガード | 価格表示時 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role キー。サーバ専用 (秘匿)、admin の **書き込みのみ** に使用 | 価格 PUT 時 |
| `SHOPIFY_STORE_DOMAIN` | `*.myshopify.com` | real 時 |
| `SHOPIFY_STOREFRONT_TOKEN` | Storefront API 読み取り用トークン | real 時 |
| `SHOPIFY_ADMIN_TOKEN` | Admin API 書込用トークン（商品作成・贈答注文の下書き作成に使用。要 `write_draft_orders` スコープ） | real 時 (POST/DELETE・贈答注文作成時) |
| `INSTAGRAM_BUSINESS_ID` | Instagram Graph API のビジネスID | real 時 |
| `INSTAGRAM_ACCESS_TOKEN` | 長期アクセストークン | real 時 |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API (Quick Post の broadcast 配信に使用) | LINE 配信時 |
| `LINE_CHANNEL_SECRET` | LINE Messaging API (将来 webhook 受信を実装する時用) | – |

`NEXT_PUBLIC_API_MODE` が未設定または `mock` のとき、Shopify/IG/LINE の呼び出しは
すべて `localStorage` 上のモックに向かいます（既定）。`real` に切替えると
`app/api/shopify/...`、`/api/instagram/...`、`/api/line/...` を経由して
本物の API に向かいます（未設定の env があれば自動で 503 を返してフロントに通知）。

## ディレクトリ構成

```
app/
  layout.jsx                  ルートレイアウト + メタデータ + フォント
  globals.css                 デザイントークン + impl shell
  public-site.css             公開サイトのスタイル
  admin.css                   管理画面のスタイル
  sitemap.js                  sitemap.xml 生成
  robots.js                   robots.txt 生成
  (public)/                   公開サイトの route group (URL に出ない)
    layout.jsx                AppBar + Footer + BottomNav + PriceCTA を全公開ページに付与
    page.jsx                  /
    products/page.jsx         /products
    products/[handle]/page.jsx /products/[handle] (SSG + generateMetadata)
    news/page.jsx             /news
    news/[id]/page.jsx        /news/[id]   (SSG + generateMetadata)
    price/page.jsx            /price
    shops/page.jsx            /shops
    agri/page.jsx             /agri
  admin/
    layout.jsx                SessionProvider
    page.jsx                  /admin
  api/
    auth/[...nextauth]/route.js  Auth.js handlers
    shopify/products/route.js    GET / POST → Storefront + Admin API
    shopify/products/[id]/route.js  DELETE → Admin API
  components/
    PublicSite.jsx            公開サイトのページ・セクションを named export
    AdminApp.jsx              管理コンソール
  lib/
    seed.js                   サーバ/クライアント共通の初期データ（SEO 用）
    auth.js                   ロール→ページ可否マッピング
    api/
      index.js                MikawaAPI 表面（adapter コンポーザ）
      store.js                localStorage バックボーン
      shopify.js / instagram.js / line.js  adapter 切替モジュール
      prices.js / news.js / shops.js / connections.js  ローカルロジック
      adapters/
        shopify-real.js       /api/shopify を叩く実装スタブ
        instagram-real.js     /api/instagram を叩く実装スタブ
        line-real.js          /api/line を叩く実装スタブ
auth.js                       Auth.js v5 設定（CredentialsProvider）
middleware.js                 production で /wireframes を 410
public/wireframes/            旧ワイヤーフレーム/デザインキャンバス
supabase/migrations/          価格テーブル等のスキーマ SQL（手動実行）
```

## Supabase セットアップ

すべてのアプリ用テーブルは **`hp` スキーマ** に置きます（社内 DX 統合用の名前空間分離）。

1. https://supabase.com/dashboard → **New project** で作成（free tier で十分）
2. **Project Settings → API** で URL と 2 つの key をメモ:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`（秘匿、サーバ専用）
3. **Project Settings → API → "Exposed schemas"** に `hp` を追加（`public, hp` のようにカンマ区切り）。
4. **SQL Editor → New query** で以下を順に Run:
   - `supabase/migrations/001_prices.sql` — `hp.prices` テーブル
   - `supabase/migrations/002_posts.sql` — `hp.posts` テーブル（お知らせ）
   - `supabase/migrations/003_products.sql` — `hp.products` テーブル
   - `supabase/migrations/004_storage.sql` — `post-images` Storage バケット（画像アップロード用、public）
   - `supabase/migrations/005_signature_product.sql` — 看板商品「大吟醸の奈良漬」
   - `supabase/migrations/006_product_images.sql` — `product-images` Storage バケット（商品画像用、public）
   - `supabase/migrations/007_shopify_sync.sql` — `variant_id` / `synced_at` カラム（Shopify 同期用）
   - `supabase/migrations/008_draft_orders.sql` — `hp.draft_orders` テーブル（贈答注文の送信ログ）
5. Vercel → Environment Variables に上記 3 つを追加 → **Redeploy**。
6. 動作確認:
   - `/admin → 価格管理` で値を変更 → `/price` で反映
   - `/admin → クイック投稿` で投稿 → `/news` で反映
   - `/admin → 商品管理` で編集 → `/products` で反映

### Shopify 商品同期

商品管理の「⇆ Shopify から同期」ボタンで、Shopify ストアの商品を `hp.products` に取り込みます。

1. Shopify 管理画面 → **アプリと販売チャネル → アプリ開発** → カスタムアプリを作成
2. **Storefront API** のアクセススコープで `unauthenticated_read_product_listings` を有効化してインストール
3. 発行された **Storefront API アクセストークン** をコピー
4. Vercel → Environment Variables に設定 → Redeploy:
   - `SHOPIFY_STORE_DOMAIN` = `mikawa2020.myshopify.com`
   - `SHOPIFY_STOREFRONT_TOKEN` = 手順3のトークン

同期の動作:
- **Shopify が勝つ項目**: 商品名・価格・説明・画像 (Shopify に featured image がある場合)・variant ID
- **こちらが勝つ項目**: 表示順 (position)・表示/非表示・単位・カテゴリ・画像トーン
- handle が一致する行同士を紐づけ。Shopify にだけある商品は末尾に新規追加、こちらにしかない商品 (ローカル専用) は触りません。
- 同期済み商品には管理画面で緑の「Shopify」バッジが付きます。
- variant ID が入った商品は、公開側の「カートに入れる」がカート直追加 URL (`/cart/{variant}:1`) に自動昇格します。

### 贈答注文作成（Shopify 下書き注文）

`/admin → 贈答注文作成` から、看板商品（カテゴリが「看板」の商品）を選んで送り主・送り先（複数可）を入力すると、送り先 1 件ごとに Shopify の**下書き注文**を自動作成します。決済・発送はされません。スタッフ・オーナーどちらのロールでも利用できます。

1. Shopify カスタムアプリ（商品同期で作成済みのものを流用可）→ **構成** タブ → **Admin API統合** の「構成」
2. アクセススコープで以下にチェック:
   - `write_draft_orders`（下書き注文の作成に必須）
   - `read_draft_orders`（任意、Shopify 管理画面での確認用）
3. 保存 → （再）インストール
4. **APIクレデンシャル** タブ → **Admin API アクセストークン** をコピー（`shpat_` から始まる文字列。この画面でしか表示されないので必ずこの時にコピーする）
5. Vercel → Environment Variables に設定 → Redeploy:
   - `SHOPIFY_ADMIN_TOKEN` = 手順4のトークン
   - `SHOPIFY_STORE_DOMAIN` は商品同期で設定済みのものを共用

動作:
- 送り先ごとに Shopify Admin API を順番に呼び出し（レート制限対策で約0.6秒間隔）、成功・失敗を `hp.draft_orders` に記録。一部の送り先が失敗しても他の送り先の処理は続行します。
- 商品が Shopify と同期済み（variant ID あり）ならその商品行で、ローカル専用商品ならカスタム明細（商品名・価格のみ）で下書き注文を作成します。
- 下書き注文の `billing_address` に送り主、`shipping_address` に送り先を設定（贈答で注文者と届け先が別人になる形をそのまま表現）。
- 画面下部に直近の送信履歴を表示（Shopify 管理画面への直リンク付き）。

### LINE 配信を有効にする

クイック投稿の「LINE 配信」を本物にするには:

1. https://developers.line.biz/ で LINE Developers コンソール
2. プロバイダ + Messaging API チャネルを作成（既存があればそれでOK）
3. **Channel access token (long-lived)** を発行
4. Vercel → Environment Variables に `LINE_CHANNEL_ACCESS_TOKEN` を追加して Redeploy

未設定でもクイック投稿自体は動作します（LINE 配信は `LINE_CHANNEL_ACCESS_TOKEN not set` 失敗として記録）。画像を添付すると text + image の 2 メッセージとして broadcast されます。

### Instagram 投稿について

現状未実装。Meta Graph API の `instagram_content_publish` 権限取得にはアプリレビューが必要で、運用負荷も大きいため、現バージョンでは Quick Post の Instagram チェックは「記録のみ」（社内向け配信予告のメモ）として動作します。実投稿は LINE/Instagram 公式アプリから手動で行ってください。

将来テーブルを増やす場合は `supabase/migrations/005_*.sql` のように追番し、同じく `hp` スキーマに作成してください。
