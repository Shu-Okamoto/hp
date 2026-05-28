-- 002_posts.sql
-- お知らせ・SNS 投稿テーブル。Quick Post / News Manager / 公開 /news が共有。
--
-- 実行手順:
--   1. SQL Editor で本ファイルの内容を Run
--   2. Project Settings → API → Exposed schemas に hp が入っていることを確認

create table if not exists hp.posts (
  id          text primary key,
  date        date not null default current_date,
  source      text not null default 'news',   -- ig / line / event / news / web
  title       text not null,
  body        text default '',
  emoji       text default '📣',
  ig_handle   text,
  image_url   text,                            -- Supabase Storage 上の公開 URL
  channels    text[] not null default '{web}', -- 配信先タグ (web/line/ig)
  archived    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists posts_date_idx on hp.posts (date desc);
create index if not exists posts_archived_idx on hp.posts (archived);

create or replace function hp.touch_posts_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists posts_touch_updated_at on hp.posts;
create trigger posts_touch_updated_at
  before update on hp.posts
  for each row execute function hp.touch_posts_updated_at();

alter table hp.posts enable row level security;
drop policy if exists "anyone can read posts" on hp.posts;
create policy "anyone can read posts" on hp.posts
  for select using (archived = false);

grant select on hp.posts to anon, authenticated;
grant all    on hp.posts to service_role;

-- 初期データ (idempotent)
insert into hp.posts (id, source, title, body, emoji, ig_handle, channels) values
  ('n-001', 'ig',    '今日のストーリー更新しました',     'Instagramのストーリーを更新しました。畑からの今日の様子・本日の入荷をぜひご覧ください。',                              '📸', '@satonoajimikawa', '{ig,web}'),
  ('n-002', 'line',  '週末の広告アップしました',         '週末の特売チラシを公式LINEで配信しました。LINEご登録のうえ、お得情報をいち早く受け取ってください。',                  '🎁', null,                '{line,web}'),
  ('n-003', 'event', '5月『畑の収穫体験』参加者募集中',   '農家のおじちゃんと一緒に、畑で野菜を収穫する半日体験。お子さま参加歓迎。',                                              '🌱', null,                '{web}'),
  ('n-004', 'news',  'GW営業時間のお知らせ',              'GW期間の営業時間をご案内します。5/3-5/6は通常営業、5/7のみ臨時休業させていただきます。',                              '📅', null,                '{web,line}')
on conflict (id) do nothing;
