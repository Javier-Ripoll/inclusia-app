import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s/g, ''),
  },
})

export async function POST(req: NextRequest) {
  const { offerId } = await req.json()
  if (!offerId) return NextResponse.json({ error: 'offerId requerido' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get offer details + company name
  const { data: offer } = await supabase
    .from('job_offers')
    .select(`
      id, title, description, city, province, is_urgent,
      company_profiles(company_name)
    `)
    .eq('id', offerId)
    .single()

  if (!offer) return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 })

  const province = offer.province
  const city = offer.city

  // Get professionals in the same province
  const { data: professionals } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'professional')
    .eq('province', province)

  if (!professionals || professionals.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No hay profesionales en esta provincia' })
  }

  // Get emails from auth.users
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const emailMap = Object.fromEntries(
    (authData?.users ?? []).map(u => [u.id, u.email])
  )

  const recipients = professionals
    .map(p => ({ name: p.full_name, email: emailMap[p.id] }))
    .filter(r => !!r.email)

  if (recipients.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No se encontraron emails' })
  }

  const companyName = (offer.company_profiles as any)?.company_name ?? 'Un centro'
  const offerUrl = `${process.env.NEXT_PUBLIC_APP_URL}/ofertas/${offer.id}`
  const descSnippet = offer.description?.slice(0, 200) ?? ''
  const urgentTag = offer.is_urgent ? '🔴 URGENTE · ' : ''

  // Send emails in batches to avoid Gmail rate limits
  let sent = 0
  for (const recipient of recipients) {
    try {
      await transporter.sendMail({
        from: `"Inclusia" <${process.env.GMAIL_USER}>`,
        to: recipient.email!,
        subject: `${urgentTag}Nueva oferta en ${city}: ${offer.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            <div style="background: #4f46e5; padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Inclusia</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">Red de apoyo educativo</p>
            </div>

            <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              ${offer.is_urgent ? `
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 16px; margin-bottom: 20px; display: inline-block;">
                  <span style="color: #dc2626; font-weight: 600; font-size: 14px;">🔴 Oferta urgente</span>
                </div>
              ` : ''}

              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">Hola ${recipient.name ?? 'profesional'},</p>
              <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
                Hay una nueva oferta en <strong>${city}</strong> que puede interesarte:
              </p>

              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 8px; font-size: 18px; color: #111827;">${offer.title}</h2>
                <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
                  📍 ${city}${province ? `, ${province}` : ''} · ${companyName}
                </p>
                ${descSnippet ? `<p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${descSnippet}${offer.description?.length > 200 ? '...' : ''}</p>` : ''}
              </div>

              <a href="${offerUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Ver oferta y candidatarse →
              </a>

              <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                Recibes este email porque tienes un perfil en Inclusia en la provincia de ${province}.<br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/perfil" style="color: #6b7280;">Gestionar mis notificaciones</a>
              </p>
            </div>
          </div>
        `,
      })
      sent++
    } catch (e) {
      console.error(`Error enviando a ${recipient.email}:`, e)
    }
  }

  return NextResponse.json({ sent, total: recipients.length })
}
