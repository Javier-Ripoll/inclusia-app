import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailShell, APP_URL } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { conversationId, senderName } = await req.json()
  if (!conversationId || !senderName) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  // Get conversation with both participants
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, professional_id, company_id, offer_id, job_offers(title)')
    .eq('id', conversationId)
    .single()

  if (!conv) return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })

  // Get user_ids for both participants
  const { data: profProfile } = await supabase
    .from('professional_profiles')
    .select('user_id')
    .eq('id', conv.professional_id)
    .single()

  const { data: compProfile } = await supabase
    .from('company_profiles')
    .select('user_id')
    .eq('id', conv.company_id)
    .single()

  if (!profProfile || !compProfile) {
    return NextResponse.json({ error: 'Participantes no encontrados' }, { status: 404 })
  }

  // Get last message to know who sent it
  const { data: lastMsg } = await supabase
    .from('messages')
    .select('sender_id')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!lastMsg) return NextResponse.json({ ok: true })

  // Recipient is whoever did NOT send the last message
  const recipientUserId = lastMsg.sender_id === profProfile.user_id
    ? compProfile.user_id
    : profProfile.user_id

  // Get recipient email
  const { data: authUser } = await supabase.auth.admin.getUserById(recipientUserId)
  const recipientEmail = authUser?.user?.email
  if (!recipientEmail) return NextResponse.json({ ok: true })

  const chatUrl = `${APP_URL}/dashboard/chat/${conversationId}`
  const offerTitle = (conv.job_offers as any)?.title

  const body = `
    <p style="color:#374151;font-size:16px;margin:0 0 20px;line-height:1.6;">
      Tienes un nuevo mensaje de <strong>${senderName}</strong>${offerTitle ? ` sobre la oferta <em>${offerTitle}</em>` : ''}.
    </p>
    <a href="${chatUrl}" style="display:inline-block;background:#2563eb;color:white;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
      Ver mensaje →
    </a>
  `

  try {
    await sendEmail({
      to: recipientEmail,
      subject: `Nuevo mensaje de ${senderName} en Inclusia`,
      html: emailShell({
        preheader: `${senderName} te ha enviado un mensaje en Inclusia.`,
        body,
      }),
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Error enviando notificación de mensaje:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
