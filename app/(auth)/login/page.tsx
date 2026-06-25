'use client'

import { Suspense, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/app/actions/auth'
import { ArrowRight, BarChart2 } from 'lucide-react'

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
      {resetSuccess && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-2 rounded-md animate-fade-up">
          Senha redefinida com sucesso.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5 animate-fade-up animate-fade-up-2">
          <Label htmlFor="email" className="text-xs font-mono-brand uppercase tracking-widest text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="voce@empresa.com"
            required
            autoComplete="email"
            className="bg-white/[0.04] border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:border-[var(--color-primary)] focus:bg-white/[0.06] h-11 transition-all duration-200"
          />
        </div>

        <div className="space-y-1.5 animate-fade-up animate-fade-up-3">
          <Label htmlFor="password" className="text-xs font-mono-brand uppercase tracking-widest text-muted-foreground">
            Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="bg-white/[0.04] border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:border-[var(--color-primary)] focus:bg-white/[0.06] h-11 transition-all duration-200"
          />
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-md animate-fade-up">
            {error}
          </div>
        )}

        <div className="animate-fade-up animate-fade-up-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-md font-medium text-sm transition-all duration-200 disabled:opacity-50"
            style={{
              background: 'var(--color-primary, #00d4aa)',
              color: '#09090f',
            }}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Entrando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Entrar
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </button>
        </div>
      </form>

      <p className="text-center text-xs text-muted-foreground animate-fade-up animate-fade-up-4">
        <Link
          href="/forgot-password"
          className="hover:text-foreground transition-colors duration-150 underline underline-offset-4 decoration-white/20 hover:decoration-white/60"
        >
          Esqueci minha senha
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-grid border-r border-white/[0.05] p-12 relative overflow-hidden">
        {/* Corner accent */}
        <div
          className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'var(--color-primary, #00d4aa)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ background: 'var(--color-primary, #00d4aa)' }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded flex items-center justify-center"
            style={{ background: 'var(--color-primary, #00d4aa)' }}
          >
            <BarChart2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-mono-brand font-bold text-sm tracking-wider text-foreground">
            hubbi
          </span>
        </div>

        {/* Main copy */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p
              className="text-xs font-mono-brand tracking-[0.25em] uppercase"
              style={{ color: 'var(--color-primary, #00d4aa)' }}
            >
              Central de Inteligência
            </p>
            <h1 className="text-4xl font-light text-foreground leading-tight">
              Todos os seus<br />
              <span className="font-semibold">dados em um</span><br />
              só lugar.
            </h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Acesse painéis de BI com controle de acesso por perfil, logs de auditoria e identidade visual personalizada.
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground/40 font-mono-brand">
          © {new Date().getFullYear()} hubbi
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 animate-fade-up">
            <div
              className="h-7 w-7 rounded flex items-center justify-center"
              style={{ background: 'var(--color-primary, #00d4aa)' }}
            >
              <BarChart2 className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-mono-brand font-bold text-sm tracking-wider">hubbi</span>
          </div>

          {/* Heading */}
          <div className="space-y-1 animate-fade-up animate-fade-up-1">
            <h2 className="text-2xl font-semibold text-foreground">Bem-vindo</h2>
            <p className="text-sm text-muted-foreground">Entre com suas credenciais para continuar</p>
          </div>

          <Suspense fallback={<div className="h-40" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
