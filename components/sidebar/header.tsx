'use client'

import { Menu, LogOut, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { logout } from '@/app/actions/auth'
import { useTransition } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

type Props = {
  portalName: string
  logoUrl: string | null
  isAdmin: boolean
  onMenuToggle: () => void
}

export function Header({ portalName, logoUrl, isAdmin, onMenuToggle }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <header className="h-14 flex items-center justify-between px-4 shrink-0 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={portalName}
              width={24}
              height={24}
              className="rounded object-contain"
            />
          ) : (
            <span
              className="h-6 w-6 rounded flex items-center justify-center text-[10px] font-mono-brand font-bold text-[#09090f]"
              style={{ background: 'var(--color-primary, #0047d4)' }}
            >
              {portalName.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="font-mono-brand text-xs font-bold tracking-[0.15em] uppercase text-foreground/80 group-hover:text-foreground transition-colors">
            {portalName}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <ThemeToggle />

        <div className="w-px h-5 bg-border mx-1" />

        {isAdmin && (
          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin
          </Link>
        )}

        <button
          disabled={isPending}
          onClick={() => startTransition(() => logout())}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>
    </header>
  )
}
