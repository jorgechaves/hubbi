import { createClient } from '@/lib/supabase/server'

export type PortalSettings = {
  name: string
  logo_url: string | null
  primary_color: string
}

const defaults: PortalSettings = {
  name: 'BI Hub',
  logo_url: null,
  primary_color: '#2563EB',
}

export async function getPortalSettings(): Promise<PortalSettings> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('portal_settings')
      .select('name, logo_url, primary_color')
      .eq('id', 1)
      .single()

    return data ?? defaults
  } catch {
    return defaults
  }
}
