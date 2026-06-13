import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import {
  Users, Building2, Briefcase, FileText,
  TrendingUp, UserCheck, CalendarDays, Activity
} from 'lucide-react'

const ADMIN_EMAIL = 'javier2003.jr@gmail.com'

async function getMetrics() {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { count: totalProfessionals },
    { count: totalCompanies },
    { count: newUsersToday },
    { count: newUsersWeek },
    { count: totalOffers },
    { count: activeOffers },
    { count: offersThisWeek },
    { count: totalApplications },
    { count: applicationsThisWeek },
    { count: availableNow },
    { data: topOffers },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'professional'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'company'),
    supabase.from('profiles').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('profiles').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('job_offers').select('id', { count: 'exact', head: true }),
    supabase.from('job_offers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('job_offers').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('applications').select('id', { count: 'exact', head: true }),
    supabase.from('applications').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('professional_profiles').select('id', { count: 'exact', head: true }).eq('available_immediately', true),
    supabase.from('job_offers').select('id, title, city, is_urgent, status, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  // Recent users: join auth.users (has email) with profiles (has role + name)
  const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 10, page: 1 })
  const recentProfilesRaw = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .in('id', authUsers?.users.map(u => u.id) ?? [])

  const profileMap = Object.fromEntries(
    (recentProfilesRaw.data ?? []).map(p => [p.id, p])
  )
  const recentUsers = (authUsers?.users ?? [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map(u => ({
      id: u.id,
      email: u.email ?? '—',
      full_name: profileMap[u.id]?.full_name ?? '—',
      role: profileMap[u.id]?.role ?? '—',
      created_at: u.created_at,
    }))

  return {
    totalProfessionals: totalProfessionals ?? 0,
    totalCompanies: totalCompanies ?? 0,
    newUsersToday: newUsersToday ?? 0,
    newUsersWeek: newUsersWeek ?? 0,
    totalOffers: totalOffers ?? 0,
    activeOffers: activeOffers ?? 0,
    offersThisWeek: offersThisWeek ?? 0,
    totalApplications: totalApplications ?? 0,
    applicationsThisWeek: applicationsThisWeek ?? 0,
    availableNow: availableNow ?? 0,
    recentUsers: recentUsers ?? [],
    topOffers: topOffers ?? [],
  }
}

function StatCard({
  title, value, sub, icon: Icon, color = 'text-primary',
}: {
  title: string
  value: number | string
  sub?: string
  icon: React.ElementType
  color?: string
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-tight">{title}</p>
            {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
          </div>
          <Icon className={`h-6 w-6 ${color} opacity-20 shrink-0`} />
        </div>
      </CardContent>
    </Card>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const m = await getMetrics()

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <BackButton href="/dashboard" label="Panel" />

      <div className="mb-8 flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            📊 Panel de métricas
            <Badge variant="secondary" className="text-xs">Admin</Badge>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Datos en tiempo real de Inclusia</p>
        </div>
      </div>

      {/* USUARIOS */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Users className="h-4 w-4" /> Usuarios
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard title="Profesionales" value={m.totalProfessionals} icon={Users} color="text-blue-600" />
        <StatCard title="Centros / Entidades" value={m.totalCompanies} icon={Building2} color="text-purple-600" />
        <StatCard title="Nuevos hoy" value={m.newUsersToday} icon={TrendingUp} color="text-green-600" />
        <StatCard title="Nuevos esta semana" value={m.newUsersWeek} icon={CalendarDays} color="text-orange-500" />
      </div>

      {/* OFERTAS */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Briefcase className="h-4 w-4" /> Ofertas
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Ofertas activas" value={m.activeOffers} icon={Activity} color="text-green-600" />
        <StatCard title="Publicadas esta semana" value={m.offersThisWeek} icon={Briefcase} color="text-blue-600" />
        <StatCard title="Total histórico" value={m.totalOffers} icon={FileText} color="text-muted-foreground" />
      </div>

      {/* CANDIDATURAS Y DISPONIBILIDAD */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4" /> Candidaturas y disponibilidad
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Candidaturas totales" value={m.totalApplications} icon={FileText} color="text-primary" />
        <StatCard title="Candidaturas esta semana" value={m.applicationsThisWeek} icon={TrendingUp} color="text-orange-500" />
        <StatCard title="Disponibles ahora mismo" value={m.availableNow} icon={UserCheck} color="text-green-600" />
      </div>

      {/* ÚLTIMOS REGISTROS */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Últimos registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {m.recentUsers.map((u: any) => (
                <li key={u.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.full_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge variant={u.role === 'professional' ? 'secondary' : 'default'} className="text-xs">
                      {u.role === 'professional' ? 'Prof.' : 'Centro'}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Últimas ofertas publicadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {m.topOffers.length > 0 ? (
              <ul className="space-y-2">
                {m.topOffers.map((offer: any) => (
                  <li key={offer.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{offer.title}</p>
                      <p className="text-xs text-muted-foreground">{offer.city}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {offer.is_urgent && <Badge variant="destructive" className="text-xs">Urgente</Badge>}
                      <Badge variant={offer.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {offer.status === 'active' ? 'Activa' : 'Cerrada'}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No hay ofertas aún</p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8">
        Datos actualizados en cada visita · Solo visible para administradores
      </p>
    </div>
  )
}
