-- Sky Icon security and accounting foundation

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  country_code text not null default 'YE',
  base_currency text not null default 'USD' references public.currencies(code),
  created_at timestamptz not null default now()
);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name_ar text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete restrict,
  name_ar text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ar text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  code text primary key,
  name_ar text not null,
  module text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_code text not null references public.permissions(code) on delete cascade,
  primary key (role_id, permission_code)
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role_id uuid references public.roles(id) on delete restrict,
  branch_id uuid references public.branches(id) on delete restrict,
  department_id uuid references public.departments(id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.chart_of_accounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ar text not null,
  account_type text not null check (account_type in ('asset','liability','equity','revenue','expense')),
  parent_id uuid references public.chart_of_accounts(id) on delete restrict,
  is_postable boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  entry_number text not null unique,
  entry_date date not null default current_date,
  description text not null,
  status text not null default 'draft' check (status in ('draft','posted','cancelled')),
  source_type text,
  source_id text,
  created_by uuid references auth.users(id) on delete set null,
  posted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.journal_lines (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid not null references public.journal_entries(id) on delete restrict,
  account_id uuid not null references public.chart_of_accounts(id) on delete restrict,
  currency_code text not null references public.currencies(code),
  amount_original numeric(18,2) not null check (amount_original >= 0),
  exchange_rate_to_usd numeric(24,10) not null check (exchange_rate_to_usd > 0),
  debit_usd numeric(18,2) not null default 0 check (debit_usd >= 0),
  credit_usd numeric(18,2) not null default 0 check (credit_usd >= 0),
  description text,
  check ((debit_usd = 0 and credit_usd > 0) or (credit_usd = 0 and debit_usd > 0))
);

create index if not exists audit_log_entity_idx on public.audit_log(entity_type, entity_id);
create index if not exists journal_lines_entry_idx on public.journal_lines(journal_entry_id);

insert into public.roles (code, name_ar, is_system) values
 ('platform_manager', 'مدير المنصة', true),
 ('branch_manager', 'مدير الفرع', true),
 ('accountant', 'محاسب', true),
 ('operations', 'تشغيل وحجوزات', true),
 ('viewer', 'مشاهد', true)
on conflict (code) do nothing;

insert into public.permissions (code, name_ar, module) values
 ('customers.read', 'عرض العملاء', 'customers'),
 ('customers.write', 'إدارة العملاء', 'customers'),
 ('bookings.read', 'عرض الحجوزات', 'bookings'),
 ('bookings.write', 'إدارة الحجوزات', 'bookings'),
 ('finance.read', 'عرض المالية', 'finance'),
 ('finance.post', 'اعتماد القيود', 'finance'),
 ('users.manage', 'إدارة المستخدمين والصلاحيات', 'security'),
 ('audit.read', 'عرض سجل التدقيق', 'security')
on conflict (code) do nothing;

alter table public.organizations enable row level security;
alter table public.branches enable row level security;
alter table public.departments enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_profiles enable row level security;
alter table public.audit_log enable row level security;
alter table public.chart_of_accounts enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_lines enable row level security;

-- Detailed policies are added after the application role helper is deployed.
-- Never expose service-role credentials in client-side code.
