import { createClient } from '@supabase/supabase-js'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const pageSize = 50
  const from = (currentPage - 1) * pageSize
  const to   = from + pageSize - 1

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
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Logs de acesso</h1>
      <p className="text-sm text-gray-500">{count ?? 0} registros no total</p>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Painel</TableHead>
              <TableHead>Data / Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map(log => {
              const user  = log.user  as unknown as { name: string; email: string } | null
              const panel = log.panel as unknown as { name: string } | null
              return (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-sm">{user?.name || '—'}</div>
                    <div className="text-xs text-gray-400">{user?.email}</div>
                  </TableCell>
                  <TableCell>{panel?.name || '—'}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(log.accessed_at).toLocaleString('pt-BR')}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a
              key={p}
              href={`?page=${p}`}
              className={`px-3 py-1 rounded border ${p === currentPage ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-50'}`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
