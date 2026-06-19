import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

const ADMIN_EMAIL = 'javier2003.jr@gmail.com'

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
  const serverSupabase = await createServerClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const allUsers = authData?.users ?? []

  const userIds = allUsers.map(u => u.id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('id', userIds)

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  let emailed = 0

  for (const user of allUsers) {
    const email = user.email
    const profile = profileMap[user.id]
    if (!email || !profile || profile.role === null) continue

    const name = profile.full_name ?? (profile.role === 'professional' ? 'profesional' : 'centro')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    try {
      await transporter.sendMail({
        from: `"Inclusia" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `🎉 ¡Ya somos más de 300 en Inclusia!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            <div style="background: #4f46e5; padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Inclusia</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">Red de apoyo educativo</p>
            </div>

            <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <div style="text-align: center; margin-bottom: 28px;">
                <p style="font-size: 48px; margin: 0;">🎉</p>
                <h2 style="font-size: 24px; font-weight: 700; color: #111827; margin: 12px 0 4px;">¡Ya somos más de 300!</h2>
                <p style="color: #6b7280; font-size: 15px; margin: 0;">Y esto es solo el principio</p>
              </div>

              <p style="color: #374151; font-size: 15px; margin: 0 0 16px; line-height: 1.7;">Hola ${name},</p>

              <p style="color: #374151; font-size: 15px; margin: 0 0 16px; line-height: 1.7;">
                Queríamos compartir contigo una noticia que nos llena de orgullo: <strong>Inclusia ya cuenta con más de 300 profesionales y centros registrados</strong>.
              </p>

              <p style="color: #374151; font-size: 15px; margin: 0 0 16px; line-height: 1.7;">
                Hace poco más que empezamos y ya somos una comunidad real de profesionales del apoyo educativo — logopedas, PATI, terapeutas ocupacionales, integradores sociales, psicólogos — y los centros que los necesitan.
              </p>

              <div style="background: #f0f0ff; border-left: 4px solid #4f46e5; border-radius: 4px; padding: 16px 20px; margin: 24px 0;">
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7;">
                  Gracias por ser parte de esto desde el principio. Cada perfil creado, cada oferta publicada y cada candidatura enviada hace que Inclusia sea más útil para todos.
                </p>
              </div>

              <p style="color: #374151; font-size: 15px; margin: 0 0 24px; line-height: 1.7;">
                Seguimos trabajando para hacer la plataforma mejor cada día. Si tienes alguna sugerencia o necesitas ayuda, responde a este correo — leemos todo.
              </p>

              <div style="text-align: center;">
                <a href="${appUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                  Entrar a Inclusia →
                </a>
              </div>

              <p style="margin: 32px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.6; text-align: center;">
                El equipo de Inclusia · <a href="${appUrl}" style="color: #6b7280;">inclusiajobs.com</a>
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

  return NextResponse.json({ emailed })
}
