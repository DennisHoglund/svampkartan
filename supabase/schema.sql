-- Svampkartan – databas i Supabase (delar projekt med Jaktvind)
-- Kör hela filen i Supabase: SQL Editor → New query → klistra in → Run.
-- Filen går att köra flera gånger.
--
-- Allt här har prefixet svamp_ (tabell, index, regler, bucket) och rör
-- inte Jaktvinds tabeller logg och platser.
--
-- Rättigheter: bara inloggade kommer åt något, och varje användare ser och
-- ändrar bara sina egna fynd och foton.

-- ---------------------------------------------------------------------------
-- Fynd
create table if not exists public.svamp_fynd (
  id           text primary key,                          -- skapas i appen, så fynd kan sparas offline först
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  funnen_at    timestamptz not null default now(),        -- när fyndet gjordes
  art          text not null,                             -- art-id, t.ex. 'kantarell', 'trattkantarell', 'karljohan'
  mangd        smallint not null default 3 check (mangd between 1 and 5),
  anteckning   text,
  lat          double precision not null check (lat between -90 and 90),
  lon          double precision not null check (lon between -180 and 180),
  noggrannhet  real,                                      -- GPS-noggrannhet i meter
  placerad     boolean not null default false,            -- true = placerad för hand på kartan
  foto_path    text,                                      -- sökväg i bucketen svamp-foton
  vader        jsonb,                                     -- t.ex. {"regn_10d": 18.4, "temp_snitt": 11.2}
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists svamp_fynd_user_t   on public.svamp_fynd (user_id, funnen_at desc);
create index if not exists svamp_fynd_user_art on public.svamp_fynd (user_id, art);

alter table public.svamp_fynd enable row level security;

drop policy if exists "svamp_fynd_select" on public.svamp_fynd;
drop policy if exists "svamp_fynd_insert" on public.svamp_fynd;
drop policy if exists "svamp_fynd_update" on public.svamp_fynd;
drop policy if exists "svamp_fynd_delete" on public.svamp_fynd;
create policy "svamp_fynd_select" on public.svamp_fynd for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "svamp_fynd_insert" on public.svamp_fynd for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "svamp_fynd_update" on public.svamp_fynd for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "svamp_fynd_delete" on public.svamp_fynd for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.svamp_fynd from anon;
grant select, insert, update, delete on public.svamp_fynd to authenticated;
grant select, insert, update, delete on public.svamp_fynd to service_role;

-- ---------------------------------------------------------------------------
-- Foton: privat bucket. Varje foto läggs under <user_id>/<fynd-id>.jpg
-- Appen krymper foton till ca 150–250 kB, så 1 GB räcker till flera tusen.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('svamp-foton', 'svamp-foton', false, 1048576,  -- max 1 MB per foto
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "svamp_foton_select" on storage.objects;
drop policy if exists "svamp_foton_insert" on storage.objects;
drop policy if exists "svamp_foton_update" on storage.objects;
drop policy if exists "svamp_foton_delete" on storage.objects;
create policy "svamp_foton_select" on storage.objects for select to authenticated
  using (bucket_id = 'svamp-foton' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "svamp_foton_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'svamp-foton' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "svamp_foton_update" on storage.objects for update to authenticated
  using (bucket_id = 'svamp-foton' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'svamp-foton' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "svamp_foton_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'svamp-foton' and (storage.foldername(name))[1] = (select auth.uid())::text);
