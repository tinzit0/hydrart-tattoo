-- Hydrart Tattoo · ejecutar después de supabase-schema.sql.
insert into storage.buckets (id, name, public)
values ('tattoo-ideas', 'tattoo-ideas', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can upload tattoo files" on storage.objects;
create policy "Public can upload tattoo files" on storage.objects
for insert to anon, authenticated
with check (bucket_id = 'tattoo-ideas');

drop policy if exists "Public can read tattoo files" on storage.objects;
create policy "Public can read tattoo files" on storage.objects
for select to anon, authenticated
using (bucket_id = 'tattoo-ideas');
