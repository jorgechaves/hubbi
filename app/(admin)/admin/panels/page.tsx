'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { togglePanelStatus } from '@/app/actions/admin'
import { AdminListFilters } from '@/components/admin/list-filters'
import { AdminPageHeader } from '@/components/admin/page-header'
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
    <div className="min-h-full p-4 sm:p-6 lg:p-8 animate-fade-up">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <AdminPageHeader
          title="Painéis"
          description="Cadastre relatórios e controle os acessos dos grupos."
          icon={LayoutDashboard}
          action={(
            <Button asChild size="sm">
              <Link href="/admin/panels/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Novo painel
              </Link>
            </Button>
          )}
        />

        <AdminListFilters search={search} filters={[
          { name: 'status', label: 'Status', value: status === null ? '' : status ? 'active' : 'inactive', options: [{ value: '', label: 'Todos' }, { value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Inativo' }] },
        ]} />

        {error && <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>}

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
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
    </div>
  )
}
