import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, emailShell, APP_URL } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const since = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()

  const { data: pendingApps } = await supabase
    .from('applications')
    .select(`
      id,
      offer_id,
      job_offers!inner(id, title, company_id, status),
      professional_profiles(profiles(full_name))
    `)
    .eq('status', 'pending')
    .eq('job_offers.status', 'active')
    .gte('created_at', since)

  if (!pendingApps || pendingApps.length === 0) {
    return NextResponse.json({ emailed: 0 })
  }

  const companyMap: Record<string, { offerCount: number; pendingCount: number; offers: Record<string, { title: string; pending: number }> }> = {}

  for (const app of pendingApps) {
    const offer = app.job_offers as any
    const companyId = offer?.company_id
    if (!companyId) continue

    if (!companyMap[companyId]) {
      companyMap[companyId] = { offerCount: 0, pendingCount: 0, offers: {} }
    }

    const entry = companyMap[companyId]
    entry.pendingCount++

    if (!entry.offers[offer.id]) {
      entry.offers[offer.id] = { title: offer.title, pending: 0 }
      entry.offerCount++
    }
    entry.offers[offer.id].pending++
  }

  const companyIds = Object.keys(companyMap)

  const { data: companyProfiles } = await supabase
    .from('company_profiles')
    .select('id, user_id, company_name')
    .in('id', companyIds)

  if (!companyProfiles || companyProfiles.length === 0) {
    return NextResponse.json({ emailed: 0 })
  }

  const userIds = companyProfiles.map(c => c.user_id)
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const emailMap = Object.fromEntries(
    (authData?.users ?? [])
      .filter(u => userIds.includes(u.id))
      .map(u => [u.id, u.email])
  )

  let emailed = 0

  for (const company of companyProfiles) {
    const email = emailMap[company.user_id]
    if (!email) continue

    const data = companyMap[company.id]
    const dashboardUrl = `${APP_URL}/dashboard/ofertas`

    const offersHtml = Object.values(data.offers)
      .map(o => `<li style="margin-bottom:6px;"><strong>${o.title}</strong> — <span style="color:#2563eb;">${o.pending} candidatura${o.pending !== 1 ? 's' : ''} pendiente${o.pending !== 1 ? 's' : ''}</span></li>`)
      .join('')

    const body = `
      <p style="color:#374151;font-size:16px;margin:0 0 16px;">Hola ${company.company_name},</p>
      <p style="color:#374151;font-size:15px;margin:0 0 24px;line-height:1.6;">
        Tienes <strong>${data.pendingCount} nueva${data.pendingCount !== 1 ? 's' : ''} candidatura${data.pendingCount !== 1 ? 's' : ''}</strong> en las últimas horas. No dejes pasar a los mejores profesionales.
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-weight:600;color:#111827;">Ofertas con candidaturas pendientes:</p>
        <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
          ${offersHtml}
        </ul>
      </div>
      <a href="${dashboardUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
        Ver candidaturas →
      </a>
    `

    try {
      await sendEmail({
        to: email,
        subject: `${company.company_name}, tienes ${data.pendingCount} nueva${data.pendingCount !== 1 ? 's' : ''} candidatura${data.pendingCount !== 1 ? 's' : ''} en las últimas horas`,
        html: emailShell({ preheader: `Tienes candidaturas pendientes de revisar en Inclusia.`, body }),
      })
      emailed++
    } catch (e) {
      console.error(`Error enviando recordatorio a ${email}:`, e)
    }
  }

  return NextResponse.json({ emailed, companies: companyIds.length })
}
