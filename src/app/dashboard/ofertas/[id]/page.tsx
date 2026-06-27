import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ApplicationActions } from './application-actions'
import { StartChatButton } from './start-chat-button'
import {
  ArrowLeft, MapPin, Briefcase, Clock, Users,
  GraduationCap, Star, CheckCircle, Zap, Pencil
} from 'lucide-react'

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: company } = await supabase.from('company_profiles').select('id').eq('user_id', user.id).single()
  if (!company) redirect('/dashboard')

  const { data: offer } = await supabase
    .from('job_offers')
    .select('*')
    .eq('id', id)
    .eq('company_id', company.id)
    .single()

  if (!offer) notFound()

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      professional_profiles(
        id, user_id, bio, years_experience, specializations, availabilities, is_available, available_immediately
      )
    `)
    .eq('offer_id', id)
    .order('created_at', { ascending: false })

  // Use service role to bypass RLS and read applicant profiles
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const userIds = (applications ?? [])
    .map((a: any) => a.professional_profiles?.user_id)
    .filter(Boolean)

  const { data: profilesData } = userIds.length > 0
    ? await serviceSupabase.from('profiles').select('id, full_name, city, province, phone').in('id', userIds)
    : { data: [] }

  const profilesMap = Object.fromEntries((profilesData ?? []).map((p: any) => [p.id, p]))

  const statusCount = {
    pending: applications?.filter(a => a.status === 'pending').length ?? 0,
    reviewed: applications?.filter(a => a.status === 'reviewed').length ?? 0,
    accepted: applications?.filter(a => a.status === 'accepted').length ?? 0,
    rejected: applications?.filter(a => a.status === 'rejected').length ?? 0,
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <Link href="/dashboard/ofertas">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold">{offer.title}</h1>
            <Link href={`/dashboard/ofertas/editar/${id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
            </Link>
            {offer.is_urgent && <Badge variant="destructive" className="gap-1"><Zap className="h-3 w-3" />Urgente</Badge>}
            <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
              {offer.status === 'active' ? 'Activa' : offer.status === 'covered' ? 'Cubierta' : 'Cerrada'}
            </Badge>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            {offer.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{offer.city}</span>}
            {offer.contract_type && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{offer.contract_type}</span>}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(offer.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
      </div>

      {/* Candidature stats */}
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">
          {applications?.length ?? 0} candidatura{(applications?.length ?? 0) !== 1 ? 's' : ''} recibida{(applications?.length ?? 0) !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Pendientes', value: statusCount.pending, color: 'text-orange-500' },
          { label: 'Revisadas', value: statusCount.reviewed, color: 'text-blue-500' },
          { label: 'Aceptadas', value: statusCount.accepted, color: 'text-green-600' },
          { label: 'Descartadas', value: statusCount.rejected, color: 'text-gray-400' },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm text-center">
            <CardContent className="pt-4 pb-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications */}
      <div>
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Candidaturas ({applications?.length ?? 0})
        </h2>

        {applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app: any) => {
              const prof = app.professional_profiles
              const profileData = profilesMap[prof?.user_id]
              return (
                <Card key={app.id} className={`transition-all ${app.status === 'accepted' ? 'border-green-200 bg-green-50/30' : app.status === 'rejected' ? 'opacity-60' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {profileData?.full_name?.charAt(0) ?? '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold">{profileData?.full_name ?? 'Profesional'}</h3>
                          {prof?.available_immediately && (
                            <Badge className="bg-green-100 text-green-700 border-0 text-xs gap-1">
                              <CheckCircle className="h-3 w-3" /> Disponible ahora
                            </Badge>
                          )}
                          <Badge
                            variant={app.status === 'accepted' ? 'default' : app.status === 'rejected' ? 'secondary' : 'outline'}
                            className="text-xs capitalize ml-auto"
                          >
                            {app.status === 'pending' ? 'Pendiente' : app.status === 'reviewed' ? 'Revisada' : app.status === 'accepted' ? 'Aceptada' : 'Descartada'}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                          {profileData?.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profileData.city}</span>}
                          {prof?.years_experience > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3" />{prof.years_experience} años exp.</span>}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Aplicó {new Date(app.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        {prof?.specializations?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {prof.specializations.slice(0, 4).map((s: string) => (
                              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        )}

                        {prof?.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{prof.bio}</p>
                        )}

                        {app.cover_letter && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Carta de presentación</p>
                            <p className="text-sm line-clamp-3">{app.cover_letter}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <ApplicationActions
                            applicationId={app.id}
                            currentStatus={app.status}
                            phone={profileData?.phone}
                            professionalUserId={prof?.user_id}
                            offerTitle={offer.title}
                          />
                          {prof?.id && (
                            <Link href={`/profesionales/${prof.id}`} target="_blank">
                              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                <GraduationCap className="h-3.5 w-3.5" /> Ver perfil
                              </Button>
                            </Link>
                          )}
                          <StartChatButton
                            offerId={id}
                            companyId={company.id}
                            professionalId={prof?.id}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground bg-gray-50 rounded-xl">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aún no hay candidaturas</p>
            <p className="text-sm">Las candidaturas aparecerán aquí cuando los profesionales apliquen</p>
          </div>
        )}
      </div>
    </div>
  )
}
