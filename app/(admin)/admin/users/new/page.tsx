'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { createUser } from '@/app/actions/admin'
import { AdminPageHeader } from '@/components/admin/page-header'
import { toast } from 'sonner'

type Group = { id: string; name: string }

export default function NewUserPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  useEffect(() => {
    createClient().from('groups').select('id,name').order('name').then(({ data }) => {
      setGroups(data ?? [])
    })
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    selectedGroups.forEach(gid => formData.append('group_ids', gid))
    setError(null)
    startTransition(async () => {
      const result = await createUser(formData)
      if (result?.error) setError(result.error)
      else { toast.success('Usuário criado.'); router.push('/admin/users') }
    })
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <AdminPageHeader
          title="Novo usuário"
          description="Crie uma conta e associe-a aos grupos de acesso."
          backHref="/admin/users"
        />

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha temporária</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select name="role" defaultValue="user">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Grupos</Label>
          {groups.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
              Nenhum grupo cadastrado
            </p>
          ) : (
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border bg-background p-3">
              {groups.map(g => (
                <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selectedGroups.includes(g.id)}
                    onChange={e =>
                      setSelectedGroups(prev =>
                        e.target.checked ? [...prev, g.id] : prev.filter(x => x !== g.id)
                      )
                    }
                  />
                  {g.name}
                </label>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Criando...' : 'Criar usuário'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
      </div>
    </div>
  )
}
