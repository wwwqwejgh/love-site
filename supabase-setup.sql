create extension if not exists "pgcrypto";

create table if not exists public.love_notes (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(text) between 1 and 120),
  created_at timestamptz not null default now()
);

create table if not exists public.love_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text not null,
  caption text not null default '我们的照片',
  created_at timestamptz not null default now()
);

alter table public.love_notes enable row level security;
alter table public.love_photos enable row level security;

drop policy if exists "Anyone can read love notes" on public.love_notes;
drop policy if exists "Anyone can add love notes" on public.love_notes;
drop policy if exists "Anyone can read love photos" on public.love_photos;
drop policy if exists "Anyone can add love photos" on public.love_photos;

create policy "Anyone can read love notes"
on public.love_notes
for select
to anon
using (true);

create policy "Anyone can add love notes"
on public.love_notes
for insert
to anon
with check (char_length(text) between 1 and 120);

create policy "Anyone can read love photos"
on public.love_photos
for select
to anon
using (true);

create policy "Anyone can add love photos"
on public.love_photos
for insert
to anon
with check (image_url <> '' and storage_path <> '');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'love-photos',
  'love-photos',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can read love photo files" on storage.objects;
drop policy if exists "Anyone can upload love photo files" on storage.objects;

create policy "Anyone can read love photo files"
on storage.objects
for select
to anon
using (bucket_id = 'love-photos');

create policy "Anyone can upload love photo files"
on storage.objects
for insert
to anon
with check (bucket_id = 'love-photos');
