import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { sendEmail, emailShell, APP_URL } from '@/lib/email'

const ADMIN_EMAIL = 'javier2003.jr@gmail.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

  for (const u of allUsers) {
    const email = u.email
    const profile = profileMap[u.id]
    if (!email || !profile || profile.role === null) continue

    const name = profile.full_name ?? (profile.role === 'professional' ? 'profesional' : 'centro')

    const body = `
      <div style="text-align:center;margin-bottom:28px;">
        <p style="font-size:48px;margin:0;">🎉</p>
        <h2 style="font-size:24px;font-weight:700;color:#111827;margin:12px 0 4px;">¡Ya somos más de 300!</h2>
        <p style="color:#6b7280;font-size:15px;margin:0;">Y esto es solo el principio</p>
      </div>
      <p style="color:#374151;font-size:15px;margin:0 0 16px;line-height:1.7;">Hola ${name},</p>
      <p style="color:#374151;font-size:15px;margin:0 0 16px;line-height:1.7;">
        Queríamos compartir contigo una noticia que nos llena de orgullo: <strong>Inclusia ya cuenta con más de 300 profesionales y centros registrados</strong>.
      </p>
      <p style="color:#374151;font-size:15px;margin:0 0 16px;line-height:1.7;">
        Hace poco más que empezamos y ya somos una comunidad real de profesionales del apoyo educativo — logopedas, PATI, terapeutas ocupacionales, integradores sociales, psicólogos — y los centros que los necesitan.
      </p>
      <div style="background:#f0f0ff;border-left:4px solid #4f46e5;border-radius:4px;padding:16px 20px;margin:24px 0;">
        <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">
          Gracias por ser parte de esto desde el principio. Cada perfil creado, cada oferta publicada y cada candidatura enviada hace que Inclusia sea más útil para todos.
        </p>
      </div>
      <p style="color:#374151;font-size:15px;margin:0 0 24px;line-height:1.7;">
        Seguimos trabajando para hacer la plataforma mejor cada día. Si tienes alguna sugerencia o necesitas ayuda, responde a este correo — leemos todo.
      </p>
      <div style="text-align:center;">
        <a href="${APP_URL}" style="display:inline-block;background:#2563eb;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
          Entrar a Inclusia →
        </a>
      </div>
    `

    try {
      await sendEmail({
        to: email,
        subject: `🎉 ¡Ya somos más de 300 en Inclusia!`,
        html: emailShell({ preheader: 'Inclusia ya cuenta con más de 300 profesionales y centros.', body }),
      })
      emailed++
    } catch (e) {
      console.error(`Error enviando a ${email}:`, e)
    }
  }

  return NextResponse.json({ emailed })
}
