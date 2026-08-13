'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPassword } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await forgotPassword(formData)
      if (result?.error) setError(result.error)
      else setSent(true)
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[10px] font-mono-brand uppercase tracking-[0.18em] text-muted-foreground">Recuperação</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Recuperar senha</h1>
        <p className="text-sm leading-6 text-muted-foreground">Informe seu email e enviaremos um link de redefinição.</p>
      </div>

      {sent ? (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-3 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
          Se o email estiver cadastrado, você receberá o link em breve.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required className="h-11 bg-background" />
          </div>
          {error ? <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="h-11 w-full" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Enviar link'}
          </Button>
        </form>
      )}

      <p className="text-center text-sm">
        <Link href="/login" className="text-muted-foreground transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Voltar ao login
        </Link>
      </p>
    </div>
  )
}
