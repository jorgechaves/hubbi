'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changeOwnPassword } from '@/app/actions/auth'

export default function AccountPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setError(null)
    startTransition(async () => {
      const result = await changeOwnPassword(new FormData(form))
      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      form.reset()
      toast.success('Senha alterada com sucesso.')
      router.refresh()
    })
  }

  return (
    <div className="p-8 max-w-lg space-y-6 animate-fade-up">
      <div className="space-y-1">
        <p className="text-[10px] font-mono-brand uppercase tracking-[0.2em] text-muted-foreground/50">Conta</p>
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-muted-foreground" />
          Minha conta
        </h1>
        <p className="text-sm text-muted-foreground">Altere sua senha de acesso.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current_password">Senha atual</Label>
          <Input id="current_password" name="current_password" type="password" autoComplete="current-password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new_password">Nova senha</Label>
          <Input id="new_password" name="new_password" type="password" minLength={8} autoComplete="new-password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirmar nova senha</Label>
          <Input id="password_confirmation" name="password_confirmation" type="password" minLength={8} autoComplete="new-password" required />
        </div>

        {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Alterando...' : 'Alterar senha'}
        </Button>
      </form>
    </div>
  )
}
