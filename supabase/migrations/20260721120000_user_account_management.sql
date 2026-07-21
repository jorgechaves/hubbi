-- Reserve a user deletion while serializing active-admin checks.
-- The Auth deletion happens immediately after this transaction in the server action.

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

  if target_role = 'admin' and target_active then
    select count(*)
      into active_admin_count
      from public.profiles
      where role = 'admin' and active = true;

    if active_admin_count <= 1 then
      raise exception using message = 'Não é possível excluir o último administrador ativo.';
    end if;
  end if;

  update public.profiles
    set active = false
    where public.profiles.id = target_user_id;

  return query select target_user_id, target_role, target_active;
end;
$$;

revoke all on function public.reserve_user_deletion(uuid, uuid) from public;
grant execute on function public.reserve_user_deletion(uuid, uuid) to service_role;
