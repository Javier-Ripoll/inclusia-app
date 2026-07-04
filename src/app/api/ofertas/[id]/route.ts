import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getCompanyId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('company_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()
  return data?.id ?? null
}

// PATCH — update status (close / reopen)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const companyId = await getCompanyId(supabase, user.id)
  if (!companyId) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { status } = await req.json()
  if (!['active', 'cancelled', 'covered'].includes(status)) {
    return NextResponse.json({ error: 'Estado no válido' }, { status: 400 })
  }

  const { error } = await supabase
    .from('job_offers')
    .update({ status })
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// DELETE — delete offer
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const companyId = await getCompanyId(supabase, user.id)
  if (!companyId) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { error } = await supabase
    .from('job_offers')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    console.error('Error deleting offer:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
