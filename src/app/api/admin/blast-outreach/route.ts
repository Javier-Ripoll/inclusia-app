import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { sendEmail, emailShell, APP_URL } from '@/lib/email'

const ADMIN_EMAIL = 'javier2003.jr@gmail.com'

export async function POST(req: NextRequest) {
  const serverSupabase = await createServerClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { emails, subject, message } = await req.json()

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ error: 'Lista de emails vacía' }, { status: 400 })
  }
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Asunto y mensaje son obligatorios' }, { status: 400 })
  }
  if (emails.length > 150) {
    return NextResponse.json({ error: 'Máximo 150 emails por envío' }, { status: 400 })
  }

  const body = `
    <p style="color:#374151;font-size:16px;margin:0 0 20px;line-height:1.7;">${message.replace(/\n/g, '<br/>')}</p>
    <a href="${APP_URL}" style="display:inline-block;background:#2563eb;color:white;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
      Conocer Inclusia →
    </a>
    <p style="margin:28px 0 0;color:#9ca3af;font-size:12px;line-height:1.6;">
      Si no deseas recibir más emails de nuestra parte, responde a este mensaje con "Dar de baja".
    </p>
  `

  let sent = 0
  const failed: string[] = []

  for (const email of emails) {
    try {
      await sendEmail({
        to: email.trim(),
        subject: subject.trim(),
        html: emailShell({
          preheader: subject.trim(),
          body,
        }),
      })
      sent++
      // Small delay to stay within Resend rate limits
      await new Promise(r => setTimeout(r, 100))
    } catch (e: any) {
      console.error(`Error enviando a ${email}:`, e)
      failed.push(email)
    }
  }

  return NextResponse.json({ sent, failed, total: emails.length })
}
