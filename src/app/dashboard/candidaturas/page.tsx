import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WithdrawButton } from './withdraw-button'
import {
  Briefcase, MapPin, Clock, Zap, CheckCircle,
  XCircle, Eye, ArrowRight, Search
} from 'lucide-react'

const STATUS_CONFIG = {
  pending:  { label: 'Enviada',    color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  reviewed: { label: 'En revisión', color: 'bg-blue-100 text-blue-800',    icon: Eye },
  accepted: { label: 'Aceptada',   color: 'bg-green-100 text-green-800',  icon: CheckCircle },
  rejected: { label: 'Descartada', color: 'bg-gray-100 text-gray-600',    icon: XCircle },
} as const

type AppStatus = keyof typeof STATUS_CONFIG

export default async function MyCandidaturesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'professional') redirect('/dashboard')

  const { data: profProfile } = await supabase
    .from('professional_profiles').select('id').eq('user_id', user.id).single()

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id, status, cover_letter, created_at, updated_at,
      job_offers (
        id, title, city, province, is_urgent, status,
        company_profiles ( company_name, verified )
      )
    `)
    .eq('professional_id', profProfile?.id ?? '')
    .order('updated_at', { ascending: false })

  const counts = {
    total:    applications?.length ?? 0,
    pending:  applications?.filter(a => a.status === 'pending').length ?? 0,
    reviewed: applications?.filter(a => a.status === 'reviewed').length ?? 0,
    accepted: applications?.filter(a => a.status === 'accepted').length ?? 0,
    rejected: applications?.filter(a => a.status === 'rejected').length ?? 0,
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mis candidaturas</h1>
        <p className="text-muted-foreground">Sigue el estado de todas tus solicitudes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total',       value: counts.total,    color: 'text-foreground',    bg: 'bg-gray-50' },
          { label: 'En revisión', value: counts.reviewed, color: 'text-blue-700',      bg: 'bg-blue-50' },
          { label: 'Aceptadas',   value: counts.accepted, color: 'text-green-700',     bg: 'bg-green-50' },
          { label: 'Descartadas', value: counts.rejected, color: 'text-muted-foreground', bg: 'bg-gray-50' },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className={`pt-4 pb-3 px-4 ${s.bg} rounded-xl`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List */}
      {!applications?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-medium text-lg mb-1">Aún no has aplicado a ninguna oferta</p>
          <p className="text-sm mb-6">Explora las ofertas disponibles y envía tu candidatura</p>
          <Link href="/ofertas">
            <Button className="gap-2"><Search className="h-4 w-4" /> Ver ofertas</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => {
            const offer = app.job_offers
            const company = offer?.company_profiles
            const status = app.status as AppStatus
            const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
            const StatusIcon = cfg.icon
            const isActive = offer?.status === 'active'

            return (
              <Card
                key={app.id}
                className={`transition-all ${
                  status === 'accepted' ? 'border-green-200 bg-green-50/20' :
                  status === 'rejected' ? 'opacity-60' : ''
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      {/* Offer title + badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-base leading-tight">{offer?.title ?? 'Oferta'}</h3>
                        {offer?.is_urgent && (
                          <Badge variant="destructive" className="text-xs gap-1 py-0">
                            <Zap className="h-2.5 w-2.5" /> Urgente
                          </Badge>
                        )}
                        {!isActive && (
                          <Badge variant="outline" className="text-xs text-muted-foreground py-0">Oferta cerrada</Badge>
                        )}
                      </div>

                      {/* Company + location */}
                      <p className="text-sm text-muted-foreground mb-2">
                        {company?.company_name}
                        {company?.verified && <span className="text-blue-500 ml-1">✓</span>}
                        {offer?.city && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {offer.city}{offer.province ? `, ${offer.province}` : ''}
                          </span>
                        )}
                      </p>

                      {/* Dates */}
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Enviada el {new Date(app.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {app.updated_at !== app.created_at && (
                          <span>
                            · Actualizada {new Date(app.updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 ${cfg.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Accepted: highlight message */}
                  {status === 'accepted' && (
                    <div className="mt-3 p-3 bg-green-100 rounded-lg flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-800">
                        ¡El centro ha aceptado tu candidatura! Pronto se pondrán en contacto contigo.
                      </p>
                    </div>
                  )}

                  {/* Cover letter preview */}
                  {app.cover_letter && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">Tu carta de presentación</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{app.cover_letter}</p>
                    </div>
                  )}

                  {/* Actions row */}
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
                    {isActive && offer?.id && (
                      <Link href={`/ofertas/${offer.id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        Ver oferta <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                    {status === 'pending' && (
                      <WithdrawButton applicationId={app.id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
