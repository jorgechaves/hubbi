import { FileText } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { AdminPageHeader } from '@/components/admin/page-header'

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const pageSize = 50
  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1

  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: logs, count } = await service
    .from('access_logs')
    .select(`
      id,
      accessed_at,
      user:profiles(name, email),
      panel:panels(name)
    `, { count: 'exact' })
    .order('accessed_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 animate-fade-up">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <AdminPageHeader
          title="Logs de acesso"
          description={`${count ?? 0} registros de auditoria no total.`}
          icon={FileText}
        />

        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <p className="text-[10px] font-mono-brand uppercase tracking-[0.18em] text-muted-foreground">Auditoria</p>
            <p className="mt-1 text-sm text-muted-foreground">Acompanhe os acessos aos painéis do portal.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 text-[10px] font-mono-brand uppercase tracking-[0.16em] text-muted-foreground">Usuário</th>
                  <th className="px-5 py-3 text-[10px] font-mono-brand uppercase tracking-[0.16em] text-muted-foreground">Painel</th>
                  <th className="px-5 py-3 text-[10px] font-mono-brand uppercase tracking-[0.16em] text-muted-foreground">Data / Hora</th>
                </tr>
              </thead>
              <tbody>
                {logs?.map(log => {
                  const user = log.user as unknown as { name: string; email: string } | null
                  const panel = log.panel as unknown as { name: string } | null
                  return (
                    <tr key={log.id} className="border-t border-border transition-colors first:border-t-0 hover:bg-muted/50">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-foreground">{user?.name || '—'}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{user?.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-foreground">{panel?.name || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {new Date(log.accessed_at).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {(!logs || logs.length === 0) ? (
              <div className="border-t border-border px-5 py-12 text-center text-sm text-muted-foreground">
                Nenhum acesso registrado.
              </div>
            ) : null}
          </div>
        </section>

        {totalPages > 1 ? (
          <nav className="flex flex-wrap gap-2" aria-label="Paginação dos logs">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
              <a
                key={pageNumber}
                href={`?page=${pageNumber}`}
                aria-current={pageNumber === currentPage ? 'page' : undefined}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${pageNumber === currentPage ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                {pageNumber}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </div>
  )
}
