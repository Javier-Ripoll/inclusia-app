import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatWindow } from './chat-window'

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Load conversation + participants
  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      id, offer_id,
      job_offers ( title ),
      company_profiles ( id, company_name ),
      professional_profiles ( id, profiles ( full_name ) )
    `)
    .eq('id', id)
    .single()

  if (!conversation) notFound()

  // Load initial messages
  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, sender_id, created_at, read_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()

  const isProfessional = profile?.role === 'professional'
  const company = (conversation as any).company_profiles
  const prof = (conversation as any).professional_profiles
  const otherName = isProfessional
    ? company?.company_name ?? 'Centro'
    : prof?.profiles?.full_name ?? 'Profesional'
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
