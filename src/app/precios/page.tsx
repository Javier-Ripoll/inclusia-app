import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, X } from 'lucide-react'

const PROFESSIONAL_PLANS = [
  {
    name: 'Gratuito',
    price: '0',
    period: 'siempre',
    description: 'Para empezar a explorar Inclusia',
    features: [
      { text: 'Crear perfil profesional', included: true },
      { text: 'Subir CV', included: true },
      { text: 'Ver ofertas disponibles', included: true },
      { text: 'Aplicar a vacantes', included: true },
      { text: 'Alertas instantáneas de nuevas ofertas', included: false },
      { text: 'Acceso prioritario a ofertas urgentes', included: false },
      { text: 'Matching automático con IA', included: false },
      { text: 'Perfil destacado ante reclutadores', included: false },
      { text: 'Acceso a sustituciones de última hora', included: false },
    ],
    cta: 'Crear cuenta gratis',
    href: '/auth/registro?rol=profesional',
    variant: 'outline' as const,
    highlight: false,
  },
  {
    name: 'Premium',
    price: '2,99',
    period: 'mes',
    description: 'Para conseguir trabajo antes que el resto',
    badge: 'Más popular',
    features: [
      { text: 'Crear perfil profesional', included: true },
      { text: 'Subir CV', included: true },
      { text: 'Ver ofertas disponibles', included: true },
      { text: 'Aplicar a vacantes', included: true },
      { text: 'Alertas instantáneas de nuevas ofertas', included: true },
      { text: 'Acceso prioritario a ofertas urgentes', included: true },
      { text: 'Matching automático con IA 🔜', included: true },
      { text: 'Perfil destacado ante reclutadores', included: true },
      { text: 'Acceso a sustituciones de última hora', included: true },
    ],
    cta: 'Empezar Premium',
    href: '/auth/registro?rol=profesional&plan=premium',
    variant: 'default' as const,
    highlight: true,
  },
]

const COMPANY_PLANS = [
  {
    name: 'Básico',
    price: '0',
    period: 'siempre',
    description: 'Para empezar a publicar sin coste',
    features: [
      { text: 'Hasta 3 ofertas activas', included: true },
      { text: 'Ver candidaturas recibidas', included: true },
      { text: 'Chat con profesionales', included: true },
      { text: 'Perfil del centro básico', included: true },
      { text: 'Ofertas activas ilimitadas', included: false },
      { text: 'Publicar ofertas urgentes', included: false },
      { text: 'Candidatos disponibles ahora destacados', included: false },
      { text: 'Estadísticas de candidaturas', included: false },
      { text: 'Matching automático con IA 🔜', included: false },
      { text: 'Gestor de cuenta dedicado', included: false },
    ],
    cta: 'Crear cuenta gratis',
    href: '/auth/registro?rol=empresa',
    variant: 'outline' as const,
    highlight: false,
  },
  {
    name: 'Pro',
    price: '49',
    period: 'mes',
    description: 'Para centros con necesidades regulares',
    badge: 'Más popular',
    features: [
      { text: 'Hasta 3 ofertas activas', included: true },
      { text: 'Ver candidaturas recibidas', included: true },
      { text: 'Chat con profesionales', included: true },
      { text: 'Perfil del centro básico', included: true },
      { text: 'Ofertas activas ilimitadas', included: true },
      { text: 'Publicar ofertas urgentes', included: true },
      { text: 'Candidatos disponibles ahora destacados', included: true },
      { text: 'Estadísticas de candidaturas', included: true },
      { text: 'Matching automático con IA 🔜', included: false },
      { text: 'Gestor de cuenta dedicado', included: false },
    ],
    cta: 'Empezar con Pro',
    href: '/auth/registro?rol=empresa&plan=pro',
    variant: 'default' as const,
    highlight: true,
  },
  {
    name: 'Premium',
    price: '99',
    period: 'mes',
    description: 'Para centros con alta rotación',
    features: [
      { text: 'Hasta 3 ofertas activas', included: true },
      { text: 'Ver candidaturas recibidas', included: true },
      { text: 'Chat con profesionales', included: true },
      { text: 'Perfil del centro básico', included: true },
      { text: 'Ofertas activas ilimitadas', included: true },
      { text: 'Publicar ofertas urgentes', included: true },
      { text: 'Candidatos disponibles ahora destacados', included: true },
      { text: 'Estadísticas de candidaturas', included: true },
      { text: 'Matching automático con IA 🔜', included: true },
      { text: 'Gestor de cuenta dedicado', included: true },
    ],
    cta: 'Empezar con Premium',
    href: '/auth/registro?rol=empresa&plan=premium',
    variant: 'outline' as const,
    highlight: false,
  },
]

function FeatureItem({ text, included }: { text: string; included: boolean }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {included
        ? <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
        : <X className="h-4 w-4 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
      }
      <span className={included ? '' : 'text-muted-foreground/50'}>{text}</span>
    </li>
  )
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Precios claros, sin sorpresas</h1>
            <p className="text-xl text-muted-foreground">Sin permanencia. Cancela cuando quieras.</p>
          </div>

          {/* Professional plans */}
          <div id="profesionales" className="mb-20">
            <div className="text-center mb-10">
              <Badge variant="secondary" className="mb-3">Para profesionales</Badge>
              <h2 className="text-2xl font-bold">Encuentra trabajo antes que el resto</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {PROFESSIONAL_PLANS.map((plan) => (
                <Card key={plan.name} className={`relative ${plan.highlight ? 'border-2 border-primary shadow-lg' : ''}`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="text-xs">{plan.badge}</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}€</span>
                      <span className="text-muted-foreground text-sm">/{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <Link href={plan.href}>
                      <Button variant={plan.variant} className="w-full mb-6">{plan.cta}</Button>
                    </Link>
                    <ul className="space-y-2">
                      {plan.features.map((f) => <FeatureItem key={f.text} {...f} />)}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Company plans */}
          <div id="empresas">
            <div className="text-center mb-10">
              <Badge className="mb-3">Para centros y entidades</Badge>
              <h2 className="text-2xl font-bold">Cubre urgencias en tiempo real</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {COMPANY_PLANS.map((plan) => (
                <Card key={plan.name} className={`relative ${plan.highlight ? 'border-2 border-primary shadow-lg' : ''}`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="text-xs">{plan.badge}</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}€</span>
                      <span className="text-muted-foreground text-sm">/{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <Link href={plan.href}>
                      <Button variant={plan.variant} className="w-full mb-6">{plan.cta}</Button>
                    </Link>
                    <ul className="space-y-2">
                      {plan.features.map((f) => <FeatureItem key={f.text} {...f} />)}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center mt-16 text-muted-foreground text-sm">
            <p>¿Tienes dudas? <Link href="/contacto" className="text-primary hover:underline">Contáctanos</Link> y te ayudamos a elegir el plan adecuado.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
