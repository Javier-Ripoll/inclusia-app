import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApplyButton } from './apply-button'
import {
  ArrowLeft, MapPin, Briefcase, Clock, Calendar,
  Euro, GraduationCap, Zap, CheckCircle, Building2, Users
} from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: offer } = await supabase
    .from('job_offers')
    .select('title, description, city, province, company_profiles(company_name)')
    .eq('id', id)
    .single()

  if (!offer) return {}

  const company = (offer.company_profiles as any)?.company_name ?? 'Inclusia'
  const location = [offer.city, offer.province].filter(Boolean).join(', ')
  const title = `${offer.title} – ${company}`
  const description = `${location ? `📍 ${location} · ` : ''}${offer.description?.slice(0, 150) ?? ''}${(offer.description?.length ?? 0) > 150 ? '...' : ''}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/ofertas/${id}`,
      siteName: 'Inclusia',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

const AVAILABILITY_LABELS: Record<string, string> = {
  full_time: 'Jornada completa', part_time: 'Media jornada',
  mornings: 'Mañanas', afternoons: 'Tardes',
  weekends: 'Fines de semana', on_call: 'A llamada',
}

export default async function OfferPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: offer } = await supabase
    .from('job_offers')
    .select('*, company_profiles(id, company_name, description, logo_url, verified)')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!offer) notFound()

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { count: applicationCount } = await serviceClient
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('offer_id', id)

  // Check if current user already applied
  const { data: { user } } = await supabase.auth.getUser()
  let alreadyApplied = false
  let professionalProfileId: string | null = null

  if (user) {
    const { data: prof } = await supabase
      .from('professional_profiles').select('id').eq('user_id', user.id).single()
    professionalProfileId = prof?.id ?? null

    if (prof) {
      const { data: existing } = await supabase
        .from('applications')
        .select('id').eq('offer_id', id).eq('professional_id', prof.id).single()
      alreadyApplied = !!existing
    }
  }

  const company = offer.company_profiles as any

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/ofertas" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Volver a ofertas
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {offer.is_urgent && (
                        <Badge variant="destructive" className="gap-1">
                          <Zap className="h-3 w-3" /> Urgente
                        </Badge>
                      )}
                      {offer.offer_type === 'substitute' && (
                        <Badge variant="secondary">Sustitución</Badge>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold">{offer.title}</h1>
                    <p className="text-muted-foreground font-medium mt-1 flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {company?.company_name}
                      {company?.verified && <span className="text-blue-500 text-sm">✓</span>}
                    </p>
                  </div>
                </div>

                {(applicationCount ?? 0) > 0 && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                    <Users className="h-4 w-4" />
                    {applicationCount} persona{applicationCount !== 1 ? 's' : ''} {applicationCount !== 1 ? 'han' : 'ha'} aplicado
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b">
                  {offer.city && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{offer.city}{offer.province ? `, ${offer.province}` : ''}</span>}
                  {offer.contract_type && <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{offer.contract_type}</span>}
                  {offer.start_date && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Incorporación: {new Date(offer.start_date).toLocaleDateString('es-ES')}</span>}
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />Publicada {new Date(offer.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                </div>

                <div>
                  <h2 className="font-semibold mb-3">Descripción del puesto</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{offer.description}</p>
                </div>
              </CardContent>
            </Card>

            {offer.required_specializations?.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" /> Especialización requerida
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {offer.required_specializations.map((s: string) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                  {offer.required_experience_years > 0 && (
                    <p className="text-sm text-muted-foreground mt-3">
                      Experiencia mínima: <strong>{offer.required_experience_years} año{offer.required_experience_years !== 1 ? 's' : ''}</strong>
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply card */}
            <Card className="sticky top-4">
              <CardContent className="p-5">
                {offer.salary_min && (
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-xs text-muted-foreground mb-0.5">Salario</p>
                    <p className="text-xl font-bold text-primary flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      {offer.salary_min.toLocaleString('es-ES')}
                      {offer.salary_max ? ` – ${offer.salary_max.toLocaleString('es-ES')}` : '+'}
                      <span className="text-sm font-normal text-muted-foreground">/año</span>
                    </p>
                  </div>
                )}

                {offer.availability_needed?.length > 0 && (
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-xs text-muted-foreground mb-2">Disponibilidad</p>
                    <div className="flex flex-col gap-1.5">
                      {offer.availability_needed.map((a: string) => (
                        <span key={a} className="flex items-center gap-1.5 text-sm">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          {AVAILABILITY_LABELS[a] ?? a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <ApplyButton
                  offerId={id}
                  professionalProfileId={professionalProfileId}
                  alreadyApplied={alreadyApplied}
                  isLoggedIn={!!user}
                />
              </CardContent>
            </Card>

            {/* Company card */}
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground mb-2">Centro / Entidad</p>
                <Link
                  href={`/centros/${company?.id}`}
                  className="font-semibold flex items-center gap-1 hover:text-primary transition-colors"
                >
                  {company?.company_name}
                  {company?.verified && <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                </Link>
                {offer.city && <p className="text-sm text-muted-foreground mt-0.5">{offer.city}{offer.province ? `, ${offer.province}` : ''}</p>}
                {company?.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{company.description}</p>}
                {company?.id && (
                  <Link href={`/centros/${company.id}`} className="block mt-3">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                      <Building2 className="h-3.5 w-3.5" /> Ver perfil del centro
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
