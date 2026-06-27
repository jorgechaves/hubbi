'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { resetPassword } from '@/app/actions/auth'
import { Loader2 } from 'lucide-react'

export function ResetPasswordClient({ code }: { code?: string }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [exchangeError, setExchangeError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!code) {
      setStatus('error')
      setExchangeError('Link inválido ou expirado.')
      return
    }
    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setStatus('error')
        setExchangeError('Link expirado ou já utilizado. Solicite um novo link.')
      } else {
        setStatus('ready')
      }
    })
  }, [code])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) { setFormError('As senhas não coincidem.'); return }
    if (password.length < 8)  { setFormError('A senha deve ter no mínimo 8 caracteres.'); return }

    setFormError(null)
    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.error) setFormError(result.error)
    })
  }

  if (status === 'loading') {
    return (
      <div className="py-4 flex flex-col items-center gap-4">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">Nova senha</h1>
          <p className="text-sm text-muted-foreground">Verificando link...</p>
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="space-y-4">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">Nova senha</h1>
        </div>
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md text-center">
          {exchangeError}
        </p>
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Solicitar novo link
          </Link>
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">Nova senha</h1>
        <p className="text-sm text-muted-foreground">Defina sua nova senha de acesso</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <Input id="confirm" name="confirm" type="password" minLength={8} required />
        </div>

        {formError && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{formError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Redefinir senha'}
        </Button>
      </form>

      <p className="text-center text-sm">
        <Link href="/login" className="text-muted-foreground hover:underline">
          Voltar ao login
        </Link>
      </p>
    </>
  )
}
