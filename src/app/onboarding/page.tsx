import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingWizard } from './onboarding-wizard'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  const isProfessional = profile.role === 'professional'

  if (isProfessional) {
    const { data: prof } = await supabase
      .from('professional_profiles')
      .select('id, bio, specializations, years_experience, availabilities')
      .eq('user_id', user.id)
      .single()

    return (
      <OnboardingWizard
        role="professional"
        name={profile.full_name ?? ''}
        professionalProfileId={prof?.id ?? null}
        initialData={{
          bio: prof?.bio ?? '',
          specializations: prof?.specializations ?? [],
          years_experience: prof?.years_experience ?? 0,
          availabilities: prof?.availabilities ?? [],
        }}
      />
    )
  }

  const { data: company } = await supabase
    .from('company_profiles')
    .select('id, company_name, company_type, description')
    .eq('user_id', user.id)
    .single()

  const { data: baseProfile } = await supabase
    .from('profiles')
    .select('city, province, phone')
    .eq('id', user.id)
    .single()

  return (
    <OnboardingWizard
      role="company"
      name={profile.full_name ?? ''}
      companyProfileId={company?.id ?? null}
      initialData={{
        company_name: company?.company_name ?? '',
        company_type: company?.company_type ?? '',
        description: company?.description ?? '',
        city: (baseProfile as any)?.city ?? '',
        province: (baseProfile as any)?.province ?? '',
        phone: (baseProfile as any)?.phone ?? '',
      }}
    />
  )
}
