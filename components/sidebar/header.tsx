'use client'

import { Menu, LogOut, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { logout } from '@/app/actions/auth'
import { useTransition } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ChevronRight, Grid2X2, UserCircle } from 'lucide-react'

type Props = {
  portalName: string
  logoUrl: string | null
  isAdmin: boolean
  onMenuToggle: () => void
  contextLabel?: string
}

export function Header({ portalName, logoUrl, isAdmin, onMenuToggle, contextLabel = 'Home' }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/95 px-3 backdrop-blur sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          onClick={onMenuToggle}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          aria-label="Abrir navegação"
        >
          <Menu className="h-5 w-5" />
        </button>

        <span className="hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground sm:flex" aria-hidden="true">
          <Grid2X2 className="h-4 w-4" />
        </span>

        <Link href="/dashboard" className="group flex min-w-0 items-center gap-2.5">
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
              className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold text-primary-foreground"
              style={{ background: 'var(--color-primary, #3a7d72)' }}
            >
              {portalName.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {portalName}
          </span>
        </Link>

        <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground/50 sm:block" aria-hidden="true" />
        <Link href="/dashboard" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
          {contextLabel}
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <ThemeToggle />

        <div className="mx-1 hidden h-5 w-px bg-border sm:block" />

        {isAdmin && (
          <Link
            href="/admin/users"
            className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin
          </Link>
        )}

        <Link
          href="/account"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Minha conta"
          title="Minha conta"
        >
          <UserCircle className="h-5 w-5" />
        </Link>

        <button
          disabled={isPending}
          onClick={() => startTransition(() => logout())}
          className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:flex"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>
    </header>
  )
}
