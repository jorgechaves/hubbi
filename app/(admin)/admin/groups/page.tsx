import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'
import { DeleteGroupButton } from './delete-group-button'

export default async function GroupsPage() {
  const supabase = await createClient()

  const { data: groups } = await supabase
    .from('groups')
    .select('id, name, description, created_at')
    .order('name')

  // Count members and panels per group
  const groupIds = groups?.map(g => g.id) ?? []

  const [{ data: userGroupCounts }, { data: panelCounts }] = await Promise.all([
    supabase.from('user_groups').select('group_id').in('group_id', groupIds),
    supabase.from('group_panels').select('group_id').in('group_id', groupIds),
  ])

  const memberCount = (gid: string) =>
    userGroupCounts?.filter(r => r.group_id === gid).length ?? 0
  const panelCount  = (gid: string) =>
    panelCounts?.filter(r => r.group_id === gid).length ?? 0

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Grupos</h1>
        <Button asChild size="sm">
          <Link href="/admin/groups/new"><Plus className="h-4 w-4 mr-1" />Novo grupo</Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Usuários</TableHead>
              <TableHead>Painéis</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups?.map(g => (
              <TableRow key={g.id}>
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell className="text-gray-500 text-sm">{g.description || '—'}</TableCell>
                <TableCell>{memberCount(g.id)}</TableCell>
                <TableCell>{panelCount(g.id)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/groups/${g.id}`}>Editar</Link>
                    </Button>
                    <DeleteGroupButton groupId={g.id} memberCount={memberCount(g.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
