const MAX_SEARCH_LENGTH = 120

export function parseSearch(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_SEARCH_LENGTH) : ''
}

export function parseRoleFilter(value: unknown): 'admin' | 'user' | null {
  return value === 'admin' || value === 'user' ? value : null
}

export function parseStatusFilter(value: unknown): boolean | null {
  if (value === 'active') return true
  if (value === 'inactive') return false
  return null
}

export function toSearchPattern(search: string): string | null {
  if (!search) return null
  return `%${search.replace(/[%_]/g, '\\$&')}%`
}

export function buildListQuery(values: Record<string, string>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    const normalized = value.trim()
    if (normalized) params.set(key, normalized)
  }
  return params.toString()
}
