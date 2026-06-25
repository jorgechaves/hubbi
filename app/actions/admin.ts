'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Users ────────────────────────────────────────────────────

export async function createUser(formData: FormData) {
  const service = getServiceClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const name     = formData.get('name') as string
  const role     = (formData.get('role') as string) || 'user'
  const groupIds = formData.getAll('group_ids') as string[]

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (error) return { error: error.message }

  const userId = data.user.id

  await service.from('profiles').update({ role, name }).eq('id', userId)

  if (groupIds.length > 0) {
    await service.from('user_groups').insert(
      groupIds.map(gid => ({ user_id: userId, group_id: gid }))
    )
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUser(userId: string, formData: FormData) {
  const service = getServiceClient()

  const name     = formData.get('name') as string
  const role     = formData.get('role') as string
  const active   = formData.get('active') === 'true'
  const groupIds = formData.getAll('group_ids') as string[]

  await service.from('profiles').update({ name, role, active }).eq('id', userId)

  await service.from('user_groups').delete().eq('user_id', userId)
  if (groupIds.length > 0) {
    await service.from('user_groups').insert(
      groupIds.map(gid => ({ user_id: userId, group_id: gid }))
    )
  }

  if (!active) {
    await service.auth.admin.signOut(userId, 'global')
  }

  revalidatePath('/admin/users')
  return { success: true }
}

// ─── Groups ───────────────────────────────────────────────────

export async function createGroup(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('groups').insert({
    name:            formData.get('name') as string,
    description:     formData.get('description') as string || null,
    welcome_message: formData.get('welcome_message') as string || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/groups')
  return { success: true }
}

export async function updateGroup(groupId: string, formData: FormData) {
  const supabase = await createClient()

  await supabase.from('groups').update({
    name:            formData.get('name') as string,
    description:     formData.get('description') as string || null,
    welcome_message: formData.get('welcome_message') as string || null,
  }).eq('id', groupId)

  revalidatePath('/admin/groups')
  return { success: true }
}

export async function deleteGroup(groupId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('groups').delete().eq('id', groupId)
  if (error) return { error: error.message }
  revalidatePath('/admin/groups')
  return { success: true }
}

export async function updateGroupPanels(groupId: string, panelIds: string[]) {
  const supabase = await createClient()
  await supabase.from('group_panels').delete().eq('group_id', groupId)
  if (panelIds.length > 0) {
    await supabase.from('group_panels').insert(
      panelIds.map((pid, i) => ({ group_id: groupId, panel_id: pid, display_order: i }))
    )
  }
  revalidatePath('/admin/groups')
  return { success: true }
}

// ─── Panels ───────────────────────────────────────────────────

export async function createPanel(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('panels').insert({
    name:        formData.get('name') as string,
    url:         formData.get('url') as string,
    description: formData.get('description') as string || null,
    icon:        formData.get('icon') as string || null,
    active:      formData.get('active') === 'true',
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/panels')
  return { success: true }
}

export async function updatePanel(panelId: string, formData: FormData) {
  const supabase = await createClient()

  await supabase.from('panels').update({
    name:        formData.get('name') as string,
    url:         formData.get('url') as string,
    description: formData.get('description') as string || null,
    icon:        formData.get('icon') as string || null,
    active:      formData.get('active') === 'true',
  }).eq('id', panelId)

  revalidatePath('/admin/panels')
  return { success: true }
}

export async function togglePanelStatus(panelId: string, active: boolean) {
  const supabase = await createClient()
  await supabase.from('panels').update({ active }).eq('id', panelId)
  revalidatePath('/admin/panels')
}

export async function updatePanelGroups(panelId: string, groupIds: string[]) {
  const supabase = await createClient()
  await supabase.from('group_panels').delete().eq('panel_id', panelId)
  if (groupIds.length > 0) {
    await supabase.from('group_panels').insert(
      groupIds.map((gid, i) => ({ group_id: gid, panel_id: panelId, display_order: i }))
    )
  }
  revalidatePath('/admin/panels')
  return { success: true }
}

// ─── Settings ─────────────────────────────────────────────────

export async function updatePortalSettings(formData: FormData) {
  const name  = formData.get('name') as string
  const color = formData.get('primary_color') as string
  const logo  = formData.get('logo_url') as string || null

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return { error: 'Cor primária inválida. Use formato hex (#RRGGBB).' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('portal_settings').upsert({
    id: 1, name, logo_url: logo, primary_color: color, updated_at: new Date().toISOString(),
  })

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}
