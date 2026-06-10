import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, MapPin, Globe, Briefcase, CheckCircle,
  Building2, Zap, Clock, Users
} from 'lucide-react'

const CONTRACT_LABELS: Record<string, string> = {
  indefinido: 'Indefinido', temporal: 'Temporal', interinidad: 'Interinidad',
  practicas: 'Prácticas', voluntariado: 'Voluntariado',
}

const TYPE_LABELS: Record<string, string> = {
  colegio: 'Colegio', instituto: 'Instituto', guarderia: 'Guardería',
  centro_especial: 'Centro de educación especial', academia: 'Academia',
  asociacion: 'Asociación', fundacion: 'Fundación', otro: 'Otro',
}

export default async function CompanyPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('company_profiles')
    .select(`
      id, company_name, company_type, description, logo_url, website, verified,
      profiles ( full_name, city, province, phone )
    `)
    .eq('id', id)
    .single()

  if (!company) notFound()

  const profile = company.profiles as any

  // Active offers from this company
  const { data: offers } = await supabase
    .from('job_offers')
    .select('id, title, city, contract_type, is_urgent, created_at')
    .eq('company_id', id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Check if viewer is a logged-in professional
  const { data: { user } } = await supabase.auth.getUser()
  let isProfessional = false
  if (user) {
    const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    isProfessional = p?.role === 'professional'
  }

  const name = company.company_name
  const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
  const location = [profile?.city, profile?.province].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/ofertas"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a ofertas
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Identity card */}
            <Card>
              <CardContent className="p-6 text-center">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={name}
                    className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary font-bold text-2xl">
                    {initials}
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <h1 className="text-xl font-bold">{name}</h1>
                  {company.verified && (
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>

                {company.company_type && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {TYPE_LABELS[company.company_type] ?? company.company_type}
                  </p>
                )}

                {location && (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mb-4">
                    <MapPin className="h-3.5 w-3.5" /> {location}
                  </p>
                )}

                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button variant="outline" className="w-full gap-2" size="sm">
                      <Globe className="h-4 w-4" /> Web del centro
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>
                    <span className="font-semibold text-foreground">{offers?.length ?? 0}</span>
                    {' '}oferta{offers?.length !== 1 ? 's' : ''} activa{offers?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{profile?.full_name ? `Contacto: ${profile.full_name}` : 'Centro educativo'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            {company.description && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> Sobre el centro
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {company.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Active offers */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Ofertas activas ({offers?.length ?? 0})
                </h2>

                {offers && offers.length > 0 ? (
                  <div className="space-y-3">
                    {offers.map((offer: any) => (
                      <Link
                        key={offer.id}
                        href={`/ofertas/${offer.id}`}
                        className="flex items-start justify-between gap-3 p-3 rounded-lg border hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-medium text-sm group-hover:text-primary transition-colors">
                              {offer.title}
                            </p>
                            {offer.is_urgent && (
                              <Badge variant="destructive" className="text-xs gap-1 px-1.5">
                                <Zap className="h-2.5 w-2.5" /> Urgente
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {offer.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {offer.city}
                              </span>
                            )}
                            {offer.contract_type && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {CONTRACT_LABELS[offer.contract_type] ?? offer.contract_type}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(offer.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                        <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Este centro no tiene ofertas activas ahora mismo</p>
                    {isProfessional && (
                      <Link href="/ofertas">
                        <Button variant="outline" size="sm" className="mt-3">Ver otras ofertas</Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Empty state if no description and no offers */}
            {!company.description && (!offers?.length) && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Este centro aún no ha completado su perfil.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
