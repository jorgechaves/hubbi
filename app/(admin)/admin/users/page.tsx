import Link from 'next/link'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Plus, Users } from 'lucide-react'
import { AdminListFilters } from '@/components/admin/list-filters'
import { parseRoleFilter, parseSearch, parseStatusFilter, toSearchPattern } from '@/lib/admin/list-query'

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; status?: string }> }) {
  const params = await searchParams
  const search = parseSearch(params.q)
  const role = parseRoleFilter(params.role)
  const status = parseStatusFilter(params.status)
  const pattern = toSearchPattern(search)
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = service
    .from('profiles')
    .select('id, name, email, role, active, created_at')
    .order('created_at', { ascending: false })
  if (pattern) query = query.or(`name.ilike.${pattern},email.ilike.${pattern}`)
  if (role) query = query.eq('role', role)
  if (status !== null) query = query.eq('active', status)
  const { data: profiles } = await query

  return (
    <div className="p-8 space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-mono-brand uppercase tracking-[0.2em] text-muted-foreground/50">Admin</p>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Usuários
          </h1>
        </div>
        <Link
          href="/admin/users/new"
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 text-background"
          style={{ background: 'var(--color-primary, #0047d4)' }}
        >
          <Plus className="h-4 w-4" />
          Novo usuário
        </Link>
      </div>

      <AdminListFilters search={search} filters={[
        { name: 'role', label: 'Função', value: role ?? '', options: [{ value: '', label: 'Todas' }, { value: 'admin', label: 'Admin' }, { value: 'user', label: 'Usuário' }] },
        { name: 'status', label: 'Status', value: status === null ? '' : status ? 'active' : 'inactive', options: [{ value: '', label: 'Todos' }, { value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Inativo' }] },
      ]} />

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Nome', 'Email', 'Role', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-mono-brand uppercase tracking-[0.15em] text-muted-foreground/50">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profiles?.map((p) => (
              <tr
                key={p.id}
                className="transition-colors hover:bg-muted/50 border-t border-border first:border-t-0"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {p.name || <span className="text-muted-foreground/40">—</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono-brand font-bold uppercase tracking-wider ${
                      p.role === 'admin'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {p.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs ${p.active ? 'text-green-500' : 'text-red-400'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${p.active ? 'bg-green-500' : 'bg-red-400'}`} />
                    {p.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/users/${p.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Editar →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!profiles || profiles.length === 0) && (
          <div className="py-12 text-center text-sm text-muted-foreground/50">{search || role || status !== null ? 'Nenhum resultado para os filtros aplicados.' : 'Nenhum usuário cadastrado.'}</div>
        )}
      </div>
    </div>
  )
}
