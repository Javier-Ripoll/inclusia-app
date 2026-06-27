'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, ArrowRight, ArrowLeft, Zap, GraduationCap, Building2 } from 'lucide-react'
import { LocationSelect } from '@/components/ui/location-select'

/* ── PROFESSIONAL CONSTANTS ── */
const SPECIALIZATIONS_MAIN = [
  { value: 'pati', label: 'PATI' },
  { value: 'tea', label: 'TEA' },
  { value: 'tdah', label: 'TDAH' },
  { value: 'altas_capacidades', label: 'Altas capacidades' },
  { value: 'discapacidad_motora', label: 'Discapacidad motora' },
  { value: 'discapacidad_intelectual', label: 'Discapacidad intelectual' },
  { value: 'dificultades_aprendizaje', label: 'Dificultades de aprendizaje' },
  { value: 'lenguaje', label: 'Lenguaje y comunicación' },
  { value: 'conducta', label: 'Conducta' },
  { value: 'vision', label: 'Visión' },
  { value: 'audicion', label: 'Audición' },
]

const SPECIALIZATIONS_EXTRA = [
  { value: 'trabajador_social', label: 'Trabajador Social' },
  { value: 'inclusion_social', label: 'Inclusión Social' },
  { value: 'intervencion_vulnerables', label: 'Intervención con sectores vulnerables' },
  { value: 'integracion_social', label: 'Integración Social' },
  { value: 'educacion_especial', label: 'Educación Especial' },
  { value: 'orientacion_educativa', label: 'Orientación Educativa' },
  { value: 'psicomotricidad', label: 'Psicomotricidad' },
  { value: 'musicoterapia', label: 'Musicoterapia' },
  { value: 'estimulacion_temprana', label: 'Estimulación Temprana' },
  { value: 'mediacion', label: 'Mediación' },
  { value: 'educacion_emocional', label: 'Educación Emocional' },
  { value: 'habilidades_sociales', label: 'Habilidades Sociales' },
  { value: 'autismo', label: 'Autismo (ABA / EIBI)' },
  { value: 'down', label: 'Síndrome de Down' },
  { value: 'paralisis_cerebral', label: 'Parálisis Cerebral' },
  { value: 'dislexia', label: 'Dislexia y DEA' },
  { value: 'bilingue', label: 'Educación Bilingüe' },
  { value: 'intervencion_familias', label: 'Intervención con Familias' },
  { value: 'menores_tutela', label: 'Menores en Tutela' },
  { value: 'inmigracion', label: 'Inmigración y Refugio' },
  { value: 'violencia_genero', label: 'Violencia de Género' },
  { value: 'adicciones', label: 'Adicciones' },
  { value: 'salud_mental', label: 'Salud Mental Infantojuvenil' },
  { value: 'gerontologia', label: 'Gerontología Social' },
  { value: 'pedagogia_terapeutica', label: 'Pedagogía Terapéutica (PT)' },
  { value: 'aula_convivencia', label: 'Aula de Convivencia' },
  { value: 'lectoescritura', label: 'Lectoescritura' },
  { value: 'matematicas_dificultad', label: 'Dificultades en Matemáticas' },
  { value: 'superdotacion', label: 'Superdotación' },
  { value: 'tics_tecnologia', label: 'TIC y Tecnología Educativa' },
]

const SPECIALIZATIONS = [...SPECIALIZATIONS_MAIN, ...SPECIALIZATIONS_EXTRA]

const AVAILABILITIES = [
  { value: 'full_time', label: 'Jornada completa' },
  { value: 'part_time', label: 'Media jornada' },
  { value: 'mornings', label: 'Mañanas' },
  { value: 'afternoons', label: 'Tardes' },
  { value: 'weekends', label: 'Fines de semana' },
  { value: 'on_call', label: 'A llamada / Urgencias' },
]

const COMPANY_TYPES = [
  { value: 'colegio', label: 'Colegio' },
  { value: 'instituto', label: 'Instituto' },
  { value: 'guarderia', label: 'Guardería / Escuela infantil' },
  { value: 'centro_especial', label: 'Centro de educación especial' },
  { value: 'academia', label: 'Academia o centro privado' },
  { value: 'asociacion', label: 'Asociación' },
  { value: 'fundacion', label: 'Fundación' },
  { value: 'otro', label: 'Otro' },
]

interface Props {
  role: 'professional' | 'company'
  name: string
  professionalProfileId?: string | null
  companyProfileId?: string | null
  initialData: Record<string, any>
}

export function OnboardingWizard({ role, name, professionalProfileId, companyProfileId, initialData }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Professional state
  const [specializations, setSpecializations] = useState<string[]>(initialData.specializations ?? [])
  const [availabilities, setAvailabilities] = useState<string[]>(initialData.availabilities ?? [])
  const [showMoreSpecs, setShowMoreSpecs] = useState(false)
  const [availableNow, setAvailableNow] = useState(false)
  const [yearsExp, setYearsExp] = useState<number>(initialData.years_experience ?? 0)
  const [bio, setBio] = useState<string>(initialData.bio ?? '')

  // Company state
  const [companyType, setCompanyType] = useState<string>(initialData.company_type ?? '')
  const [description, setDescription] = useState<string>(initialData.description ?? '')
  const [city, setCity] = useState<string>(initialData.city ?? '')
  const [province, setProvince] = useState<string>(initialData.province ?? '')
  const [phone, setPhone] = useState<string>(initialData.phone ?? '')

  const isProfessional = role === 'professional'
  const totalSteps = isProfessional ? 3 : 3
  const progress = Math.round(((step + 1) / totalSteps) * 100)

  function toggleItem(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  const handleFinish = async () => {
    setSaving(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isProfessional && professionalProfileId) {
      await supabase.from('professional_profiles').update({
        specializations,
        availabilities,
        available_immediately: availableNow,
        is_available: availabilities.length > 0,
        years_experience: yearsExp,
        bio,
      }).eq('id', professionalProfileId)
    }

    if (!isProfessional && companyProfileId) {
      await supabase.from('company_profiles').update({
        company_type: companyType || null,
        description: description || null,
      }).eq('id', companyProfileId)

      await supabase.from('profiles').update({
        city: city || null,
        province: province || null,
        phone: phone || null,
      }).eq('id', user.id)
    }

    // Mark onboarding as done
    await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)

    setSaving(false)
    window.location.href = '/dashboard'
  }

  /* ─── PROFESSIONAL STEPS ─── */
  const professionalSteps = [
    {
      title: '¿En qué te especializas?',
      subtitle: 'Selecciona las áreas en las que trabajas. Puedes elegir varias.',
      icon: <GraduationCap className="h-6 w-6 text-primary" />,
      content: (
        <div className="relative">
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS_MAIN.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleItem(specializations, setSpecializations, s.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                  specializations.includes(s.value)
                    ? 'border-primary bg-primary text-white'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                {s.label}
              </button>
            ))}
            {showMoreSpecs && SPECIALIZATIONS_EXTRA.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleItem(specializations, setSpecializations, s.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                  specializations.includes(s.value)
                    ? 'border-primary bg-primary text-white'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={() => setShowMoreSpecs(!showMoreSpecs)}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-full border border-primary/30 hover:border-primary/60 bg-primary/5"
            >
              {showMoreSpecs ? 'Ver menos' : `+${SPECIALIZATIONS_EXTRA.length} más`}
            </button>
          </div>
        </div>
      ),
      canContinue: specializations.length > 0,
    },
    {
      title: '¿Cuál es tu disponibilidad?',
      subtitle: 'Indica cuándo puedes trabajar. Puedes seleccionar varias opciones.',
      icon: <Zap className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {AVAILABILITIES.map(a => (
              <button
                key={a.value}
                type="button"
                onClick={() => toggleItem(availabilities, setAvailabilities, a.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                  availabilities.includes(a.value)
                    ? 'border-primary bg-primary text-white'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAvailableNow(!availableNow)}
            className={`flex items-center gap-3 w-full p-4 rounded-xl border-2 text-left transition-all ${
              availableNow ? 'border-orange-400 bg-orange-50' : 'border-border hover:border-orange-300'
            }`}
          >
            <Zap className={`h-5 w-5 ${availableNow ? 'text-orange-500' : 'text-muted-foreground'}`} />
            <div>
              <p className="font-medium text-sm">Disponible de inmediato</p>
              <p className="text-xs text-muted-foreground">Puedo incorporarme en menos de 24–48h si es urgente</p>
            </div>
            {availableNow && <CheckCircle className="h-5 w-5 text-orange-500 ml-auto flex-shrink-0" />}
          </button>
        </div>
      ),
      canContinue: availabilities.length > 0,
    },
    {
      title: 'Cuéntanos sobre ti',
      subtitle: 'Una pequeña presentación para que los centros te conozcan mejor.',
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="bio">Sobre mí</Label>
            <Textarea
              id="bio"
              placeholder="Soy PT con 5 años de experiencia en centros de educación especial, especializado en TEA y conducta..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">{bio.length}/500 caracteres</p>
          </div>
          <div>
            <Label htmlFor="years">Años de experiencia</Label>
            <Input
              id="years"
              type="number"
              min={0}
              max={50}
              value={yearsExp}
              onChange={e => setYearsExp(parseInt(e.target.value) || 0)}
              className="mt-1 w-32"
            />
          </div>
        </div>
      ),
      canContinue: true, // optional step
    },
  ]

  /* ─── COMPANY STEPS ─── */
  const companySteps = [
    {
      title: '¿Qué tipo de centro sois?',
      subtitle: 'Selecciona la categoría que mejor describe vuestra entidad.',
      icon: <Building2 className="h-6 w-6 text-primary" />,
      content: (
        <div className="grid grid-cols-2 gap-2">
          {COMPANY_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setCompanyType(t.value)}
              className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                companyType === t.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      ),
      canContinue: !!companyType,
    },
    {
      title: '¿Dónde estáis ubicados?',
      subtitle: 'Los profesionales filtran ofertas por zona, así os encontrarán más fácil.',
      icon: <Building2 className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <LocationSelect
            provincia={province}
            ciudad={city}
            onProvinciaChange={setProvince}
            onCiudadChange={setCity}
          />
          <div>
            <Label htmlFor="phone">Teléfono de contacto</Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="91 000 00 00" className="mt-1" />
          </div>
        </div>
      ),
      canContinue: !!city && !!province,
    },
    {
      title: 'Describe vuestro centro',
      subtitle: 'Una descripción atractiva ayuda a que los mejores profesionales quieran trabajar con vosotros.',
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      content: (
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Somos un colegio concertado con 20 años de trayectoria, especializado en educación inclusiva. Contamos con un equipo de 3 orientadores y buscamos profesionales comprometidos..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">{description.length}/600 caracteres</p>
        </div>
      ),
      canContinue: true, // optional
    },
  ]

  const steps = isProfessional ? professionalSteps : companySteps
  const currentStep = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">I</span>
          </div>
          {step === 0 && (
            <>
              <h1 className="text-2xl font-bold mb-1">¡Bienvenido/a, {name.split(' ')[0]}! 👋</h1>
              <p className="text-muted-foreground text-sm">
                Vamos a configurar tu perfil en 3 pasos rápidos para que empieces a {isProfessional ? 'encontrar ofertas' : 'publicar ofertas'}.
              </p>
            </>
          )}
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Paso {step + 1} de {totalSteps}</span>
            <span>{progress}% completado</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
          <div className="flex items-center gap-3 mb-1">
            {currentStep.icon}
            <h2 className="text-xl font-bold">{currentStep.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{currentStep.subtitle}</p>

          {currentStep.content}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            onClick={async () => {
              if (step > 0) {
                setStep(step - 1)
              } else {
                // Skip onboarding — mark as completed so no redirect loop
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                  await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)
                }
                window.location.href = '/dashboard'
              }
            }}
            className="gap-1 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? 'Saltar por ahora' : 'Atrás'}
          </Button>

          <Button
            disabled={!currentStep.canContinue || saving}
            onClick={() => isLast ? handleFinish() : setStep(step + 1)}
            className="gap-2 min-w-32"
          >
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
              : isLast
                ? <><CheckCircle className="h-4 w-4" /> Empezar</>
                : <>Continuar <ArrowRight className="h-4 w-4" /></>
            }
          </Button>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === step ? 'w-6 h-2 bg-primary' : i < step ? 'w-2 h-2 bg-primary/50' : 'w-2 h-2 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
