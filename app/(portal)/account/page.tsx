'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/page-header'
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
    <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <AdminPageHeader
          eyebrow="Conta"
          title="Minha conta"
          description="Altere sua senha de acesso."
          icon={KeyRound}
        />

        <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
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

          {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

          <div className="flex justify-end border-t border-border pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Alterando...' : 'Alterar senha'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
