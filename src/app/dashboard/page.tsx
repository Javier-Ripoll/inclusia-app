import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Users, Bell, TrendingUp, Plus, ArrowRight, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const isProfessional = profile?.role === 'professional'

  if (isProfessional) {
    const { data: professionalProfile } = await supabase
      .from('professional_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const { data: applications } = await supabase
      .from('applications')
      .select('*, job_offers(title, city, is_urgent)')
      .eq('professional_id', professionalProfile?.id ?? '')
      .order('created_at', { ascending: false })
      .limit(5)

    const { count: activeOffersCount } = await supabase
      .from('job_offers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const stats = [
      { label: 'Candidaturas enviadas', value: applications?.length ?? 0, icon: Briefcase, color: 'text-blue-600' },
      { label: 'Ofertas disponibles', value: activeOffersCount ?? 0, icon: TrendingUp, color: 'text-green-600' },
      { label: 'Alertas activas', value: professionalProfile?.plan === 'premium' ? '∞' : '—', icon: Bell, color: 'text-orange-500' },
    ]

    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Hola, {profile?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground">
            {professionalProfile?.plan === 'premium'
              ? 'Tienes acceso prioritario a todas las ofertas urgentes.'
              : 'Mejora a Premium para recibir alertas instantáneas y acceso prioritario.'}
          </p>
        </div>

        {professionalProfile?.plan === 'free' && (
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl p-5 mb-8 flex items-center justify-between">
            <div>
              <p className="font-semibold">Mejora a Premium por solo 2,99€/mes</p>
              <p className="text-sm text-white/80">Alertas instantáneas + acceso prioritario a urgencias</p>
            </div>
            <Link href="/dashboard/suscripcion">
              <Button variant="secondary" size="sm">Ver plan</Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Mis candidaturas recientes</CardTitle>
              <Link href="/dashboard/candidaturas">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">Ver todas <ArrowRight className="h-3 w-3" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {applications && applications.length > 0 ? (
                <ul className="space-y-3">
                  {applications.slice(0, 4).map((app: any) => (
                    <li key={app.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{app.job_offers?.title}</p>
                        <p className="text-xs text-muted-foreground">{app.job_offers?.city}</p>
                      </div>
                      <Badge variant={
                        app.status === 'accepted' ? 'default' :
                        app.status === 'rejected' ? 'destructive' : 'secondary'
                      } className="text-xs capitalize">
                        {app.status === 'pending' ? 'Enviada' :
                         app.status === 'reviewed' ? 'Revisada' :
                         app.status === 'accepted' ? 'Aceptada' : 'Descartada'}
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Ofertas urgentes cerca de ti</CardTitle>
              <Link href="/ofertas?tipo=urgente">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">Ver todas <ArrowRight className="h-3 w-3" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Completa tu perfil para ver ofertas en tu zona</p>
                <Link href="/dashboard/perfil">
                  <Button variant="outline" size="sm" className="mt-3">Completar perfil</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Company dashboard
  const { data: companyProfile } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: offers, count: offersCount } = await supabase
    .from('job_offers')
    .select('*, applications(count)', { count: 'exact' })
    .eq('company_id', companyProfile?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: activeCount } = await supabase
    .from('job_offers')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyProfile?.id ?? '')
    .eq('status', 'active')

  const stats = [
    { label: 'Ofertas activas', value: activeCount ?? 0, icon: Briefcase, color: 'text-blue-600' },
    { label: 'Candidaturas recibidas', value: '—', icon: Users, color: 'text-green-600' },
    { label: 'Plan actual', value: companyProfile?.plan?.toUpperCase() ?? '—', icon: TrendingUp, color: 'text-primary' },
  ]

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hola, {profile?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground">{companyProfile?.company_name}</p>
        </div>
        <Link href="/dashboard/ofertas/nueva">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva oferta
          </Button>
        </Link>
      </div>

      {companyProfile?.plan === 'basic' && (
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl p-5 mb-8 flex items-center justify-between">
          <div>
            <p className="font-semibold">Mejora a Pro por 99€/mes</p>
            <p className="text-sm text-white/80">Matching IA + candidatos disponibles ahora + cobertura urgente</p>
          </div>
          <Link href="/dashboard/suscripcion">
            <Button variant="secondary" size="sm">Ver plan</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Mis ofertas publicadas</CardTitle>
          <Link href="/dashboard/ofertas/nueva">
            <Button size="sm" className="gap-1"><Plus className="h-3 w-3" /> Nueva oferta</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {offers && offers.length > 0 ? (
            <ul className="space-y-3">
              {offers.map((offer: any) => (
                <li key={offer.id} className="flex items-center justify-between text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{offer.title}</p>
                      {offer.is_urgent && <Badge variant="destructive" className="text-xs">Urgente</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{offer.city} · {new Date(offer.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                  <Badge variant={offer.status === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">
                    {offer.status === 'active' ? 'Activa' : offer.status === 'covered' ? 'Cubierta' : 'Cerrada'}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aún no has publicado ninguna oferta</p>
              <p className="text-sm mb-4">Crea tu primera vacante y encuentra al profesional ideal</p>
              <Link href="/dashboard/ofertas/nueva">
                <Button className="gap-2"><Plus className="h-4 w-4" /> Publicar primera oferta</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
