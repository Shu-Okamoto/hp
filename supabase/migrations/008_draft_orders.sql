-- 008_draft_orders.sql
-- 贈答注文 (Shopify 下書き注文) の送信ログ。
--
-- 1 行 = 1 送り先。1 回のスタッフ操作で複数送り先を送信すると、同じ
-- batch_id を持つ行が複数作られる。Shopify 側の下書き注文 ID / URL /
-- エラー内容をここに記録し、失敗した送り先だけ個別に再送できるように
-- する。公開側からの読み取りは想定しないため anon への grant は無し
-- (service_role のみ)。

create table if not exists hp.draft_orders (
  id                    text primary key,
  batch_id              text not null,
  created_at            timestamptz not null default now(),
  created_by            text,

  product_handle        text not null,
  product_title         text not null,
  price_jpy             integer not null default 0,
  variant_id            text,
  quantity              integer not null default 1,

  sender_name           text,
  sender_phone          text,
  sender_email          text,

  recipient_name        text not null,
  recipient_zip         text,
  recipient_pref        text,
  recipient_city        text,
  recipient_address1    text,
  recipient_address2    text,
  recipient_phone       text,
  note                  text,

  status                text not null default 'pending', -- pending / success / error
  shopify_draft_order_id   text,
  shopify_draft_order_name text,
  shopify_draft_order_url  text,
  error_message          text,
  synced_at              timestamptz
);

create index if not exists draft_orders_batch_idx   on hp.draft_orders (batch_id);
create index if not exists draft_orders_created_idx on hp.draft_orders (created_at desc);

alter table hp.draft_orders enable row level security;
-- 公開 read ポリシーなし。service_role のみフル権限 (管理画面専用ツール)。
grant all on hp.draft_orders to service_role;
