import { createClient } from '@/lib/supabase/server'
import { ActionError } from '@/lib/security/forms'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new ActionError('Sessão expirada. Entre novamente.')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, active')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin' || !profile.active) {
    throw new ActionError('Acesso negado.')
  }

  return { supabase, user, profile }
}
