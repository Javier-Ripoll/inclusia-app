import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { offerId, status } = await req.json()
  if (!offerId || !['active', 'cancelled', 'covered'].includes(status)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  // Verify the offer belongs to this company
  const { data: company } = await supabase.from('company_profiles').select('id').eq('user_id', user.id).single()
  if (!company) return NextResponse.json({ error: 'Not a company' }, { status: 403 })

  const { error } = await supabase
    .from('job_offers')
    .update({ status })
    .eq('id', offerId)
    .eq('company_id', company.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
