'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { togglePanelStatus } from '@/app/actions/admin'
import { AdminListFilters } from '@/components/admin/list-filters'
import { parseSearch, parseStatusFilter } from '@/lib/admin/list-query'
import { toast } from 'sonner'

type Panel = { id: string; name: string; description: string | null; active: boolean }

export default function PanelsPage() {
  const searchParams = useSearchParams()
  const search = parseSearch(searchParams.get('q'))
  const status = parseStatusFilter(searchParams.get('status'))
  const [panels, setPanels] = useState<Panel[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.from('panels').select('id,name,description,active').order('name').then(({ data }) => {
      setPanels(data ?? [])
    })
  }, [])

  function handleToggle(panelId: string, active: boolean) {
    setError(null)
    startTransition(async () => {
      const result = await togglePanelStatus(panelId, active)
      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      setPanels(prev => prev.map(p => p.id === panelId ? { ...p, active } : p))
      toast.success(active ? 'Painel ativado.' : 'Painel desativado.')
    })
  }

  return (
    <div className="p-8 space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-mono-brand uppercase tracking-[0.2em] text-muted-foreground/50">Admin</p>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            Painéis
          </h1>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/panels/new">
            <Plus className="h-4 w-4 mr-1" />Novo painel
          </Link>
        </Button>
      </div>

      <AdminListFilters search={search} filters={[
        { name: 'status', label: 'Status', value: status === null ? '' : status ? 'active' : 'inactive', options: [{ value: '', label: 'Todos' }, { value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Inativo' }] },
      ]} />

      {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Nome', 'Descrição', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-mono-brand uppercase tracking-[0.15em] text-muted-foreground/50">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {panels.filter(p => (!search || `${p.name} ${p.description ?? ''}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))) && (status === null || p.active === status)).map(p => (
              <tr
                key={p.id}
                className="transition-colors hover:bg-muted/50 border-t border-border first:border-t-0"
              >
                <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.description || <span className="text-muted-foreground/40">—</span>}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(p.id, !p.active)}
                    disabled={isPending}
                    className="focus:outline-none"
                  >
                    <span className={`inline-flex items-center gap-1.5 text-xs ${p.active ? 'text-green-500' : 'text-red-400'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${p.active ? 'bg-green-500' : 'bg-red-400'}`} />
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/panels/${p.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Editar →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {panels.filter(p => (!search || `${p.name} ${p.description ?? ''}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))) && (status === null || p.active === status)).length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground/50">{search || status !== null ? 'Nenhum resultado para os filtros aplicados.' : 'Nenhum painel cadastrado.'}</div>
        )}
      </div>
    </div>
  )
}
