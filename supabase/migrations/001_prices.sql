-- 001_prices.sql
-- Initial schema for the 価格管理 feature. Run once in Supabase Dashboard
-- → SQL Editor (https://supabase.com/dashboard/project/_/sql/new).
--
-- After running, set the env vars in Vercel:
--   NEXT_PUBLIC_SUPABASE_URL       = your project URL
--   NEXT_PUBLIC_SUPABASE_ANON_KEY  = the anon (public) API key
--   SUPABASE_SERVICE_ROLE_KEY      = the service_role key (server-only)
-- and redeploy.

create table if not exists public.prices (
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

create index if not exists prices_position_idx on public.prices (position);

-- Keep updated_at fresh on every write.
create or replace function public.touch_prices_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists prices_touch_updated_at on public.prices;
create trigger prices_touch_updated_at
  before insert or update on public.prices
  for each row execute function public.touch_prices_updated_at();

-- RLS: anyone (anon, authenticated, public website visitors) can read the
-- price board; writes go through the service role from our API route,
-- which bypasses RLS entirely.
alter table public.prices enable row level security;

drop policy if exists "anyone can read prices" on public.prices;
create policy "anyone can read prices" on public.prices
  for select using (true);

-- Seed the initial rows from the prototype's seed data. ON CONFLICT keeps
-- this idempotent — re-running won't clobber edits the admin has made.
insert into public.prices (id, name, emoji, unit, price_jpy, featured, position) values
  ('v-tomato',  'トマト',       '🍅', '/ 1パック', 280, true,  0),
  ('v-cuc',     'きゅうり',     '🥒', '/ 3本',     120, false, 1),
  ('v-egg',     'なす',         '🍆', '/ 4本',     180, false, 2),
  ('v-corn',    'とうもろこし', '🌽', '/ 2本',     220, true,  3),
  ('v-greens',  '小松菜',       '🥬', '/ 1束',     150, false, 4),
  ('v-grape',   'ぶどう',       '🍇', '/ 1房',     680, false, 5),
  ('v-carrot',  'にんじん',     '🥕', '/ 3本',     130, false, 6),
  ('v-onion',   '玉ねぎ',       '🧅', '/ 2玉',     100, false, 7)
on conflict (id) do nothing;
