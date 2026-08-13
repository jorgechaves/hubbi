import { getPortalSettings } from '@/lib/db/portal-settings'
import { AuthShell } from '@/components/auth/auth-shell'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPortalSettings()

  return (
    <AuthShell portalName={settings.name} logoUrl={settings.logo_url}>
      {children}
    </AuthShell>
  )
}
