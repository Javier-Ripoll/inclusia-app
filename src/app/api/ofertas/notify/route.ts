import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

  // Get offer details + company name
  const { data: offer } = await supabase
    .from('job_offers')
    .select(`id, title, description, city, province, is_urgent, company_profiles(company_name)`)
    .eq('id', offerId)
    .single()

  if (!offer) return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 })

  const province = offer.province
  const city = offer.city

  // Get all professionals in the same province with their plan
  const { data: professionals } = await supabase
    .from('profiles')
    .select(`id, full_name, professional_profiles(plan)`)
    .eq('role', 'professional')
    .eq('province', province)

  if (!professionals || professionals.length === 0) {
    return NextResponse.json({ notified: 0, emailed: 0 })
  }

  // Get emails from auth.users for premium professionals
  const premiumIds = professionals
    .filter((p: any) => p.professional_profiles?.plan === 'premium')
    .map((p: any) => p.id)

  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const emailMap = Object.fromEntries(
    (authData?.users ?? [])
      .filter(u => premiumIds.includes(u.id))
      .map(u => [u.id, u.email])
  )

  const companyName = (offer.company_profiles as any)?.company_name ?? 'Un centro'
  const offerUrl = `${process.env.NEXT_PUBLIC_APP_URL}/ofertas/${offer.id}`
  const urgentTag = offer.is_urgent ? '🔴 URGENTE · ' : ''
  const notifTitle = offer.is_urgent
    ? `🔴 Oferta urgente en ${city}`
    : `Nueva oferta en ${city}`
  const notifBody = `${companyName} · ${offer.title}`

  // 1. In-app notification for ALL professionals in the province
  const notifInserts = professionals.map((p: any) => ({
    user_id: p.id,
    type: offer.is_urgent ? 'urgent_offer' : 'new_offer',
    title: notifTitle,
    body: notifBody,
    data: { offer_id: offer.id, url: offerUrl },
  }))

  await supabase.from('notifications').insert(notifInserts)

  // 2. Email only for PREMIUM professionals
  const descSnippet = offer.description?.slice(0, 200) ?? ''
  let emailed = 0

  for (const prof of professionals) {
    const p = prof as any
    if (p.professional_profiles?.plan !== 'premium') continue
    const email = emailMap[p.id]
    if (!email) continue

    try {
      await transporter.sendMail({
        from: `"Inclusia" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `${urgentTag}Nueva oferta en ${city}: ${offer.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            <div style="background: #4f46e5; padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Inclusia</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">Alerta Premium · Red de apoyo educativo</p>
            </div>

            <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 10px 16px; margin-bottom: 20px; display: inline-block;">
                <span style="color: #92400e; font-weight: 600; font-size: 13px;">⭐ Alerta exclusiva Premium — acceso anticipado</span>
              </div>

              ${offer.is_urgent ? `
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 16px; margin-bottom: 16px; display: inline-block;">
                  <span style="color: #dc2626; font-weight: 600; font-size: 14px;">🔴 Oferta urgente</span>
                </div>
              ` : ''}

              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">Hola ${p.full_name ?? 'profesional'},</p>
              <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
                Hay una nueva oferta en <strong>${city}</strong> que puede interesarte:
              </p>

              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 8px; font-size: 18px; color: #111827;">${offer.title}</h2>
                <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
                  📍 ${city}${province ? `, ${province}` : ''} · ${companyName}
                </p>
                ${descSnippet ? `<p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${descSnippet}${(offer.description?.length ?? 0) > 200 ? '...' : ''}</p>` : ''}
              </div>

              <a href="${offerUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Ver oferta y candidatarse →
              </a>

              <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                Recibes este email por ser usuario Premium de Inclusia en la provincia de ${province}.<br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/perfil" style="color: #6b7280;">Gestionar mi perfil</a>
              </p>
            </div>
          </div>
        `,
      })
      emailed++
    } catch (e) {
      console.error(`Error enviando a ${email}:`, e)
    }
  }

  return NextResponse.json({
    notified: professionals.length,
    emailed,
    province,
  })
}
