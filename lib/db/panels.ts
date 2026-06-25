import { createClient } from '@/lib/supabase/server'

export type Panel = {
  id: string
  name: string
  description: string | null
  icon: string | null
  active: boolean
}

export async function getUserPanels(): Promise<Panel[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('group_panels')
    .select(`
      display_order,
      panel:panels!inner(id, name, description, icon, active)
    `)
    .eq('panels.active', true)
    .order('display_order')

  if (!data) return []

  const seen = new Set<string>()
  return data
    .map(row => row.panel as unknown as Panel)
    .filter(p => {
      if (!p?.id || seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
}

export async function getPanelById(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('panels')
    .select('id, name, url, active')
    .eq('id', id)
    .single()
  return data
}

export async function getUserGroupWelcome(userId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_groups')
    .select('group:groups!inner(welcome_message)')
    .eq('user_id', userId)
    .order('group_id')
    .limit(1)
    .single()

  const group = data?.group as unknown as { welcome_message: string | null } | null
  return group?.welcome_message ?? null
}
