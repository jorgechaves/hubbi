import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'
import { DeleteGroupButton } from './delete-group-button'

export default async function GroupsPage() {
  const supabase = await createClient()

  const { data: groups } = await supabase
    .from('groups')
    .select('id, name, description, created_at')
    .order('name')

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
    <div className="p-8 space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-mono-brand uppercase tracking-[0.2em] text-muted-foreground/50">Admin</p>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Grupos
          </h1>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/groups/new">
            <Plus className="h-4 w-4 mr-1" />Novo grupo
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
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
          <div className="py-12 text-center text-sm text-muted-foreground/50">Nenhum grupo cadastrado.</div>
        )}
      </div>
    </div>
  )
}
