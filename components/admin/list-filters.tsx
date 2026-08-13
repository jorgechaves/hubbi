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
  }} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
    <label className="grid min-w-0 flex-1 gap-1.5 text-xs font-medium text-muted-foreground">Buscar
      <Input name="q" defaultValue={search} aria-label="Buscar" placeholder="Buscar…" className="h-9 bg-background" />
    </label>
    {filters.map(filter => <label key={filter.name} className="grid gap-1.5 text-xs font-medium text-muted-foreground">{filter.label}
      <select name={filter.name} defaultValue={filter.value} className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50">
        {filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>)}
    <Button type="submit" size="sm" className="h-9">Aplicar</Button>
    {hasFilters && <Link href={pathname} className="rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Limpar filtros</Link>}
  </form>
}
