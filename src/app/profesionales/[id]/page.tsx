import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { BackButton } from '@/components/ui/back-button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, MapPin, Briefcase, GraduationCap, Star,
  CheckCircle, Clock, Globe, Calendar, Phone, FileText,
  Languages, Zap
} from 'lucide-react'

const SPEC_LABELS: Record<string, string> = {
  pati: 'PATI', tea: 'TEA', tdah: 'TDAH', altas_capacidades: 'Altas capacidades',
  discapacidad_motora: 'Discapacidad motora',
  discapacidad_intelectual: 'Discapacidad intelectual',
  dificultades_aprendizaje: 'Dificultades de aprendizaje',
  lenguaje: 'Lenguaje y comunicación',
  conducta: 'Conducta', vision: 'Visión', audicion: 'Audición',
}

const AVAILABILITY_LABELS: Record<string, string> = {
  full_time: 'Jornada completa', part_time: 'Media jornada',
  mornings: 'Mañanas', afternoons: 'Tardes',
  weekends: 'Fines de semana', on_call: 'A llamada',
}

export default async function ProfessionalPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Service role para leer datos públicos del profesional sin restricciones RLS
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Load professional profile + base profile
  const { data: prof } = await serviceSupabase
    .from('professional_profiles')
    .select(`
      id, bio, years_experience, specializations, availabilities,
      is_available, available_immediately, languages, cv_url, plan,
      profiles ( full_name, city, province, phone )
    `)
    .eq('id', id)
    .single()

  if (!prof) notFound()

  const profile = prof.profiles as any

  // Education & experience
  const [{ data: education }, { data: experience }] = await Promise.all([
    serviceSupabase.from('professional_education')
      .select('*').eq('professional_id', prof.id)
      .order('year_completed', { ascending: false }),
    serviceSupabase.from('professional_experience')
      .select('*').eq('professional_id', prof.id)
      .order('start_date', { ascending: false }),
  ])

  // Generate signed URL for CV (bucket is private)
  let cvSignedUrl: string | null = null
  if (prof.cv_url) {
    const { data } = await serviceSupabase.storage
      .from('cvs')
      .createSignedUrl(prof.cv_url, 60 * 60) // 1 hour
    cvSignedUrl = data?.signedUrl ?? null
  }

  // Check if the viewer is a company (to show contact button)
  const { data: { user } } = await supabase.auth.getUser()
  let isCompany = false
  if (user) {
    const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    isCompany = p?.role === 'company'
  }

  const name = profile?.full_name ?? 'Profesional'
  const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton />

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Identity card */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary font-bold text-2xl">
                  {initials}
                </div>
                <h1 className="text-xl font-bold mb-1">{name}</h1>
                {profile?.city && (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.city}{profile.province ? `, ${profile.province}` : ''}
                  </p>
                )}

                {/* Availability status */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4 ${
                  prof.is_available
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${prof.is_available ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {prof.is_available ? 'Disponible' : 'No disponible'}
                </div>

                {prof.available_immediately && (
                  <div className="flex items-center justify-center gap-1 text-xs text-orange-600 font-medium mb-4">
                    <Zap className="h-3.5 w-3.5" /> Disponible de inmediato
                  </div>
                )}

                {/* Contact actions — only for companies */}
                {isCompany && profile?.phone && (
                  <a href={`tel:${profile.phone}`} className="block w-full">
                    <Button className="w-full gap-2" size="sm">
                      <Phone className="h-4 w-4" /> {profile.phone}
                    </Button>
                  </a>
                )}
                {cvSignedUrl && (
                  <a href={cvSignedUrl} target="_blank" rel="noopener noreferrer" className="block w-full mt-2">
                    <Button variant="outline" className="w-full gap-2" size="sm">
                      <FileText className="h-4 w-4" /> Ver CV
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Quick info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                {prof.years_experience > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{prof.years_experience} año{prof.years_experience !== 1 ? 's' : ''} de experiencia</span>
                  </div>
                )}
                {prof.availabilities?.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {prof.availabilities.map((a: string) => (
                        <span key={a} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {AVAILABILITY_LABELS[a] ?? a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {prof.languages?.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Languages className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>{prof.languages.join(', ')}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Specializations */}
            {prof.specializations?.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Especialidades
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {prof.specializations.map((s: string) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {SPEC_LABELS[s] ?? s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            {prof.bio && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" /> Sobre mí
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{prof.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" /> Formación
                  </h2>
                  <div className="space-y-4">
                    {education.map((edu: any) => (
                      <div key={edu.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{edu.degree}</p>
                          {edu.institution && (
                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          )}
                          <div className="flex items-center gap-2 mt-0.5">
                            {edu.year_completed && (
                              <span className="text-xs text-muted-foreground">{edu.year_completed}</span>
                            )}
                            {edu.certified && (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle className="h-3 w-3" /> Verificado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" /> Experiencia
                  </h2>
                  <div className="space-y-4">
                    {experience.map((exp: any) => (
                      <div key={exp.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Briefcase className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{exp.position}</p>
                          {exp.company && (
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {exp.start_date
                              ? new Date(exp.start_date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
                              : ''}
                            {' – '}
                            {exp.is_current
                              ? 'Actualidad'
                              : exp.end_date
                                ? new Date(exp.end_date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
                                : ''}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {!prof.bio && (!education?.length) && (!experience?.length) && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Star className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Este profesional aún no ha completado su perfil.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
