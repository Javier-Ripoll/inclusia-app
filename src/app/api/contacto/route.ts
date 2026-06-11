import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const { nombre, email, tipo, mensaje } = await req.json()

  if (!nombre || !email || !mensaje) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s/g, ''),
      },
    })

    await transporter.sendMail({
      from: `"Inclusia Contacto" <${process.env.GMAIL_USER}>`,
      to: 'inclusiajobs@gmail.com',
      replyTo: email,
      subject: `[Contacto Inclusia] ${tipo ? `${tipo} – ` : ''}${nombre}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Nuevo mensaje de contacto</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">Nombre</td>
                <td style="padding: 8px 0; font-weight: 600;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
              </tr>
              ${tipo ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tipo</td>
                <td style="padding: 8px 0;">${tipo}</td>
              </tr>` : ''}
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">Mensaje:</p>
            <p style="background: white; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 0; white-space: pre-wrap;">${mensaje}</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0;">Enviado desde inclusiajobs.com</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error enviando email de contacto:', err)
    return NextResponse.json({ error: 'Error al enviar el mensaje' }, { status: 500 })
  }
}
