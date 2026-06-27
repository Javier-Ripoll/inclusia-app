import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { ChatWindow } from './chat-window'

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Load conversation + participants
  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, offer_id, job_offers ( title ), company_profiles ( id, company_name ), professional_profiles ( id )')
    .eq('id', id)
    .single()

  if (!conversation) notFound()

  const [{ data: messages }, { data: profile }] = await Promise.all([
    supabase.from('messages').select('id, content, sender_id, created_at, read_at').eq('conversation_id', id).order('created_at', { ascending: true }),
    supabase.from('profiles').select('role, full_name').eq('id', user.id).single(),
  ])

  const isProfessional = profile?.role === 'professional'
  const company = (conversation as any).company_profiles
  const prof = (conversation as any).professional_profiles

  // Fetch professional name via service role
  let profName = 'Profesional'
  if (prof?.id) {
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: profData } = await serviceSupabase
      .from('professional_profiles')
      .select('profiles(full_name)')
      .eq('id', prof.id)
      .single()
    const profProfiles = Array.isArray(profData?.profiles) ? profData.profiles[0] : profData?.profiles
    profName = profProfiles?.full_name ?? 'Profesional'
  }

  const otherName = isProfessional ? company?.company_name ?? 'Centro' : profName
  const offerTitle = (conversation as any).job_offers?.title

  return (
    <ChatWindow
      conversationId={id}
      currentUserId={user.id}
      currentUserName={profile?.full_name ?? 'Tú'}
      otherName={otherName}
      offerTitle={offerTitle}
      initialMessages={messages ?? []}
    />
  )
}
