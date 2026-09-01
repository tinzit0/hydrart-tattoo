-- Hydrart Tattoo · ejecutar una vez en Supabase Dashboard > SQL Editor.
create table if not exists public.hydrart_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.hydrart_bookings (
  id text primary key,
  date date not null,
  time text not null,
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  notes text default '',
  image_url text,
  payment_receipt_url text,
  status text not null default 'Pendiente de Comprobante',
  created_at timestamptz not null default now()
);

create table if not exists public.hydrart_quotes (
  id text primary key,
  client_name text not null,
  client_phone text not null,
  designs text not null default '',
  idea text not null default '',
  zone text not null default '',
  size text not null default '',
  style text not null default '',
  color text not null default '',
  status text not null default 'Nueva',
  created_at timestamptz not null default now()
);
alter table public.hydrart_quotes add column if not exists client_instagram text not null default '';

-- Migra sin borrar datos si ya existía el esquema anterior
-- (booking_date/booking_time, UUID y estados en inglés).
alter table public.hydrart_bookings add column if not exists date date;
alter table public.hydrart_bookings add column if not exists time text;
alter table public.hydrart_bookings add column if not exists client_email text;
alter table public.hydrart_bookings add column if not exists client_phone text;
alter table public.hydrart_bookings add column if not exists notes text default '';
alter table public.hydrart_bookings add column if not exists image_url text;
alter table public.hydrart_bookings add column if not exists payment_receipt_url text;

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='hydrart_bookings' and column_name='booking_date') then
    execute 'update public.hydrart_bookings set date = booking_date where date is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='hydrart_bookings' and column_name='booking_time') then
    execute 'update public.hydrart_bookings set time = booking_time::text where time is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='hydrart_bookings' and column_name='email') then
    execute 'update public.hydrart_bookings set client_email = email where client_email is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='hydrart_bookings' and column_name='phone') then
    execute 'update public.hydrart_bookings set client_phone = phone where client_phone is null';
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='hydrart_bookings' and column_name='idea') then
    execute $sql$update public.hydrart_bookings set notes = idea where coalesce(notes, '') = ''$sql$;
  end if;
end $$;

-- El frontend genera identificadores como RES-12345-abcd; por eso id debe ser texto.
alter table public.hydrart_bookings alter column id drop default;
alter table public.hydrart_bookings alter column id type text using id::text;
alter table public.hydrart_bookings alter column status set default 'Pendiente de Comprobante';

-- Las columnas obligatorias del esquema antiguo ya no forman parte del alta nueva.
do $$
declare legacy_column text;
begin
  foreach legacy_column in array array['booking_code','booking_date','booking_time','instagram','phone','email','idea'] loop
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='hydrart_bookings' and column_name=legacy_column) then
      execute format('alter table public.hydrart_bookings alter column %I drop not null', legacy_column);
    end if;
  end loop;
end $$;

-- Elimina únicamente checks antiguos de estados (pending/reviewing/etc.).
do $$
declare check_name text;
begin
  for check_name in
    select conname from pg_constraint
    where conrelid = 'public.hydrart_bookings'::regclass and contype = 'c'
  loop
    execute format('alter table public.hydrart_bookings drop constraint %I', check_name);
  end loop;
end $$;

drop index if exists public.hydrart_active_slot;
create unique index hydrart_active_slot on public.hydrart_bookings (date, time)
where status not like 'Cancelada%';

insert into public.hydrart_settings (key, value)
values ('main_config', '{"daySchedules":{},"blockedDates":[],"blockedReasons":{}}'::jsonb)
on conflict (key) do nothing;

alter table public.hydrart_settings enable row level security;
alter table public.hydrart_bookings enable row level security;
alter table public.hydrart_quotes enable row level security;

drop policy if exists "Hydrart public reads settings" on public.hydrart_settings;
drop policy if exists "Hydrart admin manages settings" on public.hydrart_settings;
drop policy if exists "Hydrart public reads bookings" on public.hydrart_bookings;
drop policy if exists "Hydrart public requests bookings" on public.hydrart_bookings;
drop policy if exists "Hydrart public updates booking flow" on public.hydrart_bookings;
drop policy if exists "Hydrart admin deletes bookings" on public.hydrart_bookings;
drop policy if exists "Hydrart public requests quotes" on public.hydrart_quotes;
drop policy if exists "Hydrart admin reads quotes" on public.hydrart_quotes;
drop policy if exists "Hydrart admin updates quotes" on public.hydrart_quotes;
drop policy if exists "Hydrart admin deletes quotes" on public.hydrart_quotes;

create policy "Hydrart public reads settings" on public.hydrart_settings for select to anon, authenticated using (true);
create policy "Hydrart admin manages settings" on public.hydrart_settings for all to authenticated
using ((auth.jwt() ->> 'email') = 'claudia.medel@gmail.com')
with check ((auth.jwt() ->> 'email') = 'claudia.medel@gmail.com');

create policy "Hydrart public reads bookings" on public.hydrart_bookings for select to anon, authenticated using (true);
create policy "Hydrart public requests bookings" on public.hydrart_bookings for insert to anon, authenticated with check (true);
create policy "Hydrart public updates booking flow" on public.hydrart_bookings for update to anon, authenticated using (true) with check (true);
create policy "Hydrart admin deletes bookings" on public.hydrart_bookings for delete to authenticated
using ((auth.jwt() ->> 'email') = 'claudia.medel@gmail.com');
create policy "Hydrart public requests quotes" on public.hydrart_quotes for insert to anon, authenticated with check (true);
create policy "Hydrart admin reads quotes" on public.hydrart_quotes for select to authenticated
using ((auth.jwt() ->> 'email') = 'claudia.medel@gmail.com');
create policy "Hydrart admin updates quotes" on public.hydrart_quotes for update to authenticated
using ((auth.jwt() ->> 'email') = 'claudia.medel@gmail.com') with check ((auth.jwt() ->> 'email') = 'claudia.medel@gmail.com');
create policy "Hydrart admin deletes quotes" on public.hydrart_quotes for delete to authenticated
using ((auth.jwt() ->> 'email') = 'claudia.medel@gmail.com');

do $$ begin
  alter publication supabase_realtime add table public.hydrart_settings;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.hydrart_bookings;
exception when duplicate_object then null; end $$;
