import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ofertas de trabajo sector social – Terapeuta Ocupacional, Logopeda, Psicólogo, Integrador Social, Educador Social, Trabajador Social, PATI | Inclusia',
  description: 'Ofertas de trabajo en sector social y apoyo educativo: Terapeuta Ocupacional, Logopeda, Psicólogo, Integrador Social, Educador Social, Trabajador Social, PATI y más. Conectamos centros educativos con los mejores profesionales.',
  keywords: [
    'ofertas trabajo sector social',
    'terapeuta ocupacional',
    'logopeda empleo',
    'psicologo educativo',
    'integrador social trabajo',
    'educador social ofertas',
    'trabajador social empleo',
    'PATI trabajo',
    'empleo apoyo educativo',
    'sustituciones educativas',
    'empleo educacion especial',
    'ofertas empleo logopedia',
  ],
  alternates: { canonical: '/' },
}
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import {
  Zap, Users, Brain, MapPin, Bell, Star, Clock, Shield,
  CheckCircle, ArrowRight, Building2, GraduationCap
} from 'lucide-react'

async function getStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const [{ count: professionals }, { count: companies }] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'professional'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'company'),
  ])
  return { professionals: professionals ?? 0, companies: companies ?? 0 }
}

const SPECIALIZATIONS = [
  'PATI', 'Integración Social', 'Atención a la Dependencia', 'Auxiliar Educativo',
  'Terapia Ocupacional', 'Logopedia', 'Educación Infantil', 'Psicología Educativa',
]

const HOW_IT_WORKS = [
  {
    icon: Building2,
    step: '1',
    title: 'El centro publica la necesidad',
    desc: 'En segundos: qué perfil necesitan, dónde y cuándo.',
  },
  {
    icon: Bell,
    step: '2',
    title: 'Profesionales reciben la alerta',
    desc: 'Los disponibles en la zona son notificados al instante.',
  },
  {
    icon: CheckCircle,
    step: '3',
    title: 'La vacante queda cubierta',
    desc: 'El centro elige y confirma. En minutos, no en días.',
  },
]


const PROFESSIONAL_FEATURES = [
  { icon: Bell, text: 'Alertas instantáneas de nuevas ofertas' },
  { icon: Zap, text: 'Acceso prioritario a sustituciones urgentes' },
  { icon: Brain, text: 'Matching IA: las mejores ofertas para tu perfil (próximamente)' },
  { icon: Star, text: 'Perfil destacado ante reclutadores' },
  { icon: MapPin, text: 'Filtrado avanzado por zona exacta' },
  { icon: Clock, text: 'Respuesta antes que los usuarios gratuitos' },
]

const COMPANY_FEATURES = [
  { icon: Zap, text: 'Candidatos "disponibles ahora" en tiempo real' },
  { icon: Brain, text: 'Ranking IA de candidatos por compatibilidad (próximamente)' },
  { icon: Bell, text: 'Cobertura urgente automática con envío masivo' },
  { icon: MapPin, text: 'Geolocalización avanzada por zona' },
  { icon: Star, text: 'Bolsa de talento: guarda tus favoritos' },
  { icon: Shield, text: 'Dashboard de métricas de contratación' },
]

export default async function HomePage() {
  const stats = await getStats()

  const STATS = [
    { value: '<30 min', label: 'Tiempo medio de cobertura' },
    { value: `${stats.professionals}+`, label: 'Profesionales activos' },
    { value: '95%', label: 'Tasa de éxito en urgencias' },
    { value: 'Toda España', label: 'Cobertura nacional' },
  ]

  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-blue-50 py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="secondary" className="mb-6 text-primary border-primary/20 bg-primary/10">
              Cobertura de apoyo educativo en tiempo real
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Conectamos centros educativos con{' '}
              <span className="text-primary">los mejores profesionales</span>{' '}
              de apoyo
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Inclusia conecta centros educativos y entidades con profesionales de apoyo
              disponibles en su zona. Respuesta rápida, perfil adecuado, sin esperas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/registro?rol=empresa">
                <Button size="lg" className="gap-2 text-base px-8">
                  <Building2 className="h-5 w-5" />
                  Soy un centro o entidad
                </Button>
              </Link>
              <Link href="/auth/registro?rol=profesional">
                <button className="inline-flex items-center gap-2 px-8 text-base font-medium h-11 rounded-lg border-2 border-primary text-primary bg-transparent hover:bg-primary/5 transition-colors">
                  <GraduationCap className="h-5 w-5" />
                  Soy un profesional
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-10">
              {SPECIALIZATIONS.map((s) => (
                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-16 border-y bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Así funciona Inclusia</h2>
              <p className="text-muted-foreground text-lg">De la necesidad a la cobertura en tres pasos</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map((step) => (
                <Card key={step.step} className="text-center border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-1">Paso {step.step}</div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PROFESSIONALS */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-green-100 text-green-700 border-0">Para profesionales</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Encuentra trabajo antes que el resto
                </h2>
                <p className="text-muted-foreground mb-8">
                  Con el plan Premium recibes alertas instantáneas y acceso prioritario a las
                  sustituciones urgentes antes de que se publiquen para todos.
                </p>
                <ul className="space-y-3 mb-8">
                  {PROFESSIONAL_FEATURES.map((f) => (
                    <li key={f.text} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <f.icon className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm">{f.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-4">
                  <Link href="/auth/registro?rol=profesional">
                    <Button>Crear perfil gratis</Button>
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    o{' '}
                    <Link href="/precios#profesionales" className="text-primary hover:underline">
                      ver plan Premium por 2,99€/mes
                    </Link>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
                <div className="space-y-4">
                  {['Integración Social', 'Terapia Ocupacional', 'Logopedia'].map((spec, i) => (
                    <div key={spec} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{spec}</div>
                        <div className="text-xs text-muted-foreground">
                          Valencia · {i === 0 ? 'Urgente' : i === 1 ? 'Jornada completa' : 'Media jornada'}
                        </div>
                      </div>
                      <Badge variant={i === 0 ? 'destructive' : 'secondary'} className="text-xs">
                        {i === 0 ? 'Urgente' : 'Nueva'}
                      </Badge>
                    </div>
                  ))}
                  <div className="text-center">
                    <Badge className="bg-primary/10 text-primary border-0 text-xs">
                      +12 ofertas nuevas hoy en tu zona
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPANIES */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 order-2 md:order-1">
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm">Auxiliar educativo – URGENTE</div>
                      <Badge variant="destructive" className="text-xs">Urgente</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">Valencia · Publicado hace 5 min</div>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      8 profesionales notificados · 3 han respondido
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { top: '< 30 min', bot: 'cobertura' },
                      { top: '8', bot: 'respuestas' },
                      { top: '95%', bot: 'éxito' },
                    ].map((stat) => (
                      <div key={stat.top} className="bg-white rounded-lg p-3 text-center shadow-sm">
                        <div className="font-bold text-primary text-sm">{stat.top}</div>
                        <div className="text-xs text-muted-foreground">{stat.bot}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <Badge className="mb-4 bg-blue-100 text-blue-700 border-0">Para centros y entidades</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Cubre urgencias en minutos, no en días
                </h2>
                <p className="text-muted-foreground mb-8">
                  Publica una necesidad urgente y en minutos profesionales disponibles
                  en tu zona recibirán la alerta. Sin llamadas, sin esperas.
                </p>
                <ul className="space-y-3 mb-8">
                  {COMPANY_FEATURES.map((f) => (
                    <li key={f.text} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <f.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm">{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/registro?rol=empresa">
                  <Button size="lg" className="gap-2">
                    <Building2 className="h-5 w-5" />
                    Empezar – gratis o desde 49€/mes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING TEASER */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes para cada necesidad</h2>
            <p className="text-muted-foreground text-lg mb-10">Sin permanencia. Sin complicaciones.</p>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <Card className="border-2 border-border hover:border-primary/30 transition-colors">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mx-auto mb-2">Profesionales</Badge>
                  <CardTitle className="text-2xl">
                    Gratis
                    <span className="text-sm font-normal text-muted-foreground"> o 2,99€/mes</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Perfil + acceso a ofertas + alertas instantáneas</p>
                </CardHeader>
                <CardContent>
                  <Link href="/auth/registro?rol=profesional">
                    <Button variant="outline" className="w-full">Crear perfil gratis</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 border-primary">
                <CardHeader>
                  <Badge className="w-fit mx-auto mb-2">Centros y entidades</Badge>
                  <CardTitle className="text-2xl">
                    Gratis
                    <span className="text-sm font-normal text-muted-foreground"> o hasta 99€/mes</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Publicación ilimitada + matching IA + cobertura urgente</p>
                </CardHeader>
                <CardContent>
                  <Link href="/precios">
                    <Button className="w-full">Ver todos los planes</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              La respuesta educativa empieza aquí
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-10">
              Únete a la red que ya está cubriendo necesidades educativas en tiempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/registro?rol=empresa">
                <Button size="lg" variant="secondary" className="gap-2 px-8">
                  <Building2 className="h-5 w-5" />
                  Soy un centro o entidad
                </Button>
              </Link>
              <Link href="/auth/registro?rol=profesional">
                <button className="inline-flex items-center gap-2 px-8 text-base font-medium h-11 rounded-lg border-2 border-white text-white bg-transparent hover:bg-white/15 transition-colors">
                  <GraduationCap className="h-5 w-5" />
                  Soy un profesional
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
