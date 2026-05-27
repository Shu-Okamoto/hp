# さとの味みかわ — 実装プロトタイプ

Next.js 14 (App Router) on Vercel.

## ローカル開発

```bash
npm install
npm run dev    # http://localhost:3000
```

`/` で公開サイト + 管理画面の切替ホスト、`/wireframes` で従来のワイヤーフレーム/設計キャンバスを表示。

## 本番ビルド

```bash
npm run build
npm start
```

## Vercel デプロイ

1. このリポジトリを Vercel で **New Project** から取り込む。
2. Framework Preset は自動で **Next.js** が選ばれる（追加設定不要）。
3. Build Command / Output Directory もデフォルトのままで OK。
4. Deploy。

> 環境変数は現状なし。Shopify / Instagram / LINE の実 API を差し込む際は
> `app/lib/mock-api.js` の関数シグネチャを保ったまま adapter 層を追加し、
> Vercel の Project Settings → Environment Variables にキーを登録する。

## ディレクトリ構成

```
app/
  layout.jsx          ルートレイアウト（フォント・グローバル CSS 読み込み）
  page.jsx            実装プロトタイプのホスト（公開サイト/管理画面の切替）
  globals.css         デザイントークン + impl shell + 基本リセット
  public-site.css     公開サイトのスタイル
  admin.css           管理画面のスタイル
  components/
    PublicSite.jsx    公開サイトのルートコンポーネント
    AdminApp.jsx      管理画面のルートコンポーネント
  lib/
    mock-api.js       Shopify / Instagram / LINE のモック API（localStorage 永続化）
public/
  wireframes/         旧ワイヤーフレーム/デザインキャンバスの静的ファイル一式
next.config.mjs       /wireframes → /wireframes/index.html のリライト設定
```
