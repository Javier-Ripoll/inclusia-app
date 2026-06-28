import { NextResponse } from 'next/server'

export function GET() {
  const body = `User-agent: *
Allow: /
Allow: /ofertas/
Allow: /profesionales/
Allow: /precios
Allow: /centros
Disallow: /dashboard/
Disallow: /auth/
Disallow: /onboarding/
Disallow: /api/

Sitemap: https://inclusiajobs.com/sitemap.xml`

  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
