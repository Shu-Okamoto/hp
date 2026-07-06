-- 007_shopify_sync.sql
-- Shopify 同期用のカラムを hp.products に追加。
--   variant_id : Shopify の数値 variant ID。カート直追加 URL
--                (https://store/cart/{variant_id}:{qty}) に使用。
--   synced_at  : 最後に Shopify から同期した日時。NULL = ローカル専用商品。

alter table hp.products add column if not exists variant_id text;
alter table hp.products add column if not exists synced_at timestamptz;
