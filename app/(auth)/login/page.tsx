'use client'

import { Suspense, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/app/actions/auth'
import { ArrowRight } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const resetSuccess = searchParams.get('reset') === 'success'
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('next', next)
    setError(null)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <>
      {resetSuccess ? (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
          Senha redefinida com sucesso.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-mono-brand uppercase tracking-[0.16em] text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="voce@empresa.com"
            required
            autoComplete="email"
            className="h-11 bg-background"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-mono-brand uppercase tracking-[0.16em] text-muted-foreground">
            Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="h-11 bg-background"
          />
        </div>

        {error ? <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div> : null}

        <button
          type="submit"
          disabled={isPending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Entrando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Entrar
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        <Link href="/forgot-password" className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Esqueci minha senha
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[10px] font-mono-brand uppercase tracking-[0.18em] text-muted-foreground">Acesso seguro</p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Bem-vindo</h2>
        <p className="text-sm leading-6 text-muted-foreground">Entre com suas credenciais para continuar.</p>
      </div>

      <Suspense fallback={<div className="h-48 rounded-lg bg-muted animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
