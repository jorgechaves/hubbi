import { createClient } from '@/lib/supabase/server'
import { getUserGroupWelcome } from '@/lib/db/panels'
import { BarChart2 } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user!.id)
    .single()

  const welcomeMessage = await getUserGroupWelcome(user!.id)
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
      ) : (
        <div className="rounded-lg p-6 bg-card border border-border flex items-start gap-4">
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
            <p className="text-sm font-semibold text-foreground mb-1">Pronto para começar</p>
            <p className="text-sm text-muted-foreground">
              Selecione um painel na barra lateral para visualizar seus dados.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
