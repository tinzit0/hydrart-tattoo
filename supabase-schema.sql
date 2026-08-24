-- Ejecutar una vez en Supabase > SQL Editor.
create table if not exists public.hydrart_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.hydrart_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  booking_date date not null,
  booking_time time not null,
  client_name text not null,
  instagram text not null,
  phone text not null,
  email text,
  idea text not null,
  status text not null default 'pending' check (status in ('pending','reviewing','confirmed','cancelled')),
  created_at timestamptz not null default now()
);

create unique index if not exists hydrart_active_slot
on public.hydrart_bookings (booking_date, booking_time)
where status <> 'cancelled';

insert into public.hydrart_settings(key,value) values
('schedule','{"1":["10:00","14:00","17:00"],"2":["10:00","14:00","17:00"],"3":["10:00","14:00","17:00"],"4":["10:00","14:00","17:00"],"5":["10:00","14:00"],"6":["11:00","15:00"]}'::jsonb)
on conflict (key) do nothing;

alter table public.hydrart_settings enable row level security;
alter table public.hydrart_bookings enable row level security;

create policy "Public can read schedule" on public.hydrart_settings for select using (key='schedule');
create policy "Public can request booking" on public.hydrart_bookings for insert with check (status='pending');

create or replace function public.hydrart_public_availability(from_date date)
returns table (booking_date date, booking_time time, status text)
language sql security definer set search_path = public
as $$ select b.booking_date,b.booking_time,b.status from public.hydrart_bookings b where b.booking_date>=from_date and b.status<>'cancelled' $$;

create or replace function public.hydrart_lookup_booking(lookup_code text)
returns table (booking_date date, booking_time time, status text)
language sql security definer set search_path = public
as $$ select b.booking_date,b.booking_time,b.status from public.hydrart_bookings b where b.booking_code=upper(trim(lookup_code)) limit 1 $$;

revoke all on function public.hydrart_public_availability(date) from public;
revoke all on function public.hydrart_lookup_booking(text) from public;
grant execute on function public.hydrart_public_availability(date) to anon, authenticated;
grant execute on function public.hydrart_lookup_booking(text) to anon, authenticated;
