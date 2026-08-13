import Image from 'next/image'
import { BarChart3, ShieldCheck } from 'lucide-react'

type Props = {
  portalName: string
  logoUrl: string | null
  children: React.ReactNode
}

export function AuthShell({ portalName, logoUrl, children }: Props) {
  return (
    <main className="min-h-screen bg-background p-3 sm:p-5 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1440px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:min-h-[calc(100vh-3rem)]">
        <section className="relative hidden overflow-hidden bg-grid-light p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div
            className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full opacity-20 blur-3xl"
            style={{ background: 'var(--color-primary, #3a7d72)' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-48 -right-32 h-96 w-96 rounded-full opacity-10 blur-3xl"
            style={{ background: 'var(--color-primary, #3a7d72)' }}
            aria-hidden="true"
          />

          <div className="relative flex items-center gap-3">
            {logoUrl ? (
              <Image src={logoUrl} alt="" width={36} height={36} className="h-9 w-9 rounded-lg object-contain" />
            ) : (
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground"
                style={{ background: 'var(--color-primary, #3a7d72)' }}
              >
                <BarChart3 className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
            <span className="text-sm font-semibold tracking-tight text-foreground">{portalName}</span>
          </div>

          <div className="relative max-w-xl space-y-6">
            <div className="space-y-3">
              <p
                className="text-xs font-mono-brand uppercase tracking-[0.22em]"
                style={{ color: 'var(--color-primary, #3a7d72)' }}
              >
                Central de inteligência
              </p>
              <h1 className="max-w-lg text-5xl font-light leading-[1.08] tracking-tight text-foreground xl:text-6xl">
                Todos os seus dados em um só lugar.
              </h1>
            </div>
            <p className="max-w-md text-sm leading-7 text-muted-foreground">
              Acesse seus painéis de BI com segurança, controle de acesso por perfil e uma experiência centralizada para sua equipe.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4" style={{ color: 'var(--color-primary, #3a7d72)' }} aria-hidden="true" />
              Ambiente protegido para dados corporativos
            </div>
          </div>

          <p className="relative text-xs text-muted-foreground/60">© {new Date().getFullYear()} {portalName}</p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
              {logoUrl ? (
                <Image src={logoUrl} alt="" width={32} height={32} className="h-8 w-8 rounded-md object-contain" />
              ) : (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-md text-primary-foreground"
                  style={{ background: 'var(--color-primary, #3a7d72)' }}
                >
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
              <span className="text-sm font-semibold tracking-tight text-foreground">{portalName}</span>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}
