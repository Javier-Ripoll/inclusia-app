import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Profesionales de apoyo educativo disponibles',
  description: 'Encuentra profesionales de apoyo educativo disponibles: PATI, logopedas, integradores sociales, educadores especiales y más. Contrata directamente en Inclusia.',
  alternates: { canonical: '/profesionales' },
  openGraph: { title: 'Profesionales de apoyo educativo | Inclusia', description: 'Encuentra y contrata profesionales de apoyo educativo disponibles en tu zona.', url: 'https://inclusiajobs.com/profesionales' },
}
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { MapPin, Star, CheckCircle, Zap, Users, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 24

const SPEC_LABELS: Record<string, string> = {
  pati: 'PATI', tea: 'TEA', tdah: 'TDAH', altas_capacidades: 'Altas capacidades',
  discapacidad_motora: 'Discapacidad motora',
  discapacidad_intelectual: 'Discapacidad intelectual',
  dificultades_aprendizaje: 'Dificultades de aprendizaje',
  lenguaje: 'Lenguaje y comunicación',
  conducta: 'Conducta', vision: 'Visión', audicion: 'Audición',
}


async function getProfessionals(page: number) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, count } = await supabase
    .from('professional_profiles')
    .select(`
      id, bio, years_experience, specializations,
      is_available, available_immediately, plan,
      profiles(full_name, city, province)
    `, { count: 'exact' })
    .order('is_available', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  return { professionals: data ?? [], total: count ?? 0 }
}

export default async function ProfesionalesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const { professionals, total } = await getProfessionals(page)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-12 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-0">Red de profesionales</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Profesionales de apoyo educativo
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Conoce a los profesionales que forman la red Inclusia. Disponibles para cubrir
              necesidades educativas en centros de toda España.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                {total} profesionales en la red
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-orange-500" />
                Respuesta en minutos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Perfiles verificados
              </span>
            </div>
          </div>
        </div>


        {/* Grid */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {professionals.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {professionals.map((prof: any) => {
                  const profile = prof.profiles
                  const name = profile?.full_name ?? 'Profesional'
                  const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                  const location = [profile?.city, profile?.province].filter(Boolean).join(', ')

                  return (
                    <Card key={prof.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-semibold truncate">{name}</h3>
                              {prof.plan === 'premium' && (
                                <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs px-1.5">Premium</Badge>
                              )}
                            </div>
                            {location && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" /> {location}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {prof.available_immediately && (
                            <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                              <Zap className="h-3 w-3" /> Disponible ahora
                            </span>
                          )}
                          {prof.is_available === false && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                              No disponible
                            </span>
                          )}
                          {prof.years_experience > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3" /> {prof.years_experience} años exp.
                            </span>
                          )}
                        </div>

                        {prof.specializations?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {prof.specializations.slice(0, 3).map((s: string) => (
                              <Badge key={s} variant="secondary" className="text-xs">
                                {SPEC_LABELS[s] ?? s}
                              </Badge>
                            ))}
                            {prof.specializations.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{prof.specializations.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {prof.bio && (
                          <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{prof.bio}</p>
                        )}

                        <Link href={`/profesionales/${prof.id}`} className="block mt-4">
                          <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                            Ver perfil <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {page > 1 && (
                    <Link href={`/profesionales?page=${page - 1}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <ChevronLeft className="h-4 w-4" /> Anterior
                      </Button>
                    </Link>
                  )}

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <Link key={p} href={`/profesionales?page=${p}`}>
                        <button className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:bg-gray-100'
                        }`}>
                          {p}
                        </button>
                      </Link>
                    ))}
                  </div>

                  {page < totalPages && (
                    <Link href={`/profesionales?page=${page + 1}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        Siguiente <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground mt-4">
                Página {page} de {totalPages} · {total} profesionales en total
              </p>
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium text-lg">Próximamente</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 bg-primary rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">¿Eres profesional del apoyo educativo?</h2>
            <p className="text-white/80 mb-6">
              Únete a la red y recibe ofertas de centros en tu zona. Gratis para empezar.
            </p>
            <Link href="/auth/registro?rol=profesional">
              <Button variant="secondary" size="lg" className="gap-2">
                Crear perfil gratuito <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
