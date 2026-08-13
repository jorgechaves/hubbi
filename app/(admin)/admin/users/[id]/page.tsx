'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateUser } from '@/app/actions/admin'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { AdminPageHeader } from '@/components/admin/page-header'

type Profile = { id: string; name: string; email: string; role: string; active: boolean }
type Group   = { id: string; name: string }

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [groups,   setGroups]   = useState<Group[]>([])
  const [userGroups, setUserGroups] = useState<string[]>([])
  const [error,    setError]    = useState<string | null>(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
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
      const result = await updateUser(id, formData) as { error?: string; success?: boolean; passwordChanged?: boolean }
      if (result?.error) setError(result.error)
      else {
        toast.success(result.passwordChanged ? 'Usuário atualizado. Senha temporária redefinida.' : 'Usuário atualizado.')
        router.push('/admin/users')
      }
    })
  }

  if (!profile) return <div className="p-4 text-sm text-muted-foreground sm:p-6">Carregando...</div>

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <AdminPageHeader
          title="Editar usuário"
          description="Atualize os dados, perfil, grupos e status de acesso."
          backHref="/admin/users"
        />

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={profile.email} disabled className="bg-muted" />
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
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border bg-background p-3">
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

        <div className="space-y-3 rounded-lg border border-border bg-background/60 p-3">
          <button
            type="button"
            onClick={() => setShowPasswordReset(value => !value)}
            className="flex w-full items-center gap-2 text-sm font-medium text-foreground"
            aria-expanded={showPasswordReset}
          >
            <KeyRound className="h-4 w-4" />
            Redefinir senha temporária
          </button>
          {showPasswordReset && <>
            <div className="space-y-2">
              <Label htmlFor="temporary_password">Nova senha temporária</Label>
              <Input id="temporary_password" name="temporary_password" type="password" minLength={8} autoComplete="new-password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirmar nova senha</Label>
              <Input id="password_confirmation" name="password_confirmation" type="password" minLength={8} autoComplete="new-password" required />
            </div>
          </>}
        </div>

        {error && <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
      </div>
    </div>
  )
}
