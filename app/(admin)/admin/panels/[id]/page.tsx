'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { updatePanel, updatePanelGroups } from '@/app/actions/admin'
import { ArrowLeft, ExternalLink } from 'lucide-react'

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
      await updatePanel(id, formData)
      await updatePanelGroups(id, selectedGroups)
      router.push('/admin/panels')
    })
  }

  if (!panel) return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/panels"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold">Editar painel</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 space-y-4">
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
            <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
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

          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending}>{isPending ? 'Salvando...' : 'Salvar'}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          </div>
        </form>

        {previewUrl && (
          <div className="bg-card rounded-lg border border-border overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <p className="text-sm font-medium">Prévia</p>
              <Button variant="ghost" size="sm" onClick={() => setPreviewUrl(null)}>Fechar</Button>
            </div>
            <iframe src={previewUrl} title="Prévia do painel" className="flex-1 border-0 min-h-96" />
          </div>
        )}
      </div>
    </div>
  )
}
