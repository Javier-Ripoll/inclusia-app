import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditOfferForm } from './edit-offer-form'

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: company } = await supabase
    .from('company_profiles').select('id').eq('user_id', user.id).single()
  if (!company) redirect('/dashboard')

  const { data: offer } = await supabase
    .from('job_offers')
    .select('*')
    .eq('id', id)
    .eq('company_id', company.id)
    .single()

  if (!offer) notFound()

  return <EditOfferForm offer={offer} />
}
