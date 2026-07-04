-- 006_product_images.sql
-- 商品画像アップロード用 Storage バケット。
-- Quick Post の post-images と同じパターン (public read + サーバ書き込み)。

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read" on storage.objects
  for select using (bucket_id = 'product-images');
