type SiteUrlOptions = {
  configuredUrl?: string | null
  origin?: string | null
  forwardedHost?: string | null
  forwardedProto?: string | null
}

function normalizeUrl(value: string | null | undefined): string | null {
  const candidate = value?.trim()
  if (!candidate) return null

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString().replace(/\/+$/, '')
  } catch {
    return null
  }
}

function firstHeaderValue(value: string | null | undefined): string | null {
  return value?.split(',')[0]?.trim() || null
}

export function resolveSiteUrl({
  configuredUrl,
  origin,
  forwardedHost,
  forwardedProto,
}: SiteUrlOptions): string {
  return (
    normalizeUrl(configuredUrl) ??
    normalizeUrl(origin) ??
    normalizeUrl(`${firstHeaderValue(forwardedProto) || 'http'}://${firstHeaderValue(forwardedHost) || ''}`) ??
    'http://localhost:3000'
  )
}
