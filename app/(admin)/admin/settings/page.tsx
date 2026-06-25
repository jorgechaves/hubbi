'use client'

import { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { updatePortalSettings } from '@/app/actions/admin'
import { toast } from 'sonner'

type Settings = { name: string; logo_url: string | null; primary_color: string }

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.from('portal_settings').select('name,logo_url,primary_color').eq('id', 1).single()
      .then(({ data }) => setSettings(data ?? { name: 'BI Hub', logo_url: null, primary_color: '#2563EB' }))
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updatePortalSettings(formData)
      if (result?.error) toast.error(result.error)
      else toast.success('Configurações salvas!')
    })
  }

  if (!settings) return <div className="p-6 text-sm text-gray-500">Carregando...</div>

  return (
    <div className="p-6 max-w-lg space-y-6">
      <h1 className="text-xl font-semibold">Configurações do portal</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do portal</Label>
          <Input id="name" name="name" defaultValue={settings.name} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo_url">URL do logo</Label>
          <Input
            id="logo_url"
            name="logo_url"
            type="url"
            defaultValue={settings.logo_url ?? ''}
            placeholder="https://empresa.com/logo.png"
          />
          <p className="text-xs text-gray-400">Deixe em branco para exibir o nome em texto</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary_color">Cor primária</Label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              name="primary_color"
              id="primary_color"
              defaultValue={settings.primary_color}
              className="h-10 w-16 rounded border cursor-pointer"
            />
            <span className="text-sm text-gray-500">Clique para escolher a cor</span>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar configurações'}
          </Button>
        </div>
      </form>
    </div>
  )
}
