import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPanels } from '@/lib/db/panels'
import { getPortalSettings } from '@/lib/db/portal-settings'
import { PortalShell } from '@/components/sidebar/portal-shell'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, active')
    .eq('id', user.id)
    .single()

  if (!profile?.active) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  const [panels, settings] = await Promise.all([
    getUserPanels(),
    getPortalSettings(),
  ])

  return (
    <PortalShell
      panels={panels}
      portalName={settings.name}
      logoUrl={settings.logo_url}
      isAdmin={profile?.role === 'admin'}
    >
      {children}
    </PortalShell>
  )
}
