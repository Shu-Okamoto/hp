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
| `SHOPIFY_STORE_DOMAIN` | `*.myshopify.com` | real 時 |
| `SHOPIFY_STOREFRONT_TOKEN` | Storefront API 読み取り用トークン | real 時 |
| `SHOPIFY_ADMIN_TOKEN` | Admin API 書込用トークン | real 時 (POST/DELETE) |
| `INSTAGRAM_BUSINESS_ID` | Instagram Graph API のビジネスID | real 時 |
| `INSTAGRAM_ACCESS_TOKEN` | 長期アクセストークン | real 時 |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API | real 時 |
| `LINE_CHANNEL_SECRET` | LINE Messaging API | real 時 |

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
```
