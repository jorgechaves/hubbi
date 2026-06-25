'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { togglePanelStatus } from '@/app/actions/admin'

type Panel = { id: string; name: string; description: string | null; active: boolean }

export default function PanelsPage() {
  const [panels, setPanels] = useState<Panel[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.from('panels').select('id,name,description,active').order('name').then(({ data }) => {
      setPanels(data ?? [])
    })
  }, [])

  function handleToggle(panelId: string, active: boolean) {
    startTransition(async () => {
      await togglePanelStatus(panelId, active)
      setPanels(prev => prev.map(p => p.id === panelId ? { ...p, active } : p))
    })
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Painéis</h1>
        <Button asChild size="sm">
          <Link href="/admin/panels/new"><Plus className="h-4 w-4 mr-1" />Novo painel</Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {panels.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-gray-500 text-sm">{p.description || '—'}</TableCell>
                <TableCell>
                  <button
                    onClick={() => handleToggle(p.id, !p.active)}
                    disabled={isPending}
                    className="focus:outline-none"
                  >
                    <Badge variant={p.active ? 'outline' : 'secondary'} className="cursor-pointer">
                      {p.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/panels/${p.id}`}>Editar</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
