import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Zap, Clock } from 'lucide-react'
import { OfferActions } from './offer-actions'

export default async function CompanyOffersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'company') redirect('/dashboard')

  const { data: company } = await supabase.from('company_profiles').select('id').eq('user_id', user.id).single()

  const { data: offers } = await supabase
    .from('job_offers')
    .select('*, applications(count)')
    .eq('company_id', company?.id ?? '')
    .order('created_at', { ascending: false })

  const stats = {
    active: offers?.filter(o => o.status === 'active').length ?? 0,
    covered: offers?.filter(o => o.status === 'covered').length ?? 0,
    total_applications: offers?.reduce((acc, o) => acc + (o.applications?.[0]?.count ?? 0), 0) ?? 0,
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Mis Ofertas</h1>
          <p className="text-muted-foreground">Gestiona tus vacantes y revisa candidatos</p>
        </div>
        <Link href="/dashboard/ofertas/nueva">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Nueva oferta</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Activas', value: stats.active, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Cubiertas', value: stats.covered, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Candidaturas', value: stats.total_applications, color: 'text-primary', bg: 'bg-primary/5' },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className={`pt-5 ${s.bg} rounded-xl`}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Offers list */}
      {offers && offers.length > 0 ? (
        <div className="space-y-3">
          {offers.map((offer: any) => {
            const appCount = offer.applications?.[0]?.count ?? 0
            return (
              <Card key={offer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold">{offer.title}</h3>
                        {offer.is_urgent && (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <Zap className="h-3 w-3" /> Urgente
                          </Badge>
                        )}
                        <Badge
                          variant={offer.status === 'active' ? 'default' : offer.status === 'covered' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {offer.status === 'active' ? 'Activa' : offer.status === 'covered' ? 'Cubierta' : 'Cerrada'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {offer.city && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{offer.city}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(offer.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-primary">
                          <Users className="h-3 w-3" /> {appCount} candidatura{appCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/dashboard/ofertas/${offer.id}`}>
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <Users className="h-4 w-4" /> Ver candidatos
                        </Button>
                      </Link>
                      <OfferActions offerId={offer.id} currentStatus={offer.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 opacity-40" />
          </div>
          <p className="font-medium text-lg mb-1">Aún no has publicado ninguna oferta</p>
          <p className="text-sm mb-6">Crea tu primera vacante y empieza a recibir candidatos</p>
          <Link href="/dashboard/ofertas/nueva">
            <Button className="gap-2"><Plus className="h-4 w-4" /> Publicar primera oferta</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
