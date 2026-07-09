import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const supabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Verify user is authenticated
  const serverSupabase = await createClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify user is a participant in this conversation
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, professional_id, company_id')
    .eq('id', id)
    .single()

  if (!conv) return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })

  const { data: profProfile } = await supabase
    .from('professional_profiles')
    .select('user_id')
    .eq('id', conv.professional_id)
    .single()

  const { data: compProfile } = await supabase
    .from('company_profiles')
    .select('user_id')
    .eq('id', conv.company_id)
    .single()

  const isParticipant = profProfile?.user_id === user.id || compProfile?.user_id === user.id
  if (!isParticipant) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { error } = await supabase.from('conversations').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
