'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { deleteUser } from '@/app/actions/admin'

export function DeleteUserButton({ userId, name, email }: { userId: string; name: string; email: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Excluir ${name || 'este usuário'} (${email})?`)) return

    startTransition(async () => {
      const result = await deleteUser(userId)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Usuário excluído.')
      router.refresh()
    })
  }

  return (
    <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={handleDelete} aria-label={`Excluir ${name || email}`}>
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  )
}
