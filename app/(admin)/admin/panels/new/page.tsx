'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createPanel } from '@/app/actions/admin'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/page-header'

export default function NewPanelPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await createPanel(formData)
      if (result?.error) setError(result.error)
      else { toast.success('Painel criado.'); router.push('/admin/panels') }
    })
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <AdminPageHeader
          title="Novo painel"
          description="Cadastre um relatório e defina seu status de publicação."
          backHref="/admin/panels"
        />

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">URL do painel</Label>
          <Input id="url" name="url" type="url" required placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input id="description" name="description" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="icon">Ícone (emoji ou nome)</Label>
          <Input id="icon" name="icon" placeholder="📊" />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select name="active" defaultValue="true">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Ativo</SelectItem>
              <SelectItem value="false">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Criando...' : 'Criar painel'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
      </div>
    </div>
  )
}
