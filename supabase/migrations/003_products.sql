-- 003_products.sql
-- 商品マスタ。プロトタイプ期は Supabase に置き、本番では Shopify を主軸に
-- 差し替え予定（同じテーブルを Shopify からの同期キャッシュとして再利用可能）。

create table if not exists hp.products (
  id           text primary key,
  handle       text unique not null,        -- /products/[handle] の URL slug
  title        text not null,
  price_jpy    integer not null default 0,
  unit         text default '',
  category     text default '',
  description  text default '',
  img_tone     text default '',             -- green / orange / '' (default)
  image_url    text,                         -- 将来の Storage 経由画像
  position     integer not null default 0,
  visible      boolean not null default true,
  updated_at   timestamptz not null default now()
);

create index if not exists products_position_idx on hp.products (position);
create index if not exists products_handle_idx on hp.products (handle);

create or replace function hp.touch_products_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists products_touch_updated_at on hp.products;
create trigger products_touch_updated_at
  before update on hp.products
  for each row execute function hp.touch_products_updated_at();

alter table hp.products enable row level security;
drop policy if exists "anyone can read products" on hp.products;
create policy "anyone can read products" on hp.products
  for select using (visible = true);

grant select on hp.products to anon, authenticated;
grant all    on hp.products to service_role;

-- 初期データ (idempotent)
insert into hp.products (id, handle, title, price_jpy, unit, category, description, img_tone, position) values
  ('p-set',    'mikawa-set',    '岩国野菜の旬セット',   2480, '/ セット',   '看板',   '錦川流域の畑から、旬の野菜10品をバランスよく詰め合わせ。', 'green',  0),
  ('p-bento',  'yakult-bento',  'ヤクルト式 お弁当便',   650, '/ 1食〜',   '弁当',   '週替わりカタログから選べる、岩国エリア地域密着の弁当配達。', 'orange', 1),
  ('p-jam',    'farm-jam',      '農家のジャム',          880, '〜',        '加工品', '規格外野菜から生まれる、季節の保存食。',                  '',       2),
  ('p-pickle', 'farm-pickle',   '岩国の漬物三種',       1280, '/ 3袋',     '加工品', 'ベテラン農家直伝のレシピで仕込んだ手づくり漬物。',          '',       3),
  ('p-rice',   'mikawa-rice',   '岩国産の新米',         3680, '/ 5kg',     '穀物',   '錦川流域の契約農家から直送、棚田で育った特別栽培米。',     'green',  4),
  ('p-juice',  'tomato-juice',  '完熟トマトジュース',    980, '/ 720ml',   '加工品', '旬のトマトだけを贅沢に絞った無添加ジュース。',              'orange', 5)
on conflict (id) do nothing;
