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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only look at applications created in the last 3 hours
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

  // Group by company_id
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

  // Get company profiles and user IDs
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
    const offersHtml = Object.values(data.offers)
      .map(o => `<li style="margin-bottom:6px;"><strong>${o.title}</strong> — <span style="color:#4f46e5;">${o.pending} candidatura${o.pending !== 1 ? 's' : ''} pendiente${o.pending !== 1 ? 's' : ''}</span></li>`)
      .join('')

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ofertas`

    try {
      await transporter.sendMail({
        from: `"Inclusia" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `${company.company_name}, tienes ${data.pendingCount} nueva${data.pendingCount !== 1 ? 's' : ''} candidatura${data.pendingCount !== 1 ? 's' : ''} en las últimas horas`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            <div style="background: #4f46e5; padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Inclusia</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">Red de apoyo educativo</p>
            </div>

            <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 16px;">Hola ${company.company_name},</p>

              <p style="color: #374151; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
                Tienes <strong>${data.pendingCount} nueva${data.pendingCount !== 1 ? 's' : ''} candidatura${data.pendingCount !== 1 ? 's' : ''}</strong> en las últimas horas. No dejes pasar a los mejores profesionales.
              </p>

              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px; font-weight: 600; color: #111827;">Ofertas con candidaturas pendientes:</p>
                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                  ${offersHtml}
                </ul>
              </div>

              <a href="${dashboardUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Ver candidaturas →
              </a>

              <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                Recibes este recordatorio cada 3 días mientras tengas candidaturas pendientes.<br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #6b7280;">inclusiajobs.com</a>
              </p>
            </div>
          </div>
        `,
      })
      emailed++
    } catch (e) {
      console.error(`Error enviando recordatorio a ${email}:`, e)
    }
  }

  return NextResponse.json({ emailed, companies: companyIds.length })
}
