'use client'

import { AppRail } from './app-rail'
import { getPortalNavigation } from '@/lib/ui/navigation'
import type { Panel } from '@/lib/db/panels'

type Props = {
  panels: Panel[]
  portalName: string
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ panels, portalName, open, onClose, collapsed, onToggleCollapse }: Props) {
  return (
    <AppRail
      portalName={portalName}
      entries={getPortalNavigation(panels)}
      sectionLabel="Workspace"
      open={open}
      collapsed={collapsed}
      onClose={onClose}
      onToggleCollapse={onToggleCollapse}
    />
  )
}
