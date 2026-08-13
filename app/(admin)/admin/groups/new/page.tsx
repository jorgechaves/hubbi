'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createGroup } from '@/app/actions/admin'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/page-header'

export default function NewGroupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await createGroup(formData)
      if (result?.error) setError(result.error)
      else { toast.success('Grupo criado.'); router.push('/admin/groups') }
    })
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <AdminPageHeader
          title="Novo grupo"
          description="Crie um grupo para organizar acessos por equipe."
          backHref="/admin/groups"
        />

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input id="description" name="description" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="welcome_message">Mensagem de boas-vindas</Label>
          <textarea
            id="welcome_message"
            name="welcome_message"
            rows={3}
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
            placeholder="Mensagem exibida no dashboard do usuário..."
          />
        </div>

        {error && <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Criando...' : 'Criar grupo'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
      </div>
    </div>
  )
}
