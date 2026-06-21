import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase, Users, TrendingUp, Plus, ArrowRight,
  Clock, CheckCircle, MessageSquare, Zap, BarChart2
} from 'lucide-react'

const ADMIN_EMAIL = 'javier2003.jr@gmail.com'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const isAdmin = user.email === ADMIN_EMAIL

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const isProfessional = profile?.role === 'professional'

  /* ───────── PROFESSIONAL ───────── */
  if (isProfessional) {
    const { data: prof } = await supabase
      .from('professional_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const [
      { data: recentApps },
      { count: totalApps },
      { count: pendingApps },
      { count: acceptedApps },
      { count: activeOffers },
    ] = await Promise.all([
      supabase
        .from('applications')
        .select('*, job_offers(id, title, city, is_urgent)')
        .eq('professional_id', prof?.id ?? '')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', prof?.id ?? ''),
      supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', prof?.id ?? '')
        .eq('status', 'pending'),
      supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', prof?.id ?? '')
        .eq('status', 'accepted'),
      supabase
        .from('job_offers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
    ])

    const stats = [
      { label: 'Candidaturas enviadas', value: totalApps ?? 0, icon: Briefcase, color: 'text-blue-600', href: '/dashboard/candidaturas' },
      { label: 'En espera de respuesta', value: pendingApps ?? 0, icon: Clock, color: 'text-orange-500', href: '/dashboard/candidaturas?status=pending' },
      { label: 'Aceptadas', value: acceptedApps ?? 0, icon: CheckCircle, color: 'text-green-600', href: '/dashboard/candidaturas?status=accepted' },
      { label: 'Ofertas disponibles', value: activeOffers ?? 0, icon: TrendingUp, color: 'text-primary', href: '/ofertas' },
    ]

    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Hola,{' '}
              {prof?.plan === 'premium' ? (
                <span style={{
                  background: 'linear-gradient(90deg, #b8860b, #ffd700, #daa520, #ffd700, #b8860b)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmer 3s linear infinite',
                }}>
                  {profile?.full_name?.split(' ')[0]}
                </span>
              ) : (
                profile?.full_name?.split(' ')[0]
              )} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {prof?.plan === 'premium'
                ? 'Tienes acceso prioritario a todas las ofertas urgentes.'
                : 'Mejora a Premium para recibir alertas instantáneas y acceso prioritario.'}
            </p>
          </div>
          {isAdmin && (
            <Link href="/dashboard/admin">
              <Button variant="outline" size="sm" className="gap-2 shrink-0">
                <BarChart2 className="h-4 w-4" /> Métricas
              </Button>
            </Link>
          )}
        </div>

        {prof?.plan === 'free' && (
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl p-5 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Mejora a Premium por solo 2,99€/mes</p>
              <p className="text-sm text-white/80">Alertas instantáneas + acceso prioritario a urgencias</p>
            </div>
            <Link href="/dashboard/suscripcion">
              <Button variant="secondary" size="sm" className="shrink-0">Ver plan</Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-tight">{stat.label}</p>
                    </div>
                    <stat.icon className={`h-6 w-6 ${stat.color} opacity-20 shrink-0`} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Candidaturas recientes</CardTitle>
              <Link href="/dashboard/candidaturas">
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                  Ver todas <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentApps && recentApps.length > 0 ? (
                <ul className="space-y-3">
                  {recentApps.map((app: any) => (
                    <li key={app.id} className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{app.job_offers?.title}</p>
                        <p className="text-xs text-muted-foreground">{app.job_offers?.city}</p>
                      </div>
                      <Badge
                        variant={app.status === 'accepted' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}
                        className="text-xs shrink-0 ml-2"
                      >
                        {app.status === 'pending' ? 'Enviada' : app.status === 'reviewed' ? 'Revisada' : app.status === 'accepted' ? 'Aceptada' : 'Descartada'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aún no has aplicado a ninguna oferta</p>
                  <Link href="/ofertas">
                    <Button variant="outline" size="sm" className="mt-3">Ver ofertas</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/ofertas" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Buscar ofertas</p>
                  <p className="text-xs text-muted-foreground">{activeOffers ?? 0} disponibles ahora</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </Link>
              <Link href="/dashboard/perfil" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Completar perfil</p>
                  <p className="text-xs text-muted-foreground">Un perfil completo recibe más ofertas</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </Link>
              <Link href="/dashboard/chat" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Mensajes</p>
                  <p className="text-xs text-muted-foreground">Chat con los centros</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  /* ───────── COMPANY ───────── */
  const { data: company } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const companyId = company?.id ?? ''

  // Load all offer IDs for this company
  const { data: offerIds } = await supabase
    .from('job_offers')
    .select('id')
    .eq('company_id', companyId)

  const ids = (offerIds ?? []).map((o: any) => o.id)

  const [
    { count: activeCount },
    { count: totalCandidatures },
    { count: pendingCandidatures },
    { count: acceptedCandidatures },
    { data: recentOffers },
    { data: recentCandidatures },
  ] = await Promise.all([
    supabase
      .from('job_offers')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active'),
    ids.length
      ? supabase.from('applications').select('*', { count: 'exact', head: true }).in('offer_id', ids)
      : Promise.resolve({ count: 0, data: null, error: null }),
    ids.length
      ? supabase.from('applications').select('*', { count: 'exact', head: true }).in('offer_id', ids).eq('status', 'pending')
      : Promise.resolve({ count: 0, data: null, error: null }),
    ids.length
      ? supabase.from('applications').select('*', { count: 'exact', head: true }).in('offer_id', ids).eq('status', 'accepted')
      : Promise.resolve({ count: 0, data: null, error: null }),
    supabase
      .from('job_offers')
      .select('id, title, city, is_urgent, status, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(4),
    ids.length
      ? supabase
          .from('applications')
          .select('id, status, created_at, job_offers(title), professional_profiles(profiles(full_name))')
          .in('offer_id', ids)
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [], error: null }),
  ])

  const stats = [
    { label: 'Ofertas activas', value: activeCount ?? 0, icon: Briefcase, color: 'text-blue-600', href: '/dashboard/ofertas' },
    { label: 'Candidaturas totales', value: totalCandidatures ?? 0, icon: Users, color: 'text-green-600', href: '/dashboard/candidatos' },
    { label: 'Pendientes de revisar', value: pendingCandidatures ?? 0, icon: Clock, color: 'text-orange-500', href: '/dashboard/candidatos?status=pending' },
    { label: 'Aceptadas', value: acceptedCandidatures ?? 0, icon: CheckCircle, color: 'text-primary', href: '/dashboard/candidatos?status=accepted' },
  ]

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Hola,{' '}
            {company?.plan && company.plan !== 'basic' ? (
              <span style={{
                background: 'linear-gradient(90deg, #b8860b, #ffd700, #daa520, #ffd700, #b8860b)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear infinite',
              }}>
                {profile?.full_name?.split(' ')[0]}
              </span>
            ) : (
              profile?.full_name?.split(' ')[0]
            )} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{company?.company_name}</p>
        </div>
        <Link href="/dashboard/ofertas/nueva">
          <Button className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nueva oferta
          </Button>
        </Link>
      </div>

      {company?.plan === 'basic' && (
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl p-5 mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Mejora a Pro por 49€/mes</p>
            <p className="text-sm text-white/80">Ofertas ilimitadas + candidatos disponibles ahora + estadísticas</p>
          </div>
          <Link href="/dashboard/suscripcion">
            <Button variant="secondary" size="sm" className="shrink-0">Ver planes</Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">{stat.label}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 ${stat.color} opacity-20 shrink-0`} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent offers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Mis ofertas</CardTitle>
            <Link href="/dashboard/ofertas">
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOffers && recentOffers.length > 0 ? (
              <ul className="space-y-3">
                {recentOffers.map((offer: any) => (
                  <li key={offer.id}>
                    <Link
                      href={`/dashboard/ofertas/${offer.id}`}
                      className="flex items-center justify-between text-sm hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium truncate">{offer.title}</p>
                          {offer.is_urgent && <Zap className="h-3 w-3 text-red-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{offer.city}</p>
                      </div>
                      <Badge
                        variant={offer.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs shrink-0 ml-2"
                      >
                        {offer.status === 'active' ? 'Activa' : offer.status === 'covered' ? 'Cubierta' : 'Cerrada'}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm mb-3">Aún no has publicado ninguna oferta</p>
                <Link href="/dashboard/ofertas/nueva">
                  <Button size="sm" className="gap-1"><Plus className="h-3 w-3" /> Publicar oferta</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent candidatures */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Candidaturas recientes</CardTitle>
            <Link href="/dashboard/candidatos">
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCandidatures && recentCandidatures.length > 0 ? (
              <ul className="space-y-3">
                {(recentCandidatures as any[]).map((app) => {
                  const name = app.professional_profiles?.profiles?.full_name ?? 'Profesional'
                  const offerTitle = app.job_offers?.title ?? ''
                  return (
                    <li key={app.id} className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">{offerTitle}</p>
                      </div>
                      <Badge
                        variant={app.status === 'accepted' ? 'default' : app.status === 'rejected' ? 'secondary' : 'outline'}
                        className="text-xs shrink-0 ml-2"
                      >
                        {app.status === 'pending' ? 'Nueva' : app.status === 'reviewed' ? 'Revisada' : app.status === 'accepted' ? 'Aceptada' : 'Descartada'}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aún no has recibido candidaturas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
