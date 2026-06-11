'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Loader2, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const SPECIALIZATIONS = [
  'PATI', 'Integración Social', 'Atención a la Dependencia', 'Auxiliar Educativo',
  'Terapia Ocupacional', 'Logopedia', 'Educación Infantil', 'Psicología Educativa',
  'Educación Especial', 'Fisioterapia', 'Monitor de Ocio y Tiempo Libre',
]

const AVAILABILITIES = [
  { value: 'full_time', label: 'Jornada completa' },
  { value: 'part_time', label: 'Media jornada' },
  { value: 'mornings', label: 'Mañanas' },
  { value: 'afternoons', label: 'Tardes' },
  { value: 'weekends', label: 'Fines de semana' },
  { value: 'on_call', label: 'A llamada' },
]

export default function NewOfferPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [offerType, setOfferType] = useState<'standard' | 'urgent' | 'substitute'>('standard')
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([])
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<string[]>([])
  const [contractType, setContractType] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [requiredExperience, setRequiredExperience] = useState('0')
  const [startDate, setStartDate] = useState('')

  const toggleSpec = (s: string) =>
    setSelectedSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const toggleAvailability = (a: string) =>
    setSelectedAvailabilities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!companyProfile) {
      setError('No se encontró el perfil de empresa')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('job_offers').insert({
      company_id: companyProfile.id,
      title,
      description,
      city,
      province,
      is_urgent: isUrgent,
      offer_type: isUrgent ? 'urgent' : offerType,
      required_specializations: selectedSpecs,
      availability_needed: selectedAvailabilities as any,
      contract_type: contractType || null,
      salary_min: salaryMin ? parseFloat(salaryMin) : null,
      salary_max: salaryMax ? parseFloat(salaryMax) : null,
      required_experience_years: parseInt(requiredExperience) || 0,
      start_date: startDate || null,
      status: 'active',
    })

    if (insertError) {
      setError('Error al publicar la oferta: ' + insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/ofertas')
    router.refresh()
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/ofertas">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Publicar nueva oferta</h1>
          <p className="text-muted-foreground">Encuentra al profesional ideal en minutos</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Urgency toggle */}
        <Card className={isUrgent ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className={`h-5 w-5 ${isUrgent ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <span className="font-medium">Oferta urgente</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Se notificará al instante a todos los profesionales disponibles en la zona
                </p>
              </div>
              <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título del puesto *</Label>
              <Input
                id="title"
                placeholder="Ej: Auxiliar educativo para Educación Infantil"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción del puesto *</Label>
              <Textarea
                id="description"
                placeholder="Describe las tareas, el entorno de trabajo, y el perfil que buscas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  placeholder="Valencia"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  placeholder="Valencia"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Especialización requerida</CardTitle>
            <CardDescription>Selecciona las áreas necesarias para el puesto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpec(s)}
                  className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                    selectedSpecs.includes(s)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white border-border hover:border-primary/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Disponibilidad y condiciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Disponibilidad horaria</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITIES.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => toggleAvailability(a.value)}
                    className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                      selectedAvailabilities.includes(a.value)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-border hover:border-primary/50'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contractType">Tipo de contrato</Label>
                <Input
                  id="contractType"
                  placeholder="Indefinido, temporal..."
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="experience">Experiencia mínima (años)</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={requiredExperience}
                  onChange={(e) => setRequiredExperience(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salaryMin">Salario mínimo (€/año)</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  placeholder="18000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="salaryMax">Salario máximo (€/año)</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  placeholder="22000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="startDate">Fecha de incorporación</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/dashboard/ofertas">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={loading} className={isUrgent ? 'bg-red-600 hover:bg-red-700' : ''}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUrgent ? 'Publicar oferta urgente' : 'Publicar oferta'}
          </Button>
        </div>
      </form>
    </div>
  )
}
