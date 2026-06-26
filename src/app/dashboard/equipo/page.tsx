import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeamClient } from './team-client'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'company') redirect('/dashboard')

  const { data: company } = await supabase
    .from('company_profiles')
    .select('id, company_name, plan')
    .eq('user_id', user.id)
    .single()

  if (!company) redirect('/dashboard')

  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  return <TeamClient companyId={company.id} companyName={company.company_name} members={members ?? []} />
}
