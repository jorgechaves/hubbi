'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/security/admin'
import {
  actionErrorMessage,
  getOptionalString,
  getRequiredString,
  parseBoolean,
  parseHttpUrl,
  parseRole,
  parseUuid,
  parseUuidList,
} from '@/lib/security/forms'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function parseInput<T>(parser: () => T): { data: T; error?: never } | { data?: never; error: string } {
  try {
    return { data: parser() }
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }
}

// ─── Users ────────────────────────────────────────────────────

export async function createUser(formData: FormData) {
  try {
    await requireAdmin()
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  const parsed = parseInput(() => ({
    email: getRequiredString(formData, 'email', 'Email', { max: 320 }),
    password: getRequiredString(formData, 'password', 'Senha temporária', { max: 256 }),
    name: getRequiredString(formData, 'name', 'Nome', { max: 120 }),
    role: parseRole(formData.get('role')),
    groupIds: parseUuidList(formData.getAll('group_ids'), 'Grupos'),
  }))
  if ('error' in parsed) return { error: parsed.error }

  const service = getServiceClient()
  const { email, password, name, role, groupIds } = parsed.data

  if (password.length < 8) {
    return { error: 'A senha temporária deve ter no mínimo 8 caracteres.' }
  }

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (error) return { error: error.message }

  const userId = data.user.id

  const rollbackCreatedUser = async (message: string) => {
    await service.auth.admin.deleteUser(userId)
    return { error: message }
  }

  const { error: profileError } = await service.from('profiles').update({ role, name }).eq('id', userId)
  if (profileError) return rollbackCreatedUser(profileError.message)

  if (groupIds.length > 0) {
    const { error: groupsError } = await service.from('user_groups').insert(
      groupIds.map(gid => ({ user_id: userId, group_id: gid }))
    )
    if (groupsError) return rollbackCreatedUser(groupsError.message)
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUser(userId: string, formData: FormData) {
  try {
    await requireAdmin()
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  const service = getServiceClient()
  const parsed = parseInput(() => ({
    safeUserId: parseUuid(userId, 'Usuário'),
    name: getRequiredString(formData, 'name', 'Nome', { max: 120 }),
    role: parseRole(formData.get('role')),
    active: parseBoolean(formData.get('active'), 'Status'),
    groupIds: parseUuidList(formData.getAll('group_ids'), 'Grupos'),
  }))
  if ('error' in parsed) return { error: parsed.error }
  const { safeUserId, name, role, active, groupIds } = parsed.data

  const { error: profileError } = await service
    .from('profiles')
    .update({ name, role, active })
    .eq('id', safeUserId)
  if (profileError) return { error: profileError.message }

  const { error: deleteGroupsError } = await service.from('user_groups').delete().eq('user_id', safeUserId)
  if (deleteGroupsError) return { error: deleteGroupsError.message }
  if (groupIds.length > 0) {
    const { error: insertGroupsError } = await service.from('user_groups').insert(
      groupIds.map(gid => ({ user_id: safeUserId, group_id: gid }))
    )
    if (insertGroupsError) return { error: insertGroupsError.message }
  }

  if (!active) {
    const { error: signOutError } = await service.auth.admin.signOut(safeUserId, 'global')
    if (signOutError) return { error: signOutError.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

// ─── Groups ───────────────────────────────────────────────────

export async function createGroup(formData: FormData) {
  let context: Awaited<ReturnType<typeof requireAdmin>>
  try {
    context = await requireAdmin()
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  const { supabase } = context

  const parsed = parseInput(() => ({
    name: getRequiredString(formData, 'name', 'Nome', { max: 120 }),
    description: getOptionalString(formData, 'description', 'Descrição', { max: 240 }),
    welcome_message: getOptionalString(formData, 'welcome_message', 'Mensagem de boas-vindas', { max: 2000 }),
  }))
  if ('error' in parsed) return { error: parsed.error }

  const { error } = await supabase.from('groups').insert(parsed.data)

  if (error) return { error: error.message }
  revalidatePath('/admin/groups')
  return { success: true }
}

export async function updateGroup(groupId: string, formData: FormData) {
  let context: Awaited<ReturnType<typeof requireAdmin>>
  try {
    context = await requireAdmin()
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  const { supabase } = context
  const parsed = parseInput(() => ({
    safeGroupId: parseUuid(groupId, 'Grupo'),
    values: {
      name: getRequiredString(formData, 'name', 'Nome', { max: 120 }),
      description: getOptionalString(formData, 'description', 'Descrição', { max: 240 }),
      welcome_message: getOptionalString(formData, 'welcome_message', 'Mensagem de boas-vindas', { max: 2000 }),
    },
  }))
  if ('error' in parsed) return { error: parsed.error }

  const { error } = await supabase.from('groups').update(parsed.data.values).eq('id', parsed.data.safeGroupId)

  if (error) return { error: error.message }
  revalidatePath('/admin/groups')
  return { success: true }
}

export async function deleteGroup(groupId: string) {
  let context: Awaited<ReturnType<typeof requireAdmin>>
  try {
    context = await requireAdmin()
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  const { supabase } = context
  const parsed = parseInput(() => parseUuid(groupId, 'Grupo'))
  if ('error' in parsed) return { error: parsed.error }
  const { error } = await supabase.from('groups').delete().eq('id', parsed.data)
  if (error) return { error: error.message }
  revalidatePath('/admin/groups')
  return { success: true }
}

export async function updateGroupPanels(groupId: string, panelIds: string[]) {
  let context: Awaited<ReturnType<typeof requireAdmin>>
  try {
    context = await requireAdmin()
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  const { supabase } = context
  const parsed = parseInput(() => ({
    safeGroupId: parseUuid(groupId, 'Grupo'),
    safePanelIds: parseUuidList(panelIds, 'Painéis'),
  }))
  if ('error' in parsed) return { error: parsed.error }
  const { safeGroupId, safePanelIds } = parsed.data
  const { error: deleteError } = await supabase.from('group_panels').delete().eq('group_id', safeGroupId)
  if (deleteError) return { error: deleteError.message }
  if (safePanelIds.length > 0) {
    const { error: insertError } = await supabase.from('group_panels').insert(
      safePanelIds.map((pid, i) => ({ group_id: safeGroupId, panel_id: pid, display_order: i }))
    )
    if (insertError) return { error: insertError.message }
  }
  revalidatePath('/admin/groups')
  return { success: true }
}

// ─── Panels ───────────────────────────────────────────────────

export async function createPanel(formData: FormData) {
  let context: Awaited<ReturnType<typeof requireAdmin>>
  try {
    context = await requireAdmin()
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  const { supabase } = context

  const parsed = parseInput(() => ({
    name: getRequiredString(formData, 'name', 'Nome', { max: 120 }),
    url: parseHttpUrl(formData.get('url'), 'URL do painel'),
    description: getOptionalString(formData, 'description', 'Descrição', { max: 240 }),
    icon: getOptionalString(formData, 'icon', 'Ícone', { max: 24 }),
    active: parseBoolean(formData.get('active'), 'Status'),
  }))
  if ('error' in parsed) return { error: parsed.error }

  const { error } = await supabase.from('panels').insert(parsed.data)

  if (error) return { error: error.message }
  revalidatePath('/admin/panels')
  return { success: true }
}

export async function updatePanel(panelId: string, formData: FormData) {
  let context: Awaited<ReturnType<typeof requireAdmin>>
  try {
    context = await requireAdmin()
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  const { supabase } = context
  const parsed = parseInput(() => ({
    safePanelId: parseUuid(panelId, 'Painel'),
    values: {
      name: getRequiredString(formData, 'name', 'Nome', { max: 120 }),
      url: parseHttpUrl(formData.get('url'), 'URL do painel'),
      description: getOptionalString(formData, 'description', 'Descrição', { max: 240 }),
      icon: getOptionalString(formData, 'icon', 'Ícone', { max: 24 }),
      active: parseBoolean(formData.get('active'), 'Status'),
    },
  }))
  if ('error' in parsed) return { error: parsed.error }

  const { error } = await supabase.from('panels').update(parsed.data.values).eq('id', parsed.data.safePanelId)

  if (error) return { error: error.message }
  revalidatePath('/admin/panels')
  return { success: true }
}

export async function togglePanelStatus(panelId: string, active: boolean) {
  let context: Awaited<ReturnType<typeof requireAdmin>>
  try {
    context = await requireAdmin()
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  const { supabase } = context
  const parsed = parseInput(() => parseUuid(panelId, 'Painel'))
  if ('error' in parsed) return { error: parsed.error }
  const { error } = await supabase.from('panels').update({ active }).eq('id', parsed.data)
  if (error) return { error: error.message }
  revalidatePath('/admin/panels')
  return { success: true }
}

export async function updatePanelGroups(panelId: string, groupIds: string[]) {
  let context: Awaited<ReturnType<typeof requireAdmin>>
  try {
    context = await requireAdmin()
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  const { supabase } = context
  const parsed = parseInput(() => ({
    safePanelId: parseUuid(panelId, 'Painel'),
    safeGroupIds: parseUuidList(groupIds, 'Grupos'),
  }))
  if ('error' in parsed) return { error: parsed.error }
  const { safePanelId, safeGroupIds } = parsed.data
  const { error: deleteError } = await supabase.from('group_panels').delete().eq('panel_id', safePanelId)
  if (deleteError) return { error: deleteError.message }
  if (safeGroupIds.length > 0) {
    const { error: insertError } = await supabase.from('group_panels').insert(
      safeGroupIds.map((gid, i) => ({ group_id: gid, panel_id: safePanelId, display_order: i }))
    )
    if (insertError) return { error: insertError.message }
  }
  revalidatePath('/admin/panels')
  return { success: true }
}

// ─── Settings ─────────────────────────────────────────────────

export async function updatePortalSettings(formData: FormData) {
  let context: Awaited<ReturnType<typeof requireAdmin>>
  try {
    context = await requireAdmin()
  } catch (error) {
    return { error: actionErrorMessage(error) }
  }

  const parsed = parseInput(() => ({
    name: getRequiredString(formData, 'name', 'Nome do portal', { max: 120 }),
    color: getRequiredString(formData, 'primary_color', 'Cor primária', { max: 7 }),
    logo: parseHttpUrl(formData.get('logo_url'), 'URL do logo', { optional: true }),
  }))
  if ('error' in parsed) return { error: parsed.error }
  const { name, color, logo } = parsed.data

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return { error: 'Cor primária inválida. Use formato hex (#RRGGBB).' }
  }

  const { supabase } = context
  const { error } = await supabase.from('portal_settings').upsert({
    id: 1, name, logo_url: logo, primary_color: color, updated_at: new Date().toISOString(),
  })

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}
