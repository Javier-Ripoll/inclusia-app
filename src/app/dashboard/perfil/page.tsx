import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfessionalProfileForm } from './profile-form'
import { BackButton } from '@/components/ui/back-button'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: professionalProfile }, { data: education }, { data: experience }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('professional_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('professional_education').select('*')
        .eq('professional_id', (await supabase.from('professional_profiles').select('id').eq('user_id', user.id).single()).data?.id ?? '')
        .order('year_completed', { ascending: false }),
      supabase.from('professional_experience').select('*')
        .eq('professional_id', (await supabase.from('professional_profiles').select('id').eq('user_id', user.id).single()).data?.id ?? '')
        .order('start_date', { ascending: false }),
    ])

  if (profile?.role !== 'professional') redirect('/dashboard')

  // Generate signed URL for CV if exists (bucket is private)
  let cvSignedUrl: string | null = null
  if (professionalProfile?.cv_url) {
    const { data } = await supabase.storage
      .from('cvs')
      .createSignedUrl(professionalProfile.cv_url, 60 * 60 * 24) // 24h
    cvSignedUrl = data?.signedUrl ?? null
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <BackButton href="/dashboard" label="Panel" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">Cuanto más completo esté tu perfil, más visible serás para los centros.</p>
      </div>
      <ProfessionalProfileForm
        profile={profile}
        professionalProfile={professionalProfile}
        education={education ?? []}
        experience={experience ?? []}
        cvUrl={cvSignedUrl}
      />
    </div>
  )
}
