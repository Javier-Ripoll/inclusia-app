import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ApplicationActions } from '@/app/dashboard/ofertas/[id]/application-actions'
import { StartChatButton } from '@/app/dashboard/ofertas/[id]/start-chat-button'
import {
  Users, MapPin, Star, Clock, CheckCircle, Zap, Briefcase
} from 'lucide-react'
import { BackButton } from '@/components/ui/back-button'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  reviewed: 'Revisada',
  accepted: 'Aceptada',
  rejected: 'Descartada',
}

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'reviewed', label: 'Revisadas' },
  { value: 'accepted', label: 'Aceptadas' },
  { value: 'rejected', label: 'Descartadas' },
]

export default async function CandidatosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const statusFilter = sp.status ?? ''
  const offerFilter = sp.offer ?? ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: company } = await supabase
    .from('company_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!company) redirect('/dashboard')

  // Load all offers for this company (for the filter dropdown)
  const { data: offers } = await supabase
    .from('job_offers')
    .select('id, title')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  // Build applications query
  let query = supabase
    .from('applications')
    .select(`
      *,
      job_offers(id, title, is_urgent),
      professional_profiles(
        id, user_id, bio, years_experience, specializations, available_immediately,
        profiles(full_name, city, phone)
      )
    `)
    .in(
      'offer_id',
      (offers ?? []).map(o => o.id)
    )
    .order('created_at', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)
  if (offerFilter) query = query.eq('offer_id', offerFilter)

  const { data: applications } = await query

  const total = applications?.length ?? 0

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <BackButton href="/dashboard" label="Panel" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Candidatos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Todos los profesionales que han aplicado a tus ofertas
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status filter */}
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <Link
              key={f.value}
              href={`/dashboard/candidatos?status=${f.value}${offerFilter ? `&offer=${offerFilter}` : ''}`}
            >
              <Badge
                variant={statusFilter === f.value ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1 text-xs"
              >
                {f.label}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Offer filter */}
        {offers && offers.length > 1 && (
          <div className="flex gap-1 flex-wrap">
            <Link href={`/dashboard/candidatos?${statusFilter ? `status=${statusFilter}` : ''}`}>
              <Badge variant={!offerFilter ? 'default' : 'outline'} className="cursor-pointer px-3 py-1 text-xs">
                Todas las ofertas
              </Badge>
            </Link>
            {offers.map(o => (
              <Link
                key={o.id}
                href={`/dashboard/candidatos?offer=${o.id}${statusFilter ? `&status=${statusFilter}` : ''}`}
              >
                <Badge
                  variant={offerFilter === o.id ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1 text-xs max-w-[200px] truncate"
                >
                  {o.title}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">{total} candidatura{total !== 1 ? 's' : ''}</p>

      {applications && applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app: any) => {
            const prof = app.professional_profiles
            const profileData = prof?.profiles
            const offer = app.job_offers

            return (
              <Card
                key={app.id}
                className={`transition-all ${
                  app.status === 'accepted' ? 'border-green-200 bg-green-50/30' :
                  app.status === 'rejected' ? 'opacity-60' : ''
                }`}
              >
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
                          variant={
                            app.status === 'accepted' ? 'default' :
                            app.status === 'rejected' ? 'secondary' : 'outline'
                          }
                          className="text-xs ml-auto"
                        >
                          {STATUS_LABELS[app.status] ?? app.status}
                        </Badge>
                      </div>

                      {/* Offer link */}
                      {offer && (
                        <Link
                          href={`/dashboard/ofertas/${offer.id}`}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-2"
                        >
                          <Briefcase className="h-3 w-3" />
                          {offer.title}
                          {offer.is_urgent && <Zap className="h-3 w-3 text-red-500" />}
                        </Link>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                        {profileData?.city && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profileData.city}</span>
                        )}
                        {prof?.years_experience > 0 && (
                          <span className="flex items-center gap-1"><Star className="h-3 w-3" />{prof.years_experience} años exp.</span>
                        )}
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
                          offerTitle={offer?.title}
                        />
                        <StartChatButton
                          offerId={offer?.id}
                          companyId={company.id}
                          professionalId={prof?.id}
                        />
                        <Link
                          href={`/profesionales/${prof?.id}`}
                          className="text-xs text-muted-foreground hover:text-primary underline-offset-2 hover:underline"
                        >
                          Ver perfil completo
                        </Link>
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
          <p className="font-medium">
            {statusFilter ? 'No hay candidaturas con este estado' : 'Aún no tienes candidaturas'}
          </p>
          <p className="text-sm mt-1">
            {!statusFilter && 'Cuando los profesionales apliquen a tus ofertas aparecerán aquí'}
          </p>
        </div>
      )}
    </div>
  )
}
