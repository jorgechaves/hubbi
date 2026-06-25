-- ============================================================
-- 001_initial_schema.sql — BI Hub Portal
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────

-- profiles: extends auth.users
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text not null default '',
  role        text not null default 'user' check (role in ('admin', 'user')),
  active      boolean not null default true,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- groups / profiles
create table if not exists public.groups (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  welcome_message text,
  created_at      timestamptz not null default now()
);

-- panels
create table if not exists public.panels (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  url         text not null,
  description text,
  icon        text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- group_panels: many-to-many with ordering
create table if not exists public.group_panels (
  group_id      uuid not null references public.groups(id) on delete cascade,
  panel_id      uuid not null references public.panels(id) on delete cascade,
  display_order integer not null default 0,
  primary key (group_id, panel_id)
);

-- user_groups: many-to-many
create table if not exists public.user_groups (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  group_id  uuid not null references public.groups(id) on delete cascade,
  primary key (user_id, group_id)
);

-- access_logs
create table if not exists public.access_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  panel_id    uuid not null references public.panels(id) on delete cascade,
  accessed_at timestamptz not null default now()
);

-- portal_settings (single-row table)
create table if not exists public.portal_settings (
  id            integer primary key default 1 check (id = 1),
  name          text not null default 'BI Hub',
  logo_url      text,
  primary_color text not null default '#2563EB',
  updated_at    timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- TRIGGER: auto-create profile on auth.users insert
-- ────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- HELPER: check if current user is admin
-- ────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
security invoker
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

alter table public.profiles       enable row level security;
alter table public.groups         enable row level security;
alter table public.panels         enable row level security;
alter table public.group_panels   enable row level security;
alter table public.user_groups    enable row level security;
alter table public.access_logs    enable row level security;
alter table public.portal_settings enable row level security;

-- profiles policies
create policy "profiles: user reads own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: admin reads all" on public.profiles
  for select to authenticated
  using (public.is_admin());

create policy "profiles: admin writes all" on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- groups policies
create policy "groups: user reads own groups" on public.groups
  for select to authenticated
  using (
    exists (
      select 1 from public.user_groups ug
      where ug.group_id = id and ug.user_id = (select auth.uid())
    )
    or public.is_admin()
  );

create policy "groups: admin writes" on public.groups
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- user_groups policies
create policy "user_groups: user reads own" on public.user_groups
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy "user_groups: admin writes" on public.user_groups
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- panels policies
create policy "panels: user reads accessible" on public.panels
  for select to authenticated
  using (
    active = true and (
      exists (
        select 1
        from public.group_panels gp
        join public.user_groups ug on ug.group_id = gp.group_id
        where gp.panel_id = id and ug.user_id = (select auth.uid())
      )
      or public.is_admin()
    )
  );

create policy "panels: admin writes" on public.panels
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- group_panels policies
create policy "group_panels: user reads accessible" on public.group_panels
  for select to authenticated
  using (
    exists (
      select 1 from public.user_groups ug
      where ug.group_id = group_id and ug.user_id = (select auth.uid())
    )
    or public.is_admin()
  );

create policy "group_panels: admin writes" on public.group_panels
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- access_logs policies (insert via service role only; admin reads)
create policy "access_logs: admin reads" on public.access_logs
  for select to authenticated
  using (public.is_admin());

-- portal_settings policies
create policy "portal_settings: all read" on public.portal_settings
  for select to authenticated
  using (true);

create policy "portal_settings: admin writes" on public.portal_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- GRANTS (expose to Data API)
-- ────────────────────────────────────────────────────────────

grant usage on schema public to anon, authenticated;
grant select on public.portal_settings to anon;
grant select, insert, update, delete on public.profiles       to authenticated;
grant select, insert, update, delete on public.groups         to authenticated;
grant select, insert, update, delete on public.panels         to authenticated;
grant select, insert, update, delete on public.group_panels   to authenticated;
grant select, insert, update, delete on public.user_groups    to authenticated;
grant select on public.access_logs to authenticated;

-- ────────────────────────────────────────────────────────────
-- DEFAULT DATA
-- ────────────────────────────────────────────────────────────

insert into public.portal_settings (id, name, primary_color)
values (1, 'BI Hub', '#2563EB')
on conflict (id) do nothing;
