-- CoWorker CRM - Database Rebuild (Supabase)
-- Run this in Supabase SQL Editor after a full wipe
-- This script creates tables, RLS policies, triggers and functions to support:
-- - Registration via Supabase Auth (auto-creates company, profile, membership)
-- - Multi-tenant access control via user_companies
-- - Core entities: companies, profiles, customers, contacts, products, quotes, quote_items, orders, order_items, tasks, notes

-----------------------------
-- 0) Extensions & Helpers  --
-----------------------------
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Helper: updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;$$;

-- Helper: safe text trim null-if-empty
create or replace function public.null_if_empty(text)
returns text language sql immutable as $$
  select case when length(trim($1)) = 0 then null else trim($1) end
$$;

----------------------------------
-- 1) Core tenancy and identity --
----------------------------------
-- Companies
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute procedure public.set_updated_at();

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Memberships
create type public.user_role as enum ('owner','admin','member');
create table public.user_companies (
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role public.user_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key(user_id, company_id)
);
create index user_companies_company_idx on public.user_companies(company_id);
create index user_companies_user_idx on public.user_companies(user_id);

-- Helper: check if current user is member of a company (created after user_companies exists)
create or replace function public.is_company_member(p_company_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.user_companies uc
    where uc.company_id = p_company_id
      and uc.user_id = auth.uid()
  );
$$;

----------------------------------
-- 2) Business entities         --
----------------------------------
-- Customers
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  billing_address jsonb,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_company_idx on public.customers(company_id);
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute procedure public.set_updated_at();

-- Contacts (standalone contacts for a company)
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  position text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contacts_company_idx on public.contacts(company_id);
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute procedure public.set_updated_at();

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  sku text,
  unit text default 'pcs',
  price numeric(12,2) not null default 0,
  currency text not null default 'SEK',
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_company_idx on public.products(company_id);
create trigger products_set_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- Quotes (Offers)
create type public.quote_status as enum ('draft','sent','accepted','declined');
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  status public.quote_status not null default 'draft',
  currency text not null default 'SEK',
  total_amount numeric(12,2) not null default 0,
  valid_until date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quotes_company_idx on public.quotes(company_id);
create index quotes_customer_idx on public.quotes(customer_id);
create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute procedure public.set_updated_at();

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0
);
create index quote_items_quote_idx on public.quote_items(quote_id);

-- Orders
create type public.order_status as enum ('draft','confirmed','shipped','completed','cancelled');
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  status public.order_status not null default 'draft',
  currency text not null default 'SEK',
  total_amount numeric(12,2) not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_company_idx on public.orders(company_id);
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0
);
create index order_items_order_idx on public.order_items(order_id);

-- Tasks
create type public.task_status as enum ('todo','in_progress','done');
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  due_date date,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_company_idx on public.tasks(company_id);
create index tasks_assigned_idx on public.tasks(assigned_to);
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

-- Notes (generic notes attached to an entity)
create type public.note_entity as enum ('customer','order','quote','task','company');
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  entity_type public.note_entity not null,
  entity_id uuid not null,
  body text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notes_company_idx on public.notes(company_id);
create index notes_entity_idx on public.notes(entity_type, entity_id);
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute procedure public.set_updated_at();

--------------------------------------------------
-- 3) RLS (Row Level Security) policies          --
--------------------------------------------------
-- Enable RLS
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.user_companies enable row level security;
alter table public.customers enable row level security;
alter table public.contacts enable row level security;
alter table public.products enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;

-- Companies: members can select; owners/admins can update/delete; any authenticated can insert (will be linked by trigger)
create policy companies_select on public.companies
  for select using (public.is_company_member(id));
create policy companies_insert on public.companies
  for insert to authenticated with check (true);
create policy companies_update on public.companies
  for update using (
    exists (
      select 1 from public.user_companies uc
      where uc.company_id = id and uc.user_id = auth.uid() and uc.role in ('owner','admin')
    )
  );
create policy companies_delete on public.companies
  for delete using (
    exists (
      select 1 from public.user_companies uc
      where uc.company_id = id and uc.user_id = auth.uid() and uc.role = 'owner'
    )
  );

-- Profiles: users can see/update their own profile
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid());
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid());
create policy profiles_insert_self on public.profiles
  for insert with check (id = auth.uid());

-- User companies: members can see; only owners/admins can insert/delete
create policy user_companies_select on public.user_companies
  for select using (
    user_id = auth.uid() or public.is_company_member(company_id)
  );
create policy user_companies_insert on public.user_companies
  for insert with check (
    exists (
      select 1 from public.user_companies uc
      where uc.company_id = company_id and uc.user_id = auth.uid() and uc.role in ('owner','admin')
    ) or user_id = auth.uid() -- allow self-link via triggers
  );
create policy user_companies_delete on public.user_companies
  for delete using (
    exists (
      select 1 from public.user_companies uc
      where uc.company_id = user_companies.company_id and uc.user_id = auth.uid() and uc.role in ('owner')
    )
  );

-- Generic multi-tenant CRUD for remaining tables: members of company can CRUD
-- Customers
create policy customers_all on public.customers
  for all using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));
-- Contacts
create policy contacts_all on public.contacts
  for all using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));
-- Products
create policy products_all on public.products
  for all using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));
-- Quotes
create policy quotes_all on public.quotes
  for all using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));
-- Quote items (inherit via quote)
create policy quote_items_select on public.quote_items
  for select using (
    exists (select 1 from public.quotes q where q.id = quote_id and public.is_company_member(q.company_id))
  );
create policy quote_items_mutate on public.quote_items
  for all using (
    exists (select 1 from public.quotes q where q.id = quote_id and public.is_company_member(q.company_id))
  ) with check (
    exists (select 1 from public.quotes q where q.id = quote_id and public.is_company_member(q.company_id))
  );
-- Orders
create policy orders_all on public.orders
  for all using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));
-- Order items (inherit via order)
create policy order_items_select on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and public.is_company_member(o.company_id))
  );
create policy order_items_mutate on public.order_items
  for all using (
    exists (select 1 from public.orders o where o.id = order_id and public.is_company_member(o.company_id))
  ) with check (
    exists (select 1 from public.orders o where o.id = order_id and public.is_company_member(o.company_id))
  );
-- Tasks
create policy tasks_all on public.tasks
  for all using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));
-- Notes
create policy notes_all on public.notes
  for all using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));

--------------------------------------------------
-- 4) Triggers for signup & company creation     --
--------------------------------------------------
-- On user signup: create profile, default company (if none), and membership
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_company_id uuid;
  v_full_name text;
  v_company_name text;
begin
  -- Extract metadata safely
  v_full_name := null_if_empty(coalesce(new.raw_user_meta_data->>'full_name', ''));
  v_company_name := null_if_empty(coalesce(new.raw_user_meta_data->>'company_name', ''));

  -- Create profile
  insert into public.profiles(id, full_name)
  values (new.id, v_full_name)
  on conflict (id) do nothing;

  -- Create a company if no name provided, generate one
  if v_company_name is null then
    v_company_name := 'Company of ' || coalesce(new.email, left(new.id::text, 8));
  end if;

  insert into public.companies(name) values (v_company_name)
  returning id into v_company_id;

  -- Link user as owner
  insert into public.user_companies(user_id, company_id, role)
  values (new.id, v_company_id, 'owner')
  on conflict do nothing;

  return new;
exception when others then
  -- Do not block signup if anything fails; just continue
  raise warning 'handle_new_user() warning: %', sqlerrm;
  return new;
end;$$;

-- Attach trigger to auth.users
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- When a user creates a new company via API, auto-link them as owner
create or replace function public.handle_company_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is not null then
    insert into public.user_companies(user_id, company_id, role)
    values (v_user, new.id, 'owner')
    on conflict do nothing;
  end if;
  return new;
end;$$;

create trigger on_company_created
after insert on public.companies
for each row execute procedure public.handle_company_insert();

--------------------------------------------------
-- 5) Grants (service_role bypasses RLS by design) --
--------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
-- Optional: allow anon select of nothing; all access governed by RLS above

-- Done
select 'Rebuild completed' as status;
