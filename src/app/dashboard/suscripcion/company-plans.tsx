'use client'

import { useState } from 'react'
import { CheckCircle, Zap, Star, Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const PLANS = [
  {
    key: 'basic',
    name: 'Basic',
    price: '0€',
    period: '/mes',
    description: 'Para empezar a publicar',
    icon: Building2,
    accent: false,
    priceId: null,
    features: [
      'Hasta 3 ofertas activas',
      'Ver candidaturas recibidas',
      'Chat con profesionales',
      'Perfil del centro básico',
    ],
    cta: 'Plan actual',
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '49€',
    period: '/mes',
    description: 'Para centros con necesidades regulares',
    icon: Zap,
    accent: true,
    badge: 'Más popular',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COMPANY_PRO,
    features: [
      'Ofertas activas ilimitadas',
      'Publicar ofertas urgentes',
      'Notificaciones a profesionales de la zona',
      'Candidatos disponibles ahora destacados',
      'Estadísticas de candidaturas',
      'Soporte prioritario',
    ],
    cta: 'Activar Pro',
  },
  {
    key: 'premium',
    name: 'Premium',
    price: '99€',
    period: '/mes',
    description: 'Para centros con alta rotación',
    icon: Star,
    accent: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COMPANY_PREMIUM,
    features: [
      'Todo lo de Pro',
      'Matching automático con IA',
      'Acceso a base de datos completa de profesionales',
      'Informes mensuales de cobertura',
      'Gestor de cuenta dedicado',
      'Integraciones con sistemas de RRHH',
    ],
    cta: 'Activar Premium',
  },
]

interface Props {
  currentPlan: string
}

export function CompanyPlans({ currentPlan }: Props) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  async function handleUpgrade(planKey: string, priceId: string) {
    setLoadingKey(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, plan: planKey, role: 'company' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingKey(null)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Tu suscripción</h1>
        <p className="text-muted-foreground">
          Escala tu capacidad de cobertura según las necesidades de tu centro
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 pt-5 items-stretch">
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.key
          const isLoading = loadingKey === plan.key
          const Icon = plan.icon

          return (
            <div key={plan.key} className="relative flex flex-col">
              {isCurrent && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white text-xs px-3 shadow-sm whitespace-nowrap">Plan actual</Badge>
                </div>
              )}
              {plan.badge && !isCurrent && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <Badge variant="secondary" className="text-xs px-3 shadow-sm whitespace-nowrap">{plan.badge}</Badge>
                </div>
              )}
              <Card
                className={`overflow-hidden h-full flex flex-col ${
                  isCurrent
                    ? 'border-primary ring-1 ring-primary'
                    : plan.accent
                      ? 'border-primary/40'
                      : ''
                }`}
              >
                {plan.accent && (
                  <div className="h-1 bg-gradient-to-r from-primary to-blue-500 w-full flex-shrink-0" />
                )}

                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-bold">{plan.name}</h2>
                    </div>
                    <div>
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.accent ? 'text-primary' : 'text-green-500'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full gap-2"
                    variant={plan.accent ? 'default' : 'outline'}
                    disabled={isCurrent || isLoading}
                    onClick={() => {
                      if (!isCurrent && plan.priceId) handleUpgrade(plan.key, plan.priceId)
                    }}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isCurrent ? 'Plan actual' : isLoading ? 'Redirigiendo...' : plan.cta}
                  </Button>

                  {!isCurrent && plan.key !== 'basic' && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Cancela cuando quieras
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {currentPlan !== 'basic' && (
        <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20 text-center">
          <p className="text-sm font-medium text-primary">
            Tienes el plan {PLANS.find(p => p.key === currentPlan)?.name} activo 🎉
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Para cancelar o cambiar de plan contacta con soporte@inclusia.es
          </p>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground mt-8">
        Todos los precios incluyen IVA · Facturación mensual · Pago seguro con Stripe
      </p>
    </div>
  )
}
