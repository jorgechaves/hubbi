import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserGroupWelcome, getUserPanels } from '@/lib/db/panels'
import { BarChart2, LayoutDashboard } from 'lucide-react'

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
    <div className="p-8 max-w-2xl animate-fade-up">
      <div className="space-y-1 mb-8">
        <p className="text-[10px] font-mono-brand uppercase tracking-[0.2em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold text-foreground">
          Olá, {firstName}.
        </h1>
      </div>

      {welcomeMessage ? (
        <div className="rounded-lg p-5 bg-card border border-border text-sm text-foreground leading-relaxed whitespace-pre-line">
          {welcomeMessage}
        </div>
      ) : null}

      {/* Counter card */}
      <div className="mt-8 rounded-lg p-5 bg-card border border-border flex items-center gap-4">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'color-mix(in srgb, var(--color-primary, #0047d4) 12%, transparent)',
            color: 'var(--color-primary, #0047d4)',
          }}
        >
          <BarChart2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground leading-none">{panels.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {panels.length === 1 ? 'painel disponível' : 'painéis disponíveis'}
          </p>
        </div>
      </div>

      {/* Panel grid */}
      {panels.length === 0 ? (
        <div className="mt-6 rounded-lg p-6 bg-card border border-border flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-muted">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Nenhum painel disponível</p>
            <p className="text-sm text-muted-foreground">
              Entre em contato com o administrador para obter acesso aos painéis.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {panels.map(panel => (
            <Link
              key={panel.id}
              href={`/panel/${panel.id}`}
              className="group rounded-lg p-5 bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-colors flex items-start gap-3"
            >
              <div
                className="h-9 w-9 rounded-md flex items-center justify-center shrink-0 text-lg leading-none"
                style={{
                  background: 'color-mix(in srgb, var(--color-primary, #0047d4) 10%, transparent)',
                }}
              >
                {panel.icon ? (
                  <span>{panel.icon}</span>
                ) : (
                  <BarChart2
                    className="h-4 w-4"
                    style={{ color: 'var(--color-primary, #0047d4)' }}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {panel.name}
                </p>
                {panel.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {panel.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
