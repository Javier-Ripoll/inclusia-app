'use client'

import { CheckCircle, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

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

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Tu suscripción</h1>
        <p className="text-muted-foreground">
          Elige el plan que mejor se adapta a tu actividad profesional
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Free */}
        <Card className={`relative ${!isPremium ? 'border-primary ring-1 ring-primary' : ''}`}>
          {!isPremium && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-white text-xs px-3">Plan actual</Badge>
            </div>
          )}
          <CardContent className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Free</h2>
              <div className="mt-2">
                <span className="text-3xl font-bold">0€</span>
                <span className="text-muted-foreground text-sm">/mes</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Para empezar sin compromiso</p>
            </div>
            <ul className="space-y-2.5 mb-6">
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

        {/* Premium */}
        <Card className={`relative ${isPremium ? 'border-primary ring-1 ring-primary' : 'border-primary/30'}`}>
          {isPremium && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-white text-xs px-3">Plan actual</Badge>
            </div>
          )}
          <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500 rounded-t-xl" />
          <CardContent className="p-6">
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
            <ul className="space-y-2.5 mb-6">
              {PREMIUM_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full gap-2"
              disabled={isPremium}
            >
              <Zap className="h-4 w-4" />
              {isPremium ? 'Plan actual' : 'Activar Premium'}
            </Button>
            {!isPremium && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Cancela cuando quieras · Sin permanencia
              </p>
            )}
          </CardContent>
        </Card>
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
