import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'
import { DeleteGroupButton } from './delete-group-button'
import { AdminListFilters } from '@/components/admin/list-filters'
import { AdminPageHeader } from '@/components/admin/page-header'
import { parseSearch, toSearchPattern } from '@/lib/admin/list-query'

export default async function GroupsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const search = parseSearch((await searchParams).q)
  const pattern = toSearchPattern(search)
  const supabase = await createClient()

  let query = supabase
    .from('groups')
    .select('id, name, description, created_at')
    .order('name')
  if (pattern) query = query.or(`name.ilike.${pattern},description.ilike.${pattern}`)
  const { data: groups } = await query

  const groupIds = groups?.map(g => g.id) ?? []

  const [{ data: userGroupCounts }, { data: panelCounts }] = await Promise.all([
    supabase.from('user_groups').select('group_id').in('group_id', groupIds),
    supabase.from('group_panels').select('group_id').in('group_id', groupIds),
  ])

  const memberCount = (gid: string) =>
    userGroupCounts?.filter(r => r.group_id === gid).length ?? 0
  const panelCount = (gid: string) =>
    panelCounts?.filter(r => r.group_id === gid).length ?? 0

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 animate-fade-up">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <AdminPageHeader
          title="Grupos"
          description="Organize usuários e defina quais painéis cada equipe pode acessar."
          icon={Users}
          action={(
            <Button asChild size="sm">
              <Link href="/admin/groups/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Novo grupo
              </Link>
            </Button>
          )}
        />

        <AdminListFilters search={search} filters={[]} />

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Nome', 'Descrição', 'Usuários', 'Painéis', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-mono-brand uppercase tracking-[0.15em] text-muted-foreground/50">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups?.map(g => (
              <tr
                key={g.id}
                className="transition-colors hover:bg-muted/50 border-t border-border first:border-t-0"
              >
                <td className="px-4 py-3 font-medium text-foreground">{g.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {g.description || <span className="text-muted-foreground/40">—</span>}
                </td>
                <td className="px-4 py-3 text-foreground">{memberCount(g.id)}</td>
                <td className="px-4 py-3 text-foreground">{panelCount(g.id)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/groups/${g.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Editar →
                    </Link>
                    <DeleteGroupButton groupId={g.id} memberCount={memberCount(g.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!groups || groups.length === 0) && (
          <div className="py-12 text-center text-sm text-muted-foreground/50">{search ? 'Nenhum resultado para os filtros aplicados.' : 'Nenhum grupo cadastrado.'}</div>
        )}
        </div>
      </div>
    </div>
  )
}
