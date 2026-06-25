'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import type { Panel } from '@/lib/db/panels'

type Props = {
  panels: Panel[]
  portalName: string
  logoUrl: string | null
  isAdmin: boolean
  children: React.ReactNode
}

export function PortalShell({ panels, portalName, logoUrl, isAdmin, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('sidebar-collapsed') === 'true') setCollapsed(true)
  }, [])

  const toggleCollapse = () => {
    setCollapsed(c => {
      localStorage.setItem('sidebar-collapsed', String(!c))
      return !c
    })
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        portalName={portalName}
        logoUrl={logoUrl}
        isAdmin={isAdmin}
        onMenuToggle={() => setSidebarOpen(o => !o)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          panels={panels}
          portalName={portalName}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
