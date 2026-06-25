import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPortalSettings } from '@/lib/db/portal-settings'
import { AdminShell } from '@/components/sidebar/admin-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const settings = await getPortalSettings()

  return (
    <AdminShell portalName={settings.name}>
      {children}
    </AdminShell>
  )
}
