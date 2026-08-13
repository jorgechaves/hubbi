'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  ChevronLeft,
  FileText,
  Home,
  Layers3,
  Settings,
  ShieldCheck,
  Users,
  UserCircle,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isNavigationEntryActive, type NavigationEntry } from '@/lib/ui/navigation'

const iconMap: Record<NavigationEntry['icon'], LucideIcon> = {
  home: Home,
  panel: BarChart3,
  account: UserCircle,
  users: Users,
  groups: Layers3,
  logs: FileText,
  settings: Settings,
}

type AppRailProps = {
  portalName: string
  entries: NavigationEntry[]
  sectionLabel: string
  backHref?: string
  backLabel?: string
  open: boolean
  collapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

export function AppRail({
  portalName,
  entries,
  sectionLabel,
  backHref,
  backLabel,
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: AppRailProps) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fechar navegação"
          className="fixed inset-0 z-20 bg-slate-950/35 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 -translate-x-full flex-col overflow-x-hidden bg-card shadow-xl transition-[width,transform] duration-300 ease-out md:relative md:z-0 md:translate-x-0 md:shadow-none',
          collapsed ? 'md:w-[76px]' : 'md:w-60',
          open && 'translate-x-0'
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
          <div
            className={cn(
              'flex min-w-0 flex-1 items-center gap-2 transition-all duration-200',
              collapsed && 'md:justify-center'
            )}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-primary-foreground"
              style={{ background: 'var(--color-primary, #3a7d72)' }}
            >
              {portalName.charAt(0).toUpperCase()}
            </span>
            <span
              className={cn(
                'truncate text-xs font-semibold tracking-wide text-foreground transition-all duration-200',
                collapsed && 'md:w-0 md:opacity-0'
              )}
            >
              {portalName}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
            title={collapsed ? 'Expandir navegação' : 'Recolher navegação'}
            aria-label={collapsed ? 'Expandir navegação' : 'Recolher navegação'}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            aria-label="Fechar navegação"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4" aria-label={sectionLabel}>
          <div
            className={cn(
              'mb-2 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-all duration-200',
              collapsed && 'md:justify-center md:px-0'
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className={cn('whitespace-nowrap', collapsed && 'md:w-0 md:overflow-hidden md:opacity-0')}>
              {sectionLabel}
            </span>
          </div>

          {backHref ? (
            <Link
              href={backHref}
              onClick={onClose}
              title={collapsed ? backLabel : undefined}
              className={cn(
                'mb-3 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                collapsed && 'md:justify-center md:px-0'
              )}
            >
              <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className={cn('whitespace-nowrap', collapsed && 'md:w-0 md:overflow-hidden md:opacity-0')}>
                {backLabel}
              </span>
            </Link>
          ) : null}

          {entries.map(entry => {
            const Icon = iconMap[entry.icon]
            const active = isNavigationEntryActive(pathname, entry.href)

            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={onClose}
                title={collapsed ? entry.label : undefined}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  collapsed && 'md:justify-center md:px-0',
                  active ? 'font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                style={active ? {
                  background: 'color-mix(in srgb, var(--color-primary, #3a7d72) 12%, transparent)',
                  color: 'var(--color-primary, #3a7d72)',
                } : undefined}
              >
                {active ? (
                  <span
                    className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full"
                    style={{ background: 'var(--color-primary, #3a7d72)' }}
                    aria-hidden="true"
                  />
                ) : null}
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className={cn('min-w-0 truncate whitespace-nowrap', collapsed && 'md:w-0 md:overflow-hidden md:opacity-0')}>
                  {entry.label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border px-3 py-3">
          <p className={cn('text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60', collapsed && 'md:text-center')}>
            {collapsed ? 'BI' : 'Central de BI'}
          </p>
        </div>
      </aside>
    </>
  )
}
