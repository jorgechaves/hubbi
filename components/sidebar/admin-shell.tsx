'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Layers, BarChart2, FileText, Settings, LogOut, ArrowLeft, ShieldCheck, ChevronLeft } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { useTransition } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin/users',    label: 'Usuários',       icon: Users },
  { href: '/admin/groups',   label: 'Grupos',         icon: Layers },
  { href: '/admin/panels',   label: 'Painéis',        icon: BarChart2 },
  { href: '/admin/logs',     label: 'Logs de acesso', icon: FileText },
  { href: '/admin/settings', label: 'Configurações',  icon: Settings },
]

type Props = {
  portalName: string
  children: React.ReactNode
}

export function AdminShell({ portalName, children }: Props) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (localStorage.getItem('admin-sidebar-collapsed') === 'true') setCollapsed(true)
  }, [])

  const toggleCollapse = () => {
    setCollapsed(c => {
      localStorage.setItem('admin-sidebar-collapsed', String(!c))
      return !c
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={cn(
          'flex flex-col shrink-0 bg-card border-r border-border overflow-x-hidden',
          'transition-[width] duration-300 ease-out',
          collapsed ? 'w-[52px]' : 'w-56'
        )}
      >
        {/* Brand header */}
        <div className="h-14 flex items-center shrink-0 border-b border-border px-3 gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span
            className={cn(
              'font-mono-brand text-xs font-bold tracking-[0.12em] uppercase text-foreground/70 truncate flex-1',
              'transition-all duration-300 overflow-hidden',
              collapsed && 'w-0 opacity-0 flex-none'
            )}
          >
            {portalName}
          </span>

          <button
            onClick={toggleCollapse}
            className="h-6 w-6 shrink-0 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <ChevronLeft
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-300',
                collapsed && 'rotate-180'
              )}
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {/* Back to portal */}
          <Link
            href="/dashboard"
            title={collapsed ? 'Voltar ao portal' : undefined}
            className={cn(
              'flex items-center rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 py-2',
              collapsed ? 'justify-center px-2 gap-0 mb-3' : 'gap-2.5 px-3 mb-3'
            )}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span className={cn(
              'whitespace-nowrap overflow-hidden transition-all duration-200',
              collapsed ? 'w-0 opacity-0' : 'opacity-100'
            )}>
              Voltar ao portal
            </span>
          </Link>

          {/* Section label */}
          <div className={cn(
            'transition-all duration-200 overflow-hidden',
            collapsed ? 'h-0 opacity-0' : 'pt-1 pb-2 px-3 opacity-100'
          )}>
            <p className="text-[10px] font-mono-brand font-bold uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap">
              Administração
            </p>
          </div>

          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'relative flex items-center rounded-md text-sm py-2 transition-all duration-150',
                  collapsed ? 'justify-center px-2 gap-0' : 'gap-2.5 px-3',
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
                <item.icon className="h-4 w-4 shrink-0" />
                <span className={cn(
                  'whitespace-nowrap overflow-hidden transition-all duration-200',
                  collapsed ? 'w-0 opacity-0' : 'opacity-100'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={cn(
          'border-t border-border p-2 space-y-1',
        )}>
          {!collapsed && (
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-xs text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center py-1">
              <ThemeToggle />
            </div>
          )}
          <button
            disabled={isPending}
            onClick={() => startTransition(() => logout())}
            title={collapsed ? 'Sair' : undefined}
            className={cn(
              'w-full flex items-center rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 py-2 disabled:opacity-50',
              collapsed ? 'justify-center px-2 gap-0' : 'gap-2.5 px-3'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn(
              'whitespace-nowrap overflow-hidden transition-all duration-200',
              collapsed ? 'w-0 opacity-0' : 'opacity-100'
            )}>
              Sair
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
