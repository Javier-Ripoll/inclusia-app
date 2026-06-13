import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { MapPin, Star, CheckCircle, Zap, Users, ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { ProvinciaSelect } from './provincia-select'

const PAGE_SIZE = 24

const SPEC_LABELS: Record<string, string> = {
  pati: 'PATI', tea: 'TEA', tdah: 'TDAH', altas_capacidades: 'Altas capacidades',
  discapacidad_motora: 'Discapacidad motora',
  discapacidad_intelectual: 'Discapacidad intelectual',
  dificultades_aprendizaje: 'Dificultades de aprendizaje',
  lenguaje: 'Lenguaje y comunicación',
  conducta: 'Conducta', vision: 'Visión', audicion: 'Audición',
}

const COMUNIDADES: Record<string, string[]> = {
  'Andalucía': ['Almería','Cádiz','Córdoba','Granada','Huelva','Jaén','Málaga','Sevilla'],
  'Aragón': ['Huesca','Teruel','Zaragoza'],
  'Asturias': ['Asturias'],
  'Baleares': ['Baleares'],
  'Canarias': ['Las Palmas','Santa Cruz de Tenerife'],
  'Cantabria': ['Cantabria'],
  'Castilla-La Mancha': ['Albacete','Ciudad Real','Cuenca','Guadalajara','Toledo'],
  'Castilla y León': ['Ávila','Burgos','León','Palencia','Salamanca','Segovia','Soria','Valladolid','Zamora'],
  'Cataluña': ['Barcelona','Girona','Lleida','Tarragona'],
  'Extremadura': ['Badajoz','Cáceres'],
  'Galicia': ['A Coruña','Lugo','Ourense','Pontevedra'],
  'La Rioja': ['La Rioja'],
  'Madrid': ['Madrid'],
  'Murcia': ['Murcia'],
  'Navarra': ['Navarra'],
  'País Vasco': ['Álava','Gipuzkoa','Bizkaia'],
  'Valencia': ['Alicante','Castellón','Valencia'],
  'Ceuta': ['Ceuta'],
  'Melilla': ['Melilla'],
}

async function getProfessionals(page: number, provincia?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('professional_profiles')
    .select(`
      id, bio, years_experience, specializations,
      is_available, available_immediately, plan,
      profiles!inner(full_name, city, province)
    `, { count: 'exact' })
    .order('is_available', { ascending: false })
    .order('created_at', { ascending: false })

  if (provincia) {
    query = query.eq('profiles.province', provincia)
  }

  const { data, count } = await query.range(from, to)
  return { professionals: data ?? [], total: count ?? 0 }
}

async function getProvincias() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from('profiles')
    .select('province')
    .eq('role', 'professional')
    .not('province', 'is', null)
  // Normalize: trim + capitalize first letter to deduplicate variants
  const normalize = (s: string) => s.trim().replace(/\s+/g, ' ')
  const unique = [...new Set(
    (data ?? [])
      .map((p: any) => p.province)
      .filter(Boolean)
      .map(normalize)
  )].sort()
  return unique as string[]
}

export default async function ProfesionalesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const provincia = sp.provincia ?? ''

  const [{ professionals, total }, provincias] = await Promise.all([
    getProfessionals(page, provincia || undefined),
    getProvincias(),
  ])
  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Build filter URL preserving provincia
  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (provincia) params.set('provincia', provincia)
    params.set('page', String(p))
    return `/profesionales?${params.toString()}`
  }

  function provinciaUrl(prov: string) {
    return prov ? `/profesionales?provincia=${encodeURIComponent(prov)}&page=1` : '/profesionales?page=1'
  }

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
                {total} profesionales{provincia ? ` en ${provincia}` : ' en la red'}
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

        {/* Filtros */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-muted-foreground shrink-0">Provincia:</span>
            <ProvinciaSelect provincias={provincias} selected={provincia} />
            {provincia && (
              <Link href="/profesionales?page=1" className="shrink-0">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground whitespace-nowrap">
                  <X className="h-3 w-3" /> Quitar filtro
                </button>
              </Link>
            )}
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
                    <Link href={pageUrl(page - 1)}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <ChevronLeft className="h-4 w-4" /> Anterior
                      </Button>
                    </Link>
                  )}

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <Link key={p} href={pageUrl(p)}>
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
                    <Link href={pageUrl(page + 1)}>
                      <Button variant="outline" size="sm" className="gap-1">
                        Siguiente <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground mt-4">
                Página {page} de {totalPages} · {total} profesionales{provincia ? ` en ${provincia}` : ' en total'}
              </p>
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium text-lg">
                {provincia ? `No hay profesionales en ${provincia} aún` : 'Próximamente'}
              </p>
              {provincia && (
                <Link href="/profesionales?page=1">
                  <Button variant="outline" size="sm" className="mt-4">Ver todos</Button>
                </Link>
              )}
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
