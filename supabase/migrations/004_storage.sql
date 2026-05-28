-- 004_storage.sql
-- Quick Post の画像アップロード用の Storage バケット。
-- LINE Broadcast API は画像 URL を要求するので、公開バケットを用意して
-- そのまま参照させる構成にする。

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- public バケットなので RLS は形式的だが、アップロードはサーバ (service_role)
-- 経由のみに限定する: anon は SELECT のみ。
drop policy if exists "post-images public read" on storage.objects;
create policy "post-images public read" on storage.objects
  for select using (bucket_id = 'post-images');
