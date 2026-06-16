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

function isProfessionalComplete(prof: any, profile: any): boolean {
  return !!(
    profile?.full_name &&
    profile?.phone &&
    profile?.city &&
    prof?.bio &&
    prof?.specializations?.length > 0 &&
    prof?.availabilities?.length > 0 &&
    prof?.years_experience > 0
    // Note: education and experience lists require separate queries; skipping here for simplicity
    // The email will still be triggered if any of the above are missing
  )
}

function isCompanyComplete(company: any, profile: any): boolean {
  return !!(
    company?.company_name &&
    company?.company_type &&
    company?.description &&
    profile?.city &&
    profile?.phone
  )
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const from = new Date(now.getTime() - 25 * 60 * 60 * 1000) // 25h ago
  const to = new Date(now.getTime() - 23 * 60 * 60 * 1000)   // 23h ago

  // Get users registered in the 23-25h window
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const targetUsers = (authData?.users ?? []).filter(u => {
    const created = new Date(u.created_at)
    return created >= from && created <= to
  })

  if (targetUsers.length === 0) {
    return NextResponse.json({ checked: 0, emailed: 0 })
  }

  const userIds = targetUsers.map(u => u.id)
  const emailMap = Object.fromEntries(targetUsers.map(u => [u.id, u.email]))

  // Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, phone, city, role')
    .in('id', userIds)

  const { data: professionalProfiles } = await supabase
    .from('professional_profiles')
    .select('user_id, bio, specializations, availabilities, years_experience')
    .in('user_id', userIds)

  const { data: companyProfiles } = await supabase
    .from('company_profiles')
    .select('user_id, company_name, company_type, description')
    .in('user_id', userIds)

  const profMap = Object.fromEntries((professionalProfiles ?? []).map(p => [p.user_id, p]))
  const compMap = Object.fromEntries((companyProfiles ?? []).map(c => [c.user_id, c]))
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  let emailed = 0

  for (const user of targetUsers) {
    const profile = profileMap[user.id]
    const email = emailMap[user.id]
    if (!email || !profile) continue

    const role = profile.role
    let isComplete = false

    if (role === 'professional') {
      isComplete = isProfessionalComplete(profMap[user.id], profile)
    } else if (role === 'company') {
      isComplete = isCompanyComplete(compMap[user.id], profile)
    } else {
      continue
    }

    if (isComplete) continue

    const name = profile.full_name ?? (role === 'professional' ? 'profesional' : 'centro')
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/perfil`
    const isCompany = role === 'company'

    try {
      await transporter.sendMail({
        from: `"Inclusia" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `${name}, completa tu perfil en Inclusia y empieza a destacar`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            <div style="background: #4f46e5; padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Inclusia</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">Red de apoyo educativo</p>
            </div>

            <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 16px;">Hola ${name},</p>

              <p style="color: #374151; font-size: 15px; margin: 0 0 16px; line-height: 1.6;">
                Notamos que todavía no has completado tu perfil en Inclusia.
                ${isCompany
                  ? 'Los centros con el perfil completo reciben más y mejores candidaturas de profesionales cualificados.'
                  : 'Los profesionales con el perfil completo tienen <strong>5 veces más visibilidad</strong> ante los centros y aparecen antes en los resultados.'}
              </p>

              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-weight: 600; color: #111827;">¿Qué te falta completar?</p>
                <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 2;">
                  ${isCompany ? `
                    <li>Nombre y tipo de centro</li>
                    <li>Descripción del centro</li>
                    <li>Ciudad y teléfono de contacto</li>
                  ` : `
                    <li>Foto y datos de contacto</li>
                    <li>Biografía profesional</li>
                    <li>Especializaciones y disponibilidad</li>
                    <li>Formación y experiencia laboral</li>
                  `}
                </ul>
              </div>

              <a href="${dashboardUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Completar mi perfil →
              </a>

              <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                Recibes este email porque te registraste ayer en inclusiajobs.com.<br>
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

  return NextResponse.json({ checked: targetUsers.length, emailed })
}
