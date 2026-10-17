-- 009_sender_address.sql
-- 贈答注文の送り主に住所情報を追加 (これまで名前・電話・メールのみ
-- だった)。請求書送付・のし返送先として住所が必要なケースに対応。

alter table hp.draft_orders add column if not exists sender_zip text;
alter table hp.draft_orders add column if not exists sender_pref text;
alter table hp.draft_orders add column if not exists sender_city text;
alter table hp.draft_orders add column if not exists sender_address1 text;
alter table hp.draft_orders add column if not exists sender_address2 text;
