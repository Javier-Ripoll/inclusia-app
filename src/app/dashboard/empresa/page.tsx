import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompanyProfileForm } from './company-profile-form'

export default async function CompanyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'company') redirect('/dashboard')

  const { data: companyProfile } = await supabase
    .from('company_profiles').select('*').eq('user_id', user.id).single()

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Perfil del centro</h1>
        <p className="text-muted-foreground">
          Esta información aparece en tus ofertas y es lo primero que ven los profesionales.
        </p>
      </div>
      <CompanyProfileForm profile={profile} companyProfile={companyProfile} />
    </div>
  )
}
