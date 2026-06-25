import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Get user groups
  const { data: userGroups } = await supabase
    .from('user_groups')
    .select('group_id')
    .eq('user_id', user.id)

  const groupIds = (userGroups ?? []).map(r => r.group_id)
  if (groupIds.length === 0) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Verify access
  const { data: access } = await supabase
    .from('group_panels')
    .select('panel_id')
    .eq('panel_id', id)
    .in('group_id', groupIds)
    .limit(1)
    .single()

  if (!access) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Get panel URL
  const { data: panel } = await supabase
    .from('panels')
    .select('url, active')
    .eq('id', id)
    .single()

  if (!panel || !panel.active) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Log access using service role (bypasses RLS on access_logs)
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  await serviceClient.from('access_logs').insert({ user_id: user.id, panel_id: id })

  return NextResponse.redirect(panel.url, { status: 302 })
}
