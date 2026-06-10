import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfessionalPlans } from './professional-plans'
import { CompanyPlans } from './company-plans'

export default async function SuscripcionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  const isProfessional = profile?.role === 'professional'

  if (isProfessional) {
    const { data: prof } = await supabase
      .from('professional_profiles')
      .select('plan, subscription_status')
      .eq('user_id', user.id)
      .single()

    return <ProfessionalPlans currentPlan={prof?.plan ?? 'free'} />
  }

  const { data: company } = await supabase
    .from('company_profiles')
    .select('plan, subscription_status')
    .eq('user_id', user.id)
    .single()

  return <CompanyPlans currentPlan={company?.plan ?? 'basic'} />
}
