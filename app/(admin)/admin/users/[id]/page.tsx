'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateUser } from '@/app/actions/admin'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

type Profile = { id: string; name: string; email: string; role: string; active: boolean }
type Group   = { id: string; name: string }

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [groups,   setGroups]   = useState<Group[]>([])
  const [userGroups, setUserGroups] = useState<string[]>([])
  const [error,    setError]    = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('profiles').select('id,name,email,role,active').eq('id', id).single(),
      supabase.from('groups').select('id,name').order('name'),
      supabase.from('user_groups').select('group_id').eq('user_id', id),
    ]).then(([p, g, ug]) => {
      setProfile(p.data)
      setGroups(g.data ?? [])
      setUserGroups((ug.data ?? []).map((r: { group_id: string }) => r.group_id))
    })
  }, [id])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    userGroups.forEach(gid => formData.append('group_ids', gid))
    setError(null)
    startTransition(async () => {
      const result = await updateUser(id, formData) as { error?: string; success?: boolean }
      if (result?.error) setError(result.error)
      else router.push('/admin/users')
    })
  }

  if (!profile) return <div className="p-6 text-sm text-gray-500">Carregando...</div>

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/users"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold">Editar usuário</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={profile.email} disabled className="bg-gray-50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" defaultValue={profile.name} required />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select name="role" defaultValue={profile.role}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select name="active" defaultValue={String(profile.active)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Ativo</SelectItem>
              <SelectItem value="false">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Grupos</Label>
          <div className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-3">
            {groups.map(g => (
              <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={userGroups.includes(g.id)}
                  onChange={e =>
                    setUserGroups(prev =>
                      e.target.checked ? [...prev, g.id] : prev.filter(x => x !== g.id)
                    )
                  }
                />
                {g.name}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
