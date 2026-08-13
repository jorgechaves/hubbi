import Link from 'next/link'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Plus, Users } from 'lucide-react'
import { AdminListFilters } from '@/components/admin/list-filters'
import { AdminPageHeader } from '@/components/admin/page-header'
import { DeleteUserButton } from './delete-user-button'
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
    <div className="min-h-full p-4 sm:p-6 lg:p-8 animate-fade-up">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <AdminPageHeader
          title="Usuários"
          description="Gerencie acessos, perfis e status das contas do portal."
          icon={Users}
          action={(
            <Link
              href="/admin/users/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Novo usuário
            </Link>
          )}
        />

        <AdminListFilters search={search} filters={[
          { name: 'role', label: 'Função', value: role ?? '', options: [{ value: '', label: 'Todas' }, { value: 'admin', label: 'Admin' }, { value: 'user', label: 'Usuário' }] },
          { name: 'status', label: 'Status', value: status === null ? '' : status ? 'active' : 'inactive', options: [{ value: '', label: 'Todos' }, { value: 'active', label: 'Ativo' }, { value: 'inactive', label: 'Inativo' }] },
        ]} />

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
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
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/users/${p.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Editar →
                    </Link>
                    <DeleteUserButton userId={p.id} name={p.name} email={p.email} />
                  </div>
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
    </div>
  )
}
