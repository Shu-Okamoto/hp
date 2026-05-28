-- 001_prices.sql
-- Schema: hp（社内 DX のスキーマ分離方針に合わせる）
--
-- ⚠️ 実行前に: Supabase Dashboard → Project Settings → API →
--   "Exposed schemas" に `hp` を追加してください（`public, hp` のように）。
--   PostgREST が hp スキーマを認識しないと、anon クライアントからの
--   `.from("prices")` が 404 になります。
--
-- 実行手順:
--   1. Supabase Dashboard → SQL Editor → New query
--   2. このファイルの内容を貼り付けて Run
--   3. Project Settings → API で Exposed schemas に `hp` を追加
--   4. Vercel に NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
--      / SUPABASE_SERVICE_ROLE_KEY を設定して Redeploy

-- 1. スキーマ + ロール権限 -----------------------------------------------------
create schema if not exists hp;

-- PostgREST が hp 配下を走査できるようにする
grant usage on schema hp to anon, authenticated, service_role;

-- 2. prices テーブル ----------------------------------------------------------
create table if not exists hp.prices (
  id          text primary key,
  name        text not null,
  emoji       text default '🥬',
  unit        text default '',
  price_jpy   integer not null default 0,
  visible     boolean not null default true,
  featured    boolean not null default false,
  position    integer not null default 0,
  updated_at  timestamptz not null default now()
);

create index if not exists prices_position_idx on hp.prices (position);

-- updated_at を書き込みごとに自動更新
create or replace function hp.touch_prices_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists prices_touch_updated_at on hp.prices;
create trigger prices_touch_updated_at
  before insert or update on hp.prices
  for each row execute function hp.touch_prices_updated_at();

-- 3. RLS と権限 ---------------------------------------------------------------
alter table hp.prices enable row level security;

drop policy if exists "anyone can read prices" on hp.prices;
create policy "anyone can read prices" on hp.prices
  for select using (true);

-- anon / authenticated は SELECT のみ。書き込みは service_role 経由 (RLS バイパス)。
grant select on hp.prices to anon, authenticated;
grant all    on hp.prices to service_role;

-- 4. 初期データ（idempotent — 既存行があれば触らない）-----------------------
insert into hp.prices (id, name, emoji, unit, price_jpy, featured, position) values
  ('v-tomato',  'トマト',       '🍅', '/ 1パック', 280, true,  0),
  ('v-cuc',     'きゅうり',     '🥒', '/ 3本',     120, false, 1),
  ('v-egg',     'なす',         '🍆', '/ 4本',     180, false, 2),
  ('v-corn',    'とうもろこし', '🌽', '/ 2本',     220, true,  3),
  ('v-greens',  '小松菜',       '🥬', '/ 1束',     150, false, 4),
  ('v-grape',   'ぶどう',       '🍇', '/ 1房',     680, false, 5),
  ('v-carrot',  'にんじん',     '🥕', '/ 3本',     130, false, 6),
  ('v-onion',   '玉ねぎ',       '🧅', '/ 2玉',     100, false, 7)
on conflict (id) do nothing;
