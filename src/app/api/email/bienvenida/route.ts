import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailShell, APP_URL } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { email, fullName, role } = await req.json()
  if (!email || !fullName || !role) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const isProfessional = role === 'professional'
  const firstName = fullName.split(' ')[0]

  const body = isProfessional
    ? `
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">¡Bienvenido/a a Inclusia, ${firstName}! 👋</h2>
      <p style="color:#374151;font-size:16px;margin:0 0 24px;line-height:1.6;">
        Ya formas parte de la red de profesionales de apoyo educativo más activa de España.
        Estás a un paso de encontrar tu próxima oportunidad.
      </p>

      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-weight:600;color:#0369a1;font-size:15px;">🚀 Tus próximos pasos</p>
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          <tr><td style="padding:6px 0;color:#374151;font-size:14px;">✅ &nbsp;Completa tu perfil con especialidades y disponibilidad</td></tr>
          <tr><td style="padding:6px 0;color:#374151;font-size:14px;">📄 &nbsp;Sube tu CV para que los centros puedan descargarlo</td></tr>
          <tr><td style="padding:6px 0;color:#374151;font-size:14px;">🔔 &nbsp;Activa alertas para recibir ofertas en tu zona</td></tr>
          <tr><td style="padding:6px 0;color:#374151;font-size:14px;">💼 &nbsp;Aplica a ofertas con un solo clic</td></tr>
        </table>
      </div>

      <a href="${APP_URL}/dashboard/perfil" style="display:inline-block;background:#2563eb;color:white;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:24px;">
        Completar mi perfil →
      </a>

      <p style="color:#6b7280;font-size:14px;margin:0 0 8px;line-height:1.6;">
        Un perfil completo tiene <strong>5 veces más posibilidades</strong> de ser contactado por centros educativos.
      </p>
    `
    : `
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">¡Bienvenido/a a Inclusia, ${firstName}! 👋</h2>
      <p style="color:#374151;font-size:16px;margin:0 0 24px;line-height:1.6;">
        Tu centro ya está en la red de apoyo educativo más activa de España.
        Empieza a publicar ofertas y encuentra al profesional ideal en horas.
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-weight:600;color:#15803d;font-size:15px;">🚀 Tus próximos pasos</p>
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          <tr><td style="padding:6px 0;color:#374151;font-size:14px;">✅ &nbsp;Completa el perfil de tu centro</td></tr>
          <tr><td style="padding:6px 0;color:#374151;font-size:14px;">📢 &nbsp;Publica tu primera oferta (es gratis)</td></tr>
          <tr><td style="padding:6px 0;color:#374151;font-size:14px;">👥 &nbsp;Revisa los candidatos que apliquen</td></tr>
          <tr><td style="padding:6px 0;color:#374151;font-size:14px;">💬 &nbsp;Contacta directamente con los profesionales</td></tr>
        </table>
      </div>

      <a href="${APP_URL}/dashboard/ofertas/nueva" style="display:inline-block;background:#2563eb;color:white;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:24px;">
        Publicar primera oferta →
      </a>

      <p style="color:#6b7280;font-size:14px;margin:0 0 8px;line-height:1.6;">
        ¿Tienes alguna duda? Responde a este email y te ayudamos encantados.
      </p>
    `

  try {
    await sendEmail({
      to: email,
      subject: `¡Bienvenido/a a Inclusia, ${firstName}! 🎉`,
      html: emailShell({
        preheader: isProfessional
          ? 'Ya formas parte de la red de profesionales de apoyo educativo más activa de España.'
          : 'Tu centro ya está en Inclusia. Publica tu primera oferta en minutos.',
        body,
      }),
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Error email bienvenida:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
