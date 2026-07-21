'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { buildListQuery } from '@/lib/admin/list-query'

type Filter = { name: 'role' | 'status'; label: string; value: string; options: Array<{ value: string; label: string }> }

export function AdminListFilters({ search, filters }: { search: string; filters: Filter[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const hasFilters = Boolean(search || filters.some(filter => filter.value))

  return <form action={(formData) => {
    const values = Object.fromEntries(['q', ...filters.map(filter => filter.name)].map(name => [name, String(formData.get(name) ?? '')]))
    const query = buildListQuery(values)
    router.replace(query ? `${pathname}?${query}` : pathname)
  }} className="flex flex-wrap items-end gap-3">
    <label className="grid gap-1 text-xs text-muted-foreground">Buscar
      <Input name="q" defaultValue={search} aria-label="Buscar" placeholder="Buscar…" className="w-64" />
    </label>
    {filters.map(filter => <label key={filter.name} className="grid gap-1 text-xs text-muted-foreground">{filter.label}
      <select name={filter.name} defaultValue={filter.value} className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm">
        {filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>)}
    <Button type="submit" size="sm">Aplicar</Button>
    {hasFilters && <Link href={pathname} className="text-sm text-muted-foreground hover:text-foreground">Limpar filtros</Link>}
  </form>
}
