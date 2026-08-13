'use client'

import { useEffect, useState } from 'react'
import { AppRail } from './app-rail'
import { Header } from './header'
import { getAdminNavigation } from '@/lib/ui/navigation'

type Props = {
  portalName: string
  logoUrl: string | null
  children: React.ReactNode
}

export function AdminShell({ portalName, logoUrl, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (localStorage.getItem('admin-sidebar-collapsed') === 'true') setCollapsed(true)
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  const toggleCollapse = () => {
    setCollapsed(current => {
      localStorage.setItem('admin-sidebar-collapsed', String(!current))
      return !current
    })
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header
        portalName={portalName}
        logoUrl={logoUrl}
        isAdmin
        onMenuToggle={() => setSidebarOpen(open => !open)}
        contextLabel="Administração"
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AppRail
          portalName={portalName}
          entries={getAdminNavigation()}
          sectionLabel="Administração"
          backHref="/dashboard"
          backLabel="Voltar ao portal"
          open={sidebarOpen}
          collapsed={collapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={toggleCollapse}
        />
        <main className="min-w-0 flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  )
}
