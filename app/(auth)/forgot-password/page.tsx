'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPassword } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await forgotPassword(formData)
      setSent(true)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 bg-card p-8 rounded-xl border border-border">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">Recuperar senha</h1>
          <p className="text-sm text-muted-foreground">
            Informe seu email e enviaremos um link de redefinição
          </p>
        </div>

        {sent ? (
          <p className="text-sm text-green-500 bg-green-500/10 px-3 py-2 rounded-md text-center">
            Se o email estiver cadastrado, você receberá o link em breve.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Enviando...' : 'Enviar link'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm">
          <Link href="/login" className="text-muted-foreground hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}
