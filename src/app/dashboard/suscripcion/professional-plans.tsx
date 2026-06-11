'use client'

import { useState } from 'react'
import { CheckCircle, Zap, Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'

const FREE_FEATURES = [
  'Perfil profesional completo',
  'Aplicar a ofertas estándar',
  'Ver ofertas urgentes (con retraso)',
  'Chat con centros',
  'Hasta 5 candidaturas activas',
]

const PREMIUM_FEATURES = [
  'Todo lo de Free',
  'Alertas instantáneas de ofertas urgentes',
  'Acceso prioritario antes que otros profesionales',
  'Candidaturas ilimitadas',
  'Destacado en búsquedas de centros',
  'Insignia Premium visible en tu perfil',
]

interface Props {
  currentPlan: string
}

export function ProfessionalPlans({ currentPlan }: Props) {
  const isPremium = currentPlan === 'premium'
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL_PREMIUM,
          plan: 'premium',
          role: 'professional',
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <BackButton href="/dashboard" label="Panel" />
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Tu suscripción</h1>
        <p className="text-muted-foreground">
          Elige el plan que mejor se adapta a tu actividad profesional
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mt-4 pt-5 items-stretch">
        {/* Free */}
        <div className="relative h-full">
          {!isPremium && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-white text-xs px-3 shadow-sm whitespace-nowrap">Plan actual</Badge>
            </div>
          )}
          <Card className={`h-full flex flex-col ${!isPremium ? 'border-primary ring-1 ring-primary' : ''}`}>
          <CardContent className="p-6 flex flex-col flex-1">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Free</h2>
              <div className="mt-2">
                <span className="text-3xl font-bold">0€</span>
                <span className="text-muted-foreground text-sm">/mes</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Para empezar sin compromiso</p>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="w-full"
              disabled={!isPremium}
            >
              {!isPremium ? 'Plan actual' : 'Volver a Free'}
            </Button>
          </CardContent>
          </Card>
        </div>

        {/* Premium */}
        <div className="relative h-full">
          {isPremium && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-white text-xs px-3 shadow-sm whitespace-nowrap">Plan actual</Badge>
            </div>
          )}
          <Card className={`overflow-hidden h-full flex flex-col ${isPremium ? 'border-primary ring-1 ring-primary' : 'border-primary/30'}`}>
          <div className="h-1 bg-gradient-to-r from-primary to-blue-500 w-full flex-shrink-0" />
          <CardContent className="p-6 flex flex-col flex-1">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Premium</h2>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold">2,99€</span>
                <span className="text-muted-foreground text-sm">/mes</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Para profesionales activos</p>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {PREMIUM_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full gap-2"
              disabled={isPremium || loading}
              onClick={handleUpgrade}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isPremium ? 'Plan actual' : loading ? 'Redirigiendo...' : 'Activar Premium'}
            </Button>
            {!isPremium && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Cancela cuando quieras · Sin permanencia
              </p>
            )}
          </CardContent>
          </Card>
        </div>
      </div>

      {isPremium && (
        <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20 text-center">
          <p className="text-sm font-medium text-primary">Tienes Premium activo 🎉</p>
          <p className="text-xs text-muted-foreground mt-1">
            Estás recibiendo alertas instantáneas y acceso prioritario a todas las ofertas urgentes.
          </p>
        </div>
      )}
    </div>
  )
}
