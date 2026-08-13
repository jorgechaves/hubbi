import Link from 'next/link'
import { ArrowLeft, BarChart2, Home } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PanelIframe } from './panel-iframe'

type Props = { params: Promise<{ id: string }> }

export default async function PanelPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userGroups } = await supabase
    .from('user_groups')
    .select('group_id')
    .eq('user_id', user!.id)

  const groupIds = (userGroups ?? []).map(row => row.group_id)
  if (groupIds.length === 0) notFound()

  const { data: access } = await supabase
    .from('group_panels')
    .select('panel_id')
    .eq('panel_id', id)
    .in('group_id', groupIds)
    .limit(1)
    .single()

  if (!access) notFound()

  const { data: panel } = await supabase
    .from('panels')
    .select('name, active')
    .eq('id', id)
    .single()

  if (!panel || !panel.active) notFound()

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex min-h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Voltar para o dashboard"
          title="Voltar para o dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <Home className="h-3.5 w-3.5" aria-hidden="true" />
          <span>/</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
            style={{
              background: 'color-mix(in srgb, var(--color-primary, #3a7d72) 12%, transparent)',
              color: 'var(--color-primary, #3a7d72)',
            }}
          >
            <BarChart2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="hidden text-[10px] font-mono-brand uppercase tracking-[0.16em] text-muted-foreground sm:block">
              Painel
            </p>
            <h1 className="truncate text-sm font-semibold text-foreground">{panel.name}</h1>
          </div>
        </div>
        <span className="ml-auto hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          Ativo
        </span>
      </div>
      <div className="min-h-0 flex-1 p-2 sm:p-3">
        <div className="h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <PanelIframe panelId={id} panelName={panel.name} />
        </div>
      </div>
    </div>
  )
}
