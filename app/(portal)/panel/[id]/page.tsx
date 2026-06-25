import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PanelIframe } from './panel-iframe'

type Props = { params: Promise<{ id: string }> }

export default async function PanelPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's groups
  const { data: userGroups } = await supabase
    .from('user_groups')
    .select('group_id')
    .eq('user_id', user!.id)

  const groupIds = (userGroups ?? []).map(r => r.group_id)
  if (groupIds.length === 0) notFound()

  // Verify user has access to this panel
  const { data: access } = await supabase
    .from('group_panels')
    .select('panel_id')
    .eq('panel_id', id)
    .in('group_id', groupIds)
    .limit(1)
    .single()

  if (!access) notFound()

  const { data: panel } = await supabase
    .from('panels')
    .select('name, active')
    .eq('id', id)
    .single()

  if (!panel || !panel.active) notFound()

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-border bg-card flex items-center gap-2">
        <h2 className="text-sm font-medium text-foreground">{panel.name}</h2>
      </div>
      <PanelIframe panelId={id} panelName={panel.name} />
    </div>
  )
}
