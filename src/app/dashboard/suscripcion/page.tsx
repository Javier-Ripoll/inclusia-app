import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfessionalPlans } from './professional-plans'
import { CompanyPlans } from './company-plans'
import { CheckCircle, XCircle } from 'lucide-react'

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const sp = await searchParams
  const success = sp.success === '1'
  const cancelled = sp.cancelled === '1'

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  const isProfessional = profile?.role === 'professional'

  const banner = success ? (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl px-4 py-3 mx-6 mt-6">
      <CheckCircle className="h-4 w-4 flex-shrink-0" />
      ¡Pago completado! Tu plan Premium ya está activo.
    </div>
  ) : cancelled ? (
    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-xl px-4 py-3 mx-6 mt-6">
      <XCircle className="h-4 w-4 flex-shrink-0" />
      Pago cancelado. Puedes activar Premium cuando quieras.
    </div>
  ) : null

  if (isProfessional) {
    const { data: prof } = await supabase
      .from('professional_profiles')
      .select('plan, subscription_status')
      .eq('user_id', user.id)
      .single()

    return (
      <>
        {banner}
        <ProfessionalPlans currentPlan={prof?.plan ?? 'free'} />
      </>
    )
  }

  const { data: company } = await supabase
    .from('company_profiles')
    .select('plan, subscription_status')
    .eq('user_id', user.id)
    .single()

  return (
    <>
      {banner}
      <CompanyPlans currentPlan={company?.plan ?? 'basic'} />
    </>
  )
}
