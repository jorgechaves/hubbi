'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { updateGroup, updateGroupPanels } from '@/app/actions/admin'
import { GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/page-header'

type Group = { id: string; name: string; description: string | null; welcome_message: string | null }
type Panel = { id: string; name: string }

export default function EditGroupPage() {
  const { id } = useParams<{ id: string }>()
  const router   = useRouter()
  const [group,  setGroup]  = useState<Group | null>(null)
  const [allPanels, setAllPanels] = useState<Panel[]>([])
  const [selectedPanels, setSelectedPanels] = useState<string[]>([])
  const [error,  setError]  = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('groups').select('id,name,description,welcome_message').eq('id', id).single(),
      supabase.from('panels').select('id,name').eq('active', true).order('name'),
      supabase.from('group_panels').select('panel_id,display_order').eq('group_id', id).order('display_order'),
    ]).then(([g, p, gp]) => {
      setGroup(g.data)
      setAllPanels(p.data ?? [])
      setSelectedPanels((gp.data ?? []).map((r: { panel_id: string }) => r.panel_id))
    })
  }, [id])

  function togglePanel(panelId: string) {
    setSelectedPanels(prev =>
      prev.includes(panelId) ? prev.filter(x => x !== panelId) : [...prev, panelId]
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const groupResult = await updateGroup(id, formData)
      if (groupResult?.error) {
        setError(groupResult.error)
        return
      }

      const panelsResult = await updateGroupPanels(id, selectedPanels)
      if (panelsResult?.error) {
        setError(panelsResult.error)
        return
      }

      toast.success('Grupo atualizado.')
      router.push('/admin/groups')
    })
  }

  if (!group) return <div className="p-4 text-sm text-muted-foreground sm:p-6">Carregando...</div>

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <AdminPageHeader
          title="Editar grupo"
          description="Atualize a descrição, mensagem e painéis associados."
          backHref="/admin/groups"
        />

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" defaultValue={group.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input id="description" name="description" defaultValue={group.description ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="welcome_message">Mensagem de boas-vindas</Label>
          <textarea
            id="welcome_message"
            name="welcome_message"
            rows={3}
            defaultValue={group.welcome_message ?? ''}
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
          />
        </div>

        <div className="space-y-2">
          <Label>Painéis associados</Label>
          <div className="max-h-48 divide-y divide-border overflow-y-auto rounded-md border border-border bg-background">
            {allPanels.map(panel => (
              <label key={panel.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-muted">
                <GripVertical className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                <input
                  type="checkbox"
                  className="rounded"
                  checked={selectedPanels.includes(panel.id)}
                  onChange={() => togglePanel(panel.id)}
                />
                {panel.name}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
      </div>
    </div>
  )
}
