-- 005_signature_product.sql
-- 看板商品「大吟醸の奈良漬」を hp.products に追加。
-- position は -10 で固定し、既存行 (position 0+) より確実に先頭表示。
-- ON CONFLICT で idempotent (何度実行しても同じ結果)。

insert into hp.products (id, handle, title, price_jpy, unit, category, description, img_tone, position) values
  ('p-narazuke', 'daiginjo-narazuke', '大吟醸の奈良漬', 3800, '/ 1袋', '看板',
   '大吟醸の酒粕で漬け重ねた、里の味みかわの看板商品。ご飯のお供・贈答・お酒の肴まで、長く愛されてきた里の味の代表作です。',
   '', -10)
on conflict (id) do nothing;

-- 既存行の description を新版に揃える場合は以下を別途実行 (任意):
-- update hp.products
--   set description = '大吟醸の酒粕で漬け重ねた、里の味みかわの看板商品。ご飯のお供・贈答・お酒の肴まで、長く愛されてきた里の味の代表作です。'
--   where id = 'p-narazuke';
