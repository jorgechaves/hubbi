'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { updatePanel, updatePanelGroups } from '@/app/actions/admin'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader } from '@/components/admin/page-header'

type Panel = { id: string; name: string; url: string; description: string | null; icon: string | null; active: boolean }
type Group = { id: string; name: string }

export default function EditPanelPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [panel, setPanel] = useState<Panel | null>(null)
  const [allGroups, setAllGroups] = useState<Group[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('panels').select('*').eq('id', id).single(),
      supabase.from('groups').select('id,name').order('name'),
      supabase.from('group_panels').select('group_id').eq('panel_id', id),
    ]).then(([p, g, gp]) => {
      setPanel(p.data)
      setAllGroups(g.data ?? [])
      setSelectedGroups((gp.data ?? []).map((r: { group_id: string }) => r.group_id))
    })
  }, [id])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const panelResult = await updatePanel(id, formData)
      if (panelResult?.error) {
        setError(panelResult.error)
        return
      }

      const groupsResult = await updatePanelGroups(id, selectedGroups)
      if (groupsResult?.error) {
        setError(groupsResult.error)
        return
      }

      toast.success('Painel atualizado.')
      router.push('/admin/panels')
    })
  }

  if (!panel) return <div className="p-4 text-sm text-muted-foreground sm:p-6">Carregando...</div>

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <AdminPageHeader
          title="Editar painel"
          description="Atualize os dados do relatório, pré-visualize a URL e gerencie seus grupos."
          backHref="/admin/panels"
        />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" defaultValue={panel.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL do painel</Label>
            <div className="flex gap-2">
              <Input id="url" name="url" type="url" defaultValue={panel.url} required className="flex-1" />
              <Button type="button" variant="outline" size="icon" onClick={() => setPreviewUrl(panel.url)}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" name="description" defaultValue={panel.description ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Ícone</Label>
            <Input id="icon" name="icon" defaultValue={panel.icon ?? ''} placeholder="📊" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select name="active" defaultValue={String(panel.active)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Grupos com acesso</Label>
            <div className="max-h-40 divide-y divide-border overflow-y-auto rounded-md border border-border bg-background">
              {allGroups.map(g => (
                <label key={g.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(g.id)}
                    onChange={e =>
                      setSelectedGroups(prev =>
                        e.target.checked ? [...prev, g.id] : prev.filter(x => x !== g.id)
                      )
                    }
                  />
                  {g.name}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button type="submit" disabled={isPending}>{isPending ? 'Salvando...' : 'Salvar'}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          </div>
        </form>

        {previewUrl && (
          <div className="flex min-h-96 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-[10px] font-mono-brand uppercase tracking-[0.16em] text-muted-foreground">Visualização</p>
                <p className="mt-1 text-sm font-medium text-foreground">Prévia do painel</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPreviewUrl(null)}>Fechar</Button>
            </div>
            <iframe src={previewUrl} title="Prévia do painel" className="min-h-96 flex-1 border-0 bg-white" />
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
