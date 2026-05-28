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
| `SHOPIFY_ADMIN_TOKEN` | Admin API 書込用トークン | real 時 (POST/DELETE) |
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
5. Vercel → Environment Variables に上記 3 つを追加 → **Redeploy**。
6. 動作確認:
   - `/admin → 価格管理` で値を変更 → `/price` で反映
   - `/admin → クイック投稿` で投稿 → `/news` で反映
   - `/admin → 商品管理` で編集 → `/products` で反映

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
