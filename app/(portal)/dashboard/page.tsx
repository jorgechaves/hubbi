import Link from 'next/link'
import { ArrowUpRight, BarChart2, ChevronRight, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserGroupWelcome, getUserPanels } from '@/lib/db/panels'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user!.id)
    .single()

  const [welcomeMessage, panels] = await Promise.all([
    getUserGroupWelcome(user!.id),
    getUserPanels(),
  ])
  const firstName = (profile?.name || user!.email || '').split(' ')[0].split('@')[0]

  return (
    <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-mono-brand uppercase tracking-[0.18em] text-muted-foreground">
              Workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Olá, {firstName}.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesse os painéis de BI disponíveis para você.
            </p>
          </div>
          <a
            href="#available-panels"
            className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Explorar painéis
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </section>

        {welcomeMessage ? (
          <section className="flex items-start gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: 'color-mix(in srgb, var(--color-primary, #3a7d72) 12%, transparent)',
                color: 'var(--color-primary, #3a7d72)',
              }}
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Mensagem do seu grupo</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {welcomeMessage}
              </p>
            </div>
          </section>
        ) : null}

        <section id="available-panels" className="space-y-4 scroll-mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-mono-brand uppercase tracking-[0.18em] text-muted-foreground">
                Catálogo
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">Seus painéis</h2>
            </div>
            <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {panels.length} {panels.length === 1 ? 'disponível' : 'disponíveis'}
            </span>
          </div>

          {panels.length === 0 ? (
            <div className="flex items-start gap-4 rounded-xl border border-dashed border-border bg-card px-5 py-6 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <LayoutDashboard className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Nenhum painel disponível</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Entre em contato com o administrador para obter acesso aos painéis.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-4 overflow-x-auto pb-2 sm:auto-cols-[minmax(290px,1fr)] lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-3 xl:grid-cols-4">
              {panels.map(panel => (
                <Link
                  key={panel.id}
                  href={`/panel/${panel.id}`}
                  className="group flex min-h-64 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div
                    className="relative flex h-32 items-center justify-center overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary, #3a7d72) 16%, var(--card)), color-mix(in srgb, var(--color-primary, #3a7d72) 5%, var(--card)))',
                    }}
                  >
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/70 bg-white/75 text-3xl shadow-sm backdrop-blur-sm"
                      aria-hidden="true"
                    >
                      {panel.icon ? (
                        <span>{panel.icon}</span>
                      ) : (
                        <BarChart2 className="h-8 w-8" style={{ color: 'var(--color-primary, #3a7d72)' }} />
                      )}
                    </div>
                    <span className="absolute right-3 top-3 rounded-full bg-white/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/70 backdrop-blur-sm">
                      Painel BI
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      {panel.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">
                      {panel.description || 'Acesse os indicadores e informações deste painel.'}
                    </p>
                    <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-semibold text-primary">
                      Abrir painel
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {panels.length > 0 ? (
          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-mono-brand uppercase tracking-[0.18em] text-muted-foreground">
                  Visão geral
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Todos os painéis</h2>
              </div>
              <p className="text-xs text-muted-foreground">Selecione um item para abrir o relatório.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-3 text-[10px] font-mono-brand uppercase tracking-[0.16em] text-muted-foreground">Nome</th>
                    <th className="px-5 py-3 text-[10px] font-mono-brand uppercase tracking-[0.16em] text-muted-foreground">Descrição</th>
                    <th className="px-5 py-3 text-right text-[10px] font-mono-brand uppercase tracking-[0.16em] text-muted-foreground">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {panels.map(panel => (
                    <tr key={panel.id} className="border-t border-border transition-colors first:border-t-0 hover:bg-muted/50">
                      <td className="px-5 py-3.5">
                        <Link href={`/panel/${panel.id}`} className="flex items-center gap-3 font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                            style={{
                              background: 'color-mix(in srgb, var(--color-primary, #3a7d72) 10%, transparent)',
                              color: 'var(--color-primary, #3a7d72)',
                            }}
                            aria-hidden="true"
                          >
                            {panel.icon ? <span className="text-base">{panel.icon}</span> : <BarChart2 className="h-4 w-4" />}
                          </span>
                          <span className="truncate">{panel.name}</span>
                        </Link>
                      </td>
                      <td className="max-w-lg truncate px-5 py-3.5 text-muted-foreground">
                        {panel.description || 'Sem descrição cadastrada.'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/panel/${panel.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          Abrir
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
