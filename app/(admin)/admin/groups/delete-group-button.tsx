'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteGroup } from '@/app/actions/admin'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type Props = { groupId: string; memberCount: number }

export function DeleteGroupButton({ groupId, memberCount }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    const message = memberCount > 0
      ? `Este grupo tem ${memberCount} usuário(s) associado(s). Deseja excluir mesmo assim?`
      : 'Tem certeza que deseja excluir este grupo?'

    if (!confirm(message)) return

    startTransition(async () => {
      const result = await deleteGroup(groupId)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Grupo excluído.')
      router.refresh()
    })
  }

  return (
    <Button variant="ghost" size="sm" disabled={isPending} onClick={handleDelete}>
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  )
}
