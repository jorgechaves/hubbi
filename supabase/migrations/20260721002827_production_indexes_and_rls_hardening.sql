-- Production hardening: indexes for application/RLS paths and safe admin lookup.

-- Foreign-key columns are not automatically indexed by PostgreSQL. These indexes
-- support the portal authorization paths and the administration screens.
create index if not exists user_groups_group_id_user_id_idx
  on public.user_groups (group_id, user_id);

create index if not exists group_panels_panel_id_group_id_idx
  on public.group_panels (panel_id, group_id);

create index if not exists group_panels_group_id_display_order_idx
  on public.group_panels (group_id, display_order);

create index if not exists access_logs_accessed_at_desc_idx
  on public.access_logs (accessed_at desc);

create index if not exists access_logs_user_id_idx
  on public.access_logs (user_id);

create index if not exists access_logs_panel_id_idx
  on public.access_logs (panel_id);

-- `is_admin` is used from RLS policies on `profiles` itself. It must bypass the
-- caller's RLS policies to avoid recursive policy evaluation. Keeping it in a
-- non-exposed schema limits it to database policy use instead of the Data API.
create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and active = true
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

-- The trigger function runs only through `auth.users`; it does not need to be
-- executable by API roles.
revoke all on function public.handle_new_user() from public;

alter policy "profiles: admin reads all" on public.profiles
  using ((select private.is_admin()));

alter policy "profiles: admin writes all" on public.profiles
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

alter policy "groups: user reads own groups" on public.groups
  using (
    exists (
      select 1 from public.user_groups ug
      where ug.group_id = id and ug.user_id = (select auth.uid())
    )
    or (select private.is_admin())
  );

alter policy "groups: admin writes" on public.groups
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

alter policy "user_groups: user reads own" on public.user_groups
  using (user_id = (select auth.uid()) or (select private.is_admin()));

alter policy "user_groups: admin writes" on public.user_groups
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

alter policy "panels: user reads accessible" on public.panels
  using (
    (active = true and exists (
      select 1
      from public.group_panels gp
      join public.user_groups ug on ug.group_id = gp.group_id
      where gp.panel_id = id and ug.user_id = (select auth.uid())
    ))
    or (select private.is_admin())
  );

alter policy "panels: admin writes" on public.panels
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

alter policy "group_panels: user reads accessible" on public.group_panels
  using (
    exists (
      select 1 from public.user_groups ug
      where ug.group_id = group_id and ug.user_id = (select auth.uid())
    )
    or (select private.is_admin())
  );

alter policy "group_panels: admin writes" on public.group_panels
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

alter policy "access_logs: admin reads" on public.access_logs
  using ((select private.is_admin()));

alter policy "portal_settings: admin writes" on public.portal_settings
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop function public.is_admin();
