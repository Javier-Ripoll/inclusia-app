import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const BASE = 'https://inclusiajobs.com'

function url(path: string, lastmod?: string, changefreq = 'weekly', priority = '0.7') {
  return `
  <url>
    <loc>${BASE}${path}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: offers }, { data: professionals }] = await Promise.all([
    supabase
      .from('job_offers')
      .select('id, updated_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    supabase
      .from('professional_profiles')
      .select('id, updated_at')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(500),
  ])

  const staticPages = [
    url('/', undefined, 'daily', '1.0'),
    url('/precios', undefined, 'monthly', '0.8'),
    url('/ofertas', undefined, 'daily', '0.9'),
    url('/profesionales', undefined, 'daily', '0.9'),
    url('/centros', undefined, 'monthly', '0.7'),
    url('/terminos', undefined, 'yearly', '0.3'),
    url('/privacidad', undefined, 'yearly', '0.3'),
  ]

  const offerPages = (offers ?? []).map(o =>
    url(`/ofertas/${o.id}`, o.updated_at?.split('T')[0], 'daily', '0.8')
  )

  const profPages = (professionals ?? []).map(p =>
    url(`/profesionales/${p.id}`, p.updated_at?.split('T')[0], 'weekly', '0.6')
  )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.join('')}
${offerPages.join('')}
${profPages.join('')}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
