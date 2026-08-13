export type NavigationIcon = 'home' | 'panel' | 'account' | 'users' | 'groups' | 'logs' | 'settings'

export type NavigationEntry = {
  href: string
  label: string
  icon: NavigationIcon
}

export function getPortalNavigation(panels: Array<{ id: string; name: string }>): NavigationEntry[] {
  return [
    { href: '/dashboard', label: 'Home', icon: 'home' },
    ...panels.map(panel => ({ href: `/panel/${panel.id}`, label: panel.name, icon: 'panel' as const })),
    { href: '/account', label: 'Minha conta', icon: 'account' },
  ]
}

export function getAdminNavigation(): NavigationEntry[] {
  return [
    { href: '/admin/users', label: 'Usuários', icon: 'users' },
    { href: '/admin/groups', label: 'Grupos', icon: 'groups' },
    { href: '/admin/panels', label: 'Painéis', icon: 'panel' },
    { href: '/admin/logs', label: 'Logs de acesso', icon: 'logs' },
    { href: '/admin/settings', label: 'Configurações', icon: 'settings' },
  ]
}

export function isNavigationEntryActive(pathname: string, href: string): boolean {
  return href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}
