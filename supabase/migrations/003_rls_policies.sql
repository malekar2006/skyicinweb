-- Sky Icon RLS policies
-- Requires 001_initial_schema.sql and 002_security_accounting.sql.
-- The browser must use only the anon key; service_role remains server-side.

create or replace function public.current_user_can(required_permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles up
    join public.role_permissions rp on rp.role_id = up.role_id
    join public.roles r on r.id = up.role_id
    where up.user_id = auth.uid()
      and up.is_active = true
      and (r.code = 'platform_manager' or rp.permission_code = required_permission)
  );
$$;

revoke all on function public.current_user_can(text) from public;
grant execute on function public.current_user_can(text) to authenticated;

-- Keep policy creation repeatable during development.
drop policy if exists currencies_authenticated_read on public.currencies;
create policy currencies_authenticated_read
  on public.currencies for select to authenticated
  using (is_enabled = true or public.current_user_can('finance.read'));

drop policy if exists exchange_rates_authenticated_read on public.exchange_rates;
create policy exchange_rates_authenticated_read
  on public.exchange_rates for select to authenticated
  using (true);

drop policy if exists exchange_rates_finance_write on public.exchange_rates;
create policy exchange_rates_finance_write
  on public.exchange_rates for all to authenticated
  using (public.current_user_can('finance.post'))
  with check (public.current_user_can('finance.post') and (created_by is null or created_by = auth.uid()));

-- Organization structure is readable to active users; changes are restricted.
drop policy if exists organizations_authenticated_read on public.organizations;
create policy organizations_authenticated_read
  on public.organizations for select to authenticated
  using (exists (select 1 from public.user_profiles up where up.user_id = auth.uid() and up.is_active));

drop policy if exists branches_authenticated_read on public.branches;
create policy branches_authenticated_read
  on public.branches for select to authenticated
  using (exists (select 1 from public.user_profiles up where up.user_id = auth.uid() and up.is_active and (up.branch_id = id or public.current_user_can('users.manage'))));

drop policy if exists departments_authenticated_read on public.departments;
create policy departments_authenticated_read
  on public.departments for select to authenticated
  using (exists (select 1 from public.user_profiles up where up.user_id = auth.uid() and up.is_active and (up.department_id = id or public.current_user_can('users.manage'))));

drop policy if exists roles_authenticated_read on public.roles;
create policy roles_authenticated_read
  on public.roles for select to authenticated
  using (exists (select 1 from public.user_profiles up where up.user_id = auth.uid() and up.is_active));

drop policy if exists permissions_authenticated_read on public.permissions;
create policy permissions_authenticated_read
  on public.permissions for select to authenticated
  using (exists (select 1 from public.user_profiles up where up.user_id = auth.uid() and up.is_active));

drop policy if exists role_permissions_authenticated_read on public.role_permissions;
create policy role_permissions_authenticated_read
  on public.role_permissions for select to authenticated
  using (exists (select 1 from public.user_profiles up where up.user_id = auth.uid() and up.is_active));

-- A user can read their own profile. Managers can read all profiles.
drop policy if exists user_profiles_self_read on public.user_profiles;
create policy user_profiles_self_read
  on public.user_profiles for select to authenticated
  using (user_id = auth.uid() or public.current_user_can('users.manage'));

drop policy if exists user_profiles_manager_write on public.user_profiles;
create policy user_profiles_manager_write
  on public.user_profiles for all to authenticated
  using (public.current_user_can('users.manage'))
  with check (public.current_user_can('users.manage'));

-- Customers and services are shared within the organization for active users.
drop policy if exists customers_active_read on public.customers;
create policy customers_active_read
  on public.customers for select to authenticated
  using (exists (select 1 from public.user_profiles up where up.user_id = auth.uid() and up.is_active));

drop policy if exists customers_active_insert on public.customers;
create policy customers_active_insert
  on public.customers for insert to authenticated
  with check (created_by = auth.uid() and public.current_user_can('customers.write'));

drop policy if exists customers_owner_update on public.customers;
create policy customers_owner_update
  on public.customers for update to authenticated
  using (created_by = auth.uid() or public.current_user_can('customers.write'))
  with check (created_by = auth.uid() or public.current_user_can('customers.write'));

drop policy if exists customers_manager_delete on public.customers;
create policy customers_manager_delete
  on public.customers for delete to authenticated
  using (public.current_user_can('customers.write'));

drop policy if exists services_active_read on public.services;
create policy services_active_read
  on public.services for select to authenticated
  using (is_active = true or public.current_user_can('bookings.write'));

drop policy if exists services_manager_write on public.services;
create policy services_manager_write
  on public.services for all to authenticated
  using (public.current_user_can('bookings.write'))
  with check (public.current_user_can('bookings.write') and (created_by is null or created_by = auth.uid()));

-- Bookings are readable to active users; creation and changes require booking permission.
drop policy if exists bookings_active_read on public.bookings;
create policy bookings_active_read
  on public.bookings for select to authenticated
  using (exists (select 1 from public.user_profiles up where up.user_id = auth.uid() and up.is_active));

drop policy if exists bookings_write on public.bookings;
create policy bookings_write
  on public.bookings for all to authenticated
  using (public.current_user_can('bookings.write'))
  with check (public.current_user_can('bookings.write') and (created_by is null or created_by = auth.uid()));

-- Accounting data is restricted to finance permissions.
drop policy if exists audit_log_read on public.audit_log;
create policy audit_log_read
  on public.audit_log for select to authenticated
  using (public.current_user_can('audit.read'));

drop policy if exists chart_of_accounts_read on public.chart_of_accounts;
create policy chart_of_accounts_read
  on public.chart_of_accounts for select to authenticated
  using (public.current_user_can('finance.read'));

drop policy if exists chart_of_accounts_write on public.chart_of_accounts;
create policy chart_of_accounts_write
  on public.chart_of_accounts for all to authenticated
  using (public.current_user_can('finance.post'))
  with check (public.current_user_can('finance.post'));

drop policy if exists journal_entries_finance on public.journal_entries;
create policy journal_entries_finance
  on public.journal_entries for all to authenticated
  using (public.current_user_can('finance.post') or public.current_user_can('finance.read'))
  with check (public.current_user_can('finance.post'));

drop policy if exists journal_lines_finance on public.journal_lines;
create policy journal_lines_finance
  on public.journal_lines for all to authenticated
  using (public.current_user_can('finance.post') or public.current_user_can('finance.read'))
  with check (public.current_user_can('finance.post'));

-- No anonymous access to business tables.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
