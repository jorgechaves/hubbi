'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { createUser } from '@/app/actions/admin'
import { ArrowLeft } from 'lucide-react'

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
      else router.push('/admin/users')
    })
  }

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/users"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold">Novo usuário</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 space-y-4">
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
            <p className="text-sm text-muted-foreground/60 px-3 py-2 border border-border rounded-md">
              Nenhum grupo cadastrado
            </p>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto border border-border rounded-md p-3">
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
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Criando...' : 'Criar usuário'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
