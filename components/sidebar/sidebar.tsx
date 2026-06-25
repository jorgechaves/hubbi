'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart2, X, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col overflow-x-hidden shrink-0',
          'transition-[width] duration-300 ease-out',
          'md:relative md:translate-x-0',
          'bg-card border-r border-border',
          // Mobile: full-width drawer, desktop: responsive to collapsed
          'w-60',
          collapsed ? 'md:w-[52px]' : 'md:w-60',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="h-14 flex items-center shrink-0 border-b border-border px-3 gap-2">
          <span
            className={cn(
              'font-mono-brand text-[11px] font-bold tracking-[0.15em] uppercase text-foreground/70 truncate',
              'transition-all duration-300 overflow-hidden flex-1',
              collapsed && 'md:w-0 md:opacity-0 md:flex-none'
            )}
          >
            {portalName}
          </span>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <ChevronLeft
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-300',
                collapsed && 'rotate-180'
              )}
            />
          </button>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-0.5">
          <NavItem
            href="/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard className="h-4 w-4 shrink-0" />}
            active={pathname === '/dashboard'}
            onClick={onClose}
            collapsed={collapsed}
          />

          {panels.length > 0 && (
            <>
              <div
                className={cn(
                  'transition-all duration-200 overflow-hidden',
                  collapsed ? 'md:h-0 md:opacity-0' : 'pt-5 pb-2 px-3 opacity-100'
                )}
              >
                <p className="text-[10px] font-mono-brand font-bold uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap">
                  Painéis
                </p>
              </div>
              {panels.map(panel => (
                <NavItem
                  key={panel.id}
                  href={`/panel/${panel.id}`}
                  label={panel.name}
                  icon={<BarChart2 className="h-4 w-4 shrink-0" />}
                  active={pathname === `/panel/${panel.id}`}
                  onClick={onClose}
                  collapsed={collapsed}
                />
              ))}
            </>
          )}

          {panels.length === 0 && !collapsed && (
            <p className="px-3 py-3 text-xs text-muted-foreground/60 leading-relaxed">
              Nenhum painel disponível.<br />Contate o administrador.
            </p>
          )}
        </nav>

        {/* Bottom accent */}
        <div
          className="h-px w-full shrink-0"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--color-primary, #0047d4), transparent)',
            opacity: 0.4,
          }}
        />
      </aside>
    </>
  )
}

function NavItem({
  href,
  label,
  icon,
  active,
  onClick,
  collapsed,
}: {
  href: string
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
  collapsed: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'relative flex items-center rounded-md text-sm py-2 transition-all duration-200',
        collapsed ? 'md:justify-center md:px-2 md:gap-0 px-3 gap-2.5' : 'px-3 gap-2.5',
        active
          ? 'font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
      style={active ? {
        background: 'color-mix(in srgb, var(--color-primary, #0047d4) 10%, transparent)',
        color: 'var(--color-primary, #0047d4)',
      } : {}}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full"
          style={{
            background: 'var(--color-primary, #0047d4)',
            boxShadow: '0 0 8px var(--color-primary, #0047d4)',
          }}
        />
      )}
      {icon}
      <span
        className={cn(
          'whitespace-nowrap overflow-hidden transition-all duration-200',
          collapsed ? 'md:w-0 md:opacity-0' : 'opacity-100'
        )}
      >
        {label}
      </span>
    </Link>
  )
}
