-- Estructura inicial del portal FABLAB INACAP Renca.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  year integer not null default extract(year from now()),
  excerpt text not null default '',
  image text not null,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  image text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.news enable row level security;
alter table public.admin_users enable row level security;
alter table public.settings enable row level security;

create policy "Published projects are public"
on public.projects for select
using (published = true);

create policy "Published news are public"
on public.news for select
using (published = true);

create policy "Admins manage projects"
on public.projects for all
to authenticated
using (exists (select 1 from public.admin_users where id = auth.uid()))
with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins manage news"
on public.news for all
to authenticated
using (exists (select 1 from public.admin_users where id = auth.uid()))
with check (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Users can read their admin profile"
on public.admin_users for select
to authenticated
using (id = auth.uid());

create policy "Admins manage settings"
on public.settings for all
to authenticated
using (exists (select 1 from public.admin_users where id = auth.uid()))
with check (exists (select 1 from public.admin_users where id = auth.uid()));
