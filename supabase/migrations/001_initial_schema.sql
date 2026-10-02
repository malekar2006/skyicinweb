-- Sky Icon initial cloud schema
-- Base currency: USD. Run after creating a Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.currencies (
  code text primary key check (code = upper(code) and length(code) = 3),
  name_ar text not null,
  is_base boolean not null default false,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists one_base_currency on public.currencies (is_base) where is_base;

insert into public.currencies (code, name_ar, is_base)
values
  ('USD', 'الدولار الأمريكي', true),
  ('YER', 'الريال اليمني', false),
  ('SAR', 'الريال السعودي', false)
on conflict (code) do update set name_ar = excluded.name_ar, is_base = excluded.is_base;

create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  from_currency text not null references public.currencies(code),
  to_currency text not null references public.currencies(code),
  rate numeric(24,10) not null check (rate > 0),
  effective_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (from_currency, to_currency, effective_at)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  customer_type text not null default 'individual' check (customer_type in ('individual','family','group','company','agent')),
  full_name text not null,
  phone text,
  email text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  service_type text not null check (service_type in ('tourism','hajj','umrah','hotel','transport','visa','insurance','other')),
  name_ar text not null,
  description_ar text,
  base_price numeric(18,2) not null default 0 check (base_price >= 0),
  currency_code text not null default 'USD' references public.currencies(code),
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_id uuid not null references public.customers(id),
  service_id uuid references public.services(id),
  status text not null default 'draft' check (status in ('draft','quote','awaiting_deposit','confirmed','in_execution','completed','cancelled','partially_refunded','fully_refunded','stalled')),
  travel_date date,
  total_amount numeric(18,2) not null default 0 check (total_amount >= 0),
  currency_code text not null default 'USD' references public.currencies(code),
  exchange_rate_to_usd numeric(24,10) not null default 1 check (exchange_rate_to_usd > 0),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_customer_idx on public.bookings(customer_id);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_travel_date_idx on public.bookings(travel_date);

alter table public.currencies enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.customers enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

-- Policies are intentionally added in the application-security phase after roles are defined.
-- Do not expose service-role credentials in the browser.
