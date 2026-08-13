-- Reserve a user deletion while serializing active-admin checks.
-- The Auth deletion happens immediately after this transaction in the server action.

create schema if not exists private;

create table if not exists private.user_deletion_reservations (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  was_active boolean not null,
  reserved_at timestamptz not null default now()
);

revoke all on table private.user_deletion_reservations from public;

create or replace function public.reserve_user_deletion(
  target_user_id uuid,
  current_user_id uuid
)
returns table (id uuid, role text, was_active boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_role text;
  target_active boolean;
  active_admin_count bigint;
  reserved_was_active boolean;
begin
  if target_user_id = current_user_id then
    raise exception using message = 'Você não pode excluir a própria conta.';
  end if;

  -- portal_settings is the singleton lock used to serialize destructive user actions.
  perform 1
    from public.portal_settings
    where public.portal_settings.id = 1
    for update;

  if not found then
    raise exception using message = 'Configuração do portal não encontrada.';
  end if;

  select p.role, p.active
    into target_role, target_active
    from public.profiles p
    where p.id = target_user_id
    for update;

  if not found then
    return;
  end if;

  select r.was_active
    into reserved_was_active
    from private.user_deletion_reservations r
    where r.user_id = target_user_id
    for update;

  if found then
    raise exception using message = 'Este usuário já está em processo de exclusão.';
  end if;

  if target_role = 'admin' and target_active then
    select count(*)
      into active_admin_count
      from public.profiles
      where role = 'admin' and active = true;

    if active_admin_count <= 1 then
      raise exception using message = 'Não é possível excluir o último administrador ativo.';
    end if;
  end if;

  insert into private.user_deletion_reservations (user_id, was_active)
    values (target_user_id, target_active);

  update public.profiles
    set active = false
    where public.profiles.id = target_user_id;

  return query select target_user_id, target_role, target_active;
end;
$$;

revoke all on function public.reserve_user_deletion(uuid, uuid) from public;
grant execute on function public.reserve_user_deletion(uuid, uuid) to service_role;

create or replace function public.release_user_deletion(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  reserved_was_active boolean;
begin
  perform 1
    from public.portal_settings
    where public.portal_settings.id = 1
    for update;

  select r.was_active
    into reserved_was_active
    from private.user_deletion_reservations r
    where r.user_id = target_user_id
    for update;

  if not found then
    return;
  end if;

  delete from private.user_deletion_reservations
    where user_id = target_user_id;

  if reserved_was_active then
    update public.profiles
      set active = true
      where public.profiles.id = target_user_id
        and public.profiles.active = false;
  end if;
end;
$$;

revoke all on function public.release_user_deletion(uuid) from public;
grant execute on function public.release_user_deletion(uuid) to service_role;

create or replace function public.update_user_profile_and_groups_guarded(
  target_user_id uuid,
  new_name text,
  new_role text,
  new_active boolean,
  new_group_ids uuid[]
)
returns table (id uuid, role text, active boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_role text;
  current_active boolean;
  active_admin_count bigint;
begin
  perform 1
    from public.portal_settings
    where public.portal_settings.id = 1
    for update;

  if not found then
    raise exception using message = 'Configuração do portal não encontrada.';
  end if;

  select p.role, p.active
    into current_role, current_active
    from public.profiles p
    where p.id = target_user_id
    for update;

  if not found then
    return;
  end if;

  if exists (
    select 1
      from private.user_deletion_reservations r
      where r.user_id = target_user_id
  ) then
    raise exception using message = 'Este usuário está em processo de exclusão.';
  end if;

  if current_role = 'admin'
     and current_active
     and (new_role <> 'admin' or not new_active) then
    select count(*)
      into active_admin_count
      from public.profiles
      where role = 'admin' and active = true;

    if active_admin_count <= 1 then
      raise exception using message = 'Não é possível remover o último administrador ativo.';
    end if;
  end if;

  update public.profiles
    set name = new_name,
        role = new_role,
        active = new_active
    where public.profiles.id = target_user_id;

  delete from public.user_groups
    where public.user_groups.user_id = target_user_id;

  if coalesce(array_length(new_group_ids, 1), 0) > 0 then
    insert into public.user_groups (user_id, group_id)
      select target_user_id, groups.group_id
      from unnest(new_group_ids) as groups(group_id);
  end if;

  return query select target_user_id, new_role, new_active;
end;
$$;

revoke all on function public.update_user_profile_and_groups_guarded(uuid, text, text, boolean, uuid[]) from public;
grant execute on function public.update_user_profile_and_groups_guarded(uuid, text, text, boolean, uuid[]) to service_role;
