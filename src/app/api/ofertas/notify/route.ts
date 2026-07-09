import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailShell, APP_URL } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { offerId } = await req.json()
  if (!offerId) return NextResponse.json({ error: 'offerId requerido' }, { status: 400 })

  const { data: offer } = await supabase
    .from('job_offers')
    .select(`id, title, description, city, province, is_urgent, company_profiles(company_name)`)
    .eq('id', offerId)
    .single()

  if (!offer) return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 })

  const province = offer.province
  const city = offer.city

  const { data: professionals } = await supabase
    .from('profiles')
    .select(`id, full_name, professional_profiles(plan)`)
    .eq('role', 'professional')
    .eq('province', province)

  if (!professionals || professionals.length === 0) {
    return NextResponse.json({ notified: 0, emailed: 0 })
  }

  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const allIds = professionals.map((p: any) => p.id)
  const emailMap = Object.fromEntries(
    (authData?.users ?? [])
      .filter(u => allIds.includes(u.id))
      .map(u => [u.id, u.email])
  )

  const companyName = (offer.company_profiles as any)?.company_name ?? 'Un centro'
  const offerUrl = `${APP_URL}/ofertas/${offer.id}`
  const urgentTag = offer.is_urgent ? '🔴 URGENTE · ' : ''
  const notifTitle = offer.is_urgent ? `🔴 Oferta urgente en ${city}` : `Nueva oferta en ${city}`
  const notifBody = `${companyName} · ${offer.title}`

  const notifInserts = professionals.map((p: any) => ({
    user_id: p.id,
    type: offer.is_urgent ? 'urgent_offer' : 'new_offer',
    title: notifTitle,
    body: notifBody,
    data: { offer_id: offer.id, url: offerUrl },
  }))

  await supabase.from('notifications').insert(notifInserts)

  const descSnippet = offer.description?.slice(0, 200) ?? ''
  let emailed = 0

  for (const prof of professionals) {
    const p = prof as any
    const email = emailMap[p.id]
    if (!email) continue

    const body = `
      ${offer.is_urgent ? `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 16px;margin-bottom:16px;display:inline-block;">
          <span style="color:#dc2626;font-weight:600;font-size:14px;">🔴 Oferta urgente</span>
        </div>
      ` : ''}
      <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">Hola ${p.full_name ?? 'profesional'},</p>
      <p style="color:#374151;font-size:16px;margin:0 0 24px;">
        Hay una nueva oferta en <strong>${city}</strong> que puede interesarte:
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:24px;">
        <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">${offer.title}</h2>
        <p style="margin:0 0 12px;color:#6b7280;font-size:14px;">
          📍 ${city}${province ? `, ${province}` : ''} · ${companyName}
        </p>
        ${descSnippet ? `<p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${descSnippet}${(offer.description?.length ?? 0) > 200 ? '...' : ''}</p>` : ''}
      </div>
      <a href="${offerUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
        Ver oferta y candidatarse →
      </a>
    `

    try {
      await sendEmail({
        to: email,
        subject: `${urgentTag}Nueva oferta en ${city}: ${offer.title}`,
        html: emailShell({
          preheader: `${companyName} busca profesionales en ${city}.`,
          body,
        }),
      })
      emailed++
    } catch (e) {
      console.error(`Error enviando a ${email}:`, e)
    }
  }

  return NextResponse.json({ notified: professionals.length, emailed, province })
}
