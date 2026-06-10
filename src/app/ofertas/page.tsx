import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, Clock, Briefcase, Search, SlidersHorizontal, Zap } from 'lucide-react'
import Link from 'next/link'

// Demo offers shown before Supabase is connected
const DEMO_OFFERS = [
  {
    id: '1',
    title: 'Auxiliar educativo para aula de apoyo',
    is_urgent: true,
    offer_type: 'urgent',
    status: 'active',
    city: 'Valencia',
    contract_type: 'Temporal',
    required_specializations: ['Integración Social', 'Educación Especial'],
    salary_min: 18000,
    salary_max: 20000,
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    company_profiles: { company_name: 'CEIP San José', verified: true },
  },
  {
    id: '2',
    title: 'Terapeuta Ocupacional – Media jornada',
    is_urgent: false,
    offer_type: 'standard',
    status: 'active',
    city: 'Alicante',
    contract_type: 'Indefinido',
    required_specializations: ['Terapia Ocupacional'],
    salary_min: 16000,
    salary_max: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    company_profiles: { company_name: 'Asociación APSA', verified: true },
  },
  {
    id: '3',
    title: 'Logopeda para centro de desarrollo infantil',
    is_urgent: false,
    offer_type: 'standard',
    status: 'active',
    city: 'Castellón',
    contract_type: 'Indefinido',
    required_specializations: ['Logopedia'],
    salary_min: 20000,
    salary_max: 24000,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    company_profiles: { company_name: 'Centro Infanti Castellón', verified: false },
  },
  {
    id: '4',
    title: 'Integrador/a Social – Sustitución urgente',
    is_urgent: true,
    offer_type: 'substitute',
    status: 'active',
    city: 'Valencia',
    contract_type: 'Sustitución',
    required_specializations: ['Integración Social'],
    salary_min: null,
    salary_max: null,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    company_profiles: { company_name: 'Fundación Espurna', verified: true },
  },
  {
    id: '5',
    title: 'Educador/a Infantil – Jornada completa',
    is_urgent: false,
    offer_type: 'standard',
    status: 'active',
    city: 'Valencia',
    contract_type: 'Indefinido',
    required_specializations: ['Educación Infantil'],
    salary_min: 17000,
    salary_max: 19000,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    company_profiles: { company_name: 'Escola Bressol Municipal', verified: true },
  },
  {
    id: '6',
    title: 'Psicólogo/a educativo a tiempo parcial',
    is_urgent: false,
    offer_type: 'standard',
    status: 'active',
    city: 'Alicante',
    contract_type: 'Parcial',
    required_specializations: ['Psicología Educativa'],
    salary_min: 22000,
    salary_max: 26000,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    company_profiles: { company_name: 'IES Badia del Pinar', verified: false },
  },
]

async function getOffers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url' || !supabaseAnonKey) {
    return { offers: DEMO_OFFERS, isDemo: true }
  }

  try {
    // Use direct REST fetch — works in static/ISR context without cookies
    const url = new URL(`${supabaseUrl}/rest/v1/job_offers`)
    url.searchParams.set('select', '*,company_profiles(company_name,logo_url,verified)')
    url.searchParams.set('status', 'eq.active')
    url.searchParams.set('order', 'is_urgent.desc,created_at.desc')
    url.searchParams.set('limit', '30')

    const res = await fetch(url.toString(), {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      next: { revalidate: 60 },
    })

    if (!res.ok) return { offers: DEMO_OFFERS, isDemo: true }
    const data = await res.json()
    return { offers: data ?? [], isDemo: false }
  } catch {
    return { offers: DEMO_OFFERS, isDemo: true }
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}

export default async function OffersPage() {
  const { offers, isDemo } = await getOffers()
  const urgentCount = offers.filter((o: any) => o.is_urgent).length

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-border py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isDemo && (
              <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                Vista previa con datos de ejemplo — conecta Supabase para ver ofertas reales
              </div>
            )}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Ofertas de apoyo educativo</h1>
                <p className="text-muted-foreground">
                  {offers.length} ofertas disponibles
                  {urgentCount > 0 && (
                    <span className="ml-2 text-red-600 font-medium">· {urgentCount} urgentes</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por especialidad, ciudad..." className="pl-9" />
              </div>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Offers list */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-4">
            {offers.map((offer: any) => (
              <Link key={offer.id} href={`/ofertas/${offer.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-border hover:border-primary/30">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h2 className="font-semibold text-base">{offer.title}</h2>
                          {offer.is_urgent && (
                            <Badge variant="destructive" className="text-xs gap-1">
                              <Zap className="h-3 w-3" /> Urgente
                            </Badge>
                          )}
                          {offer.offer_type === 'substitute' && (
                            <Badge variant="secondary" className="text-xs">Sustitución</Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground font-medium mb-2">
                          {offer.company_profiles?.company_name}
                          {offer.company_profiles?.verified && (
                            <span className="ml-1 text-blue-500">✓</span>
                          )}
                        </p>

                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {offer.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {offer.city}
                            </span>
                          )}
                          {offer.contract_type && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" /> {offer.contract_type}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(offer.created_at)}
                          </span>
                        </div>

                        {offer.required_specializations?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {offer.required_specializations.slice(0, 3).map((s: string) => (
                              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {offer.salary_min && (
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-sm">
                            {offer.salary_min.toLocaleString('es-ES')}€
                            {offer.salary_max && ` – ${offer.salary_max.toLocaleString('es-ES')}€`}
                          </p>
                          <p className="text-xs text-muted-foreground">bruto/año</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
