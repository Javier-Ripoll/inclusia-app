'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Loader2, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { LocationSelect } from '@/components/ui/location-select'

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

export function EditOfferForm({ offer }: { offer: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(offer.title ?? '')
  const [description, setDescription] = useState(offer.description ?? '')
  const [city, setCity] = useState(offer.city ?? '')
  const [province, setProvince] = useState(offer.province ?? '')
  const [isUrgent, setIsUrgent] = useState(offer.is_urgent ?? false)
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(offer.required_specializations ?? [])
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<string[]>(offer.availability_needed ?? [])
  const [contractType, setContractType] = useState(offer.contract_type ?? '')
  const [salaryMin, setSalaryMin] = useState(offer.salary_min?.toString() ?? '')
  const [salaryMax, setSalaryMax] = useState(offer.salary_max?.toString() ?? '')
  const [salaryPeriod, setSalaryPeriod] = useState<'hour' | 'month' | 'year'>(offer.salary_period ?? 'year')
  const [requiredExperience, setRequiredExperience] = useState(offer.required_experience_years?.toString() ?? '0')
  const [startDate, setStartDate] = useState(offer.start_date ?? '')

  const toggleSpec = (s: string) =>
    setSelectedSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const toggleAvailability = (a: string) =>
    setSelectedAvailabilities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: updateError } = await supabase.from('job_offers').update({
      title,
      description,
      city,
      province,
      is_urgent: isUrgent,
      offer_type: isUrgent ? 'urgent' : 'standard',
      required_specializations: selectedSpecs,
      availability_needed: selectedAvailabilities,
      contract_type: contractType || null,
      salary_min: salaryMin ? parseFloat(salaryMin) : null,
      salary_max: salaryMax ? parseFloat(salaryMax) : null,
      salary_period: salaryPeriod,
      required_experience_years: parseInt(requiredExperience) || 0,
      start_date: startDate || null,
    }).eq('id', offer.id)

    if (updateError) {
      setError('Error al guardar los cambios: ' + updateError.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/ofertas/${offer.id}`)
    router.refresh()
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/dashboard/ofertas/${offer.id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar oferta</h1>
          <p className="text-muted-foreground">Modifica los detalles de tu oferta</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
          <CardHeader><CardTitle className="text-base">Información básica</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título del puesto *</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">Descripción del puesto *</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={5} />
            </div>
            <LocationSelect
              provincia={province}
              ciudad={city}
              onProvinciaChange={setProvince}
              onCiudadChange={setCity}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Especialización requerida</CardTitle>
            <CardDescription>Selecciona las áreas necesarias para el puesto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map(s => (
                <button key={s} type="button" onClick={() => toggleSpec(s)}
                  className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${selectedSpecs.includes(s) ? 'bg-primary text-white border-primary' : 'bg-white border-border hover:border-primary/50'}`}>
                  {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Disponibilidad y condiciones</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Disponibilidad horaria</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITIES.map(a => (
                  <button key={a.value} type="button" onClick={() => toggleAvailability(a.value)}
                    className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${selectedAvailabilities.includes(a.value) ? 'bg-primary text-white border-primary' : 'bg-white border-border hover:border-primary/50'}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contractType">Tipo de contrato</Label>
                <Input id="contractType" placeholder="Indefinido, temporal..." value={contractType} onChange={e => setContractType(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="experience">Experiencia mínima (años)</Label>
                <Input id="experience" type="number" min="0" value={requiredExperience} onChange={e => setRequiredExperience(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Salario (€)</Label>
              <div className="flex gap-2 items-center flex-wrap">
                <Input type="number" placeholder="Mínimo" className="w-32" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} />
                <span className="text-muted-foreground text-sm">–</span>
                <Input type="number" placeholder="Máximo" className="w-32" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} />
                <select value={salaryPeriod} onChange={e => setSalaryPeriod(e.target.value as 'hour' | 'month' | 'year')}
                  className="border border-input rounded-md px-3 py-2 text-sm bg-background">
                  <option value="hour">por hora</option>
                  <option value="month">al mes</option>
                  <option value="year">al año</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="startDate">Fecha de incorporación</Label>
              <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href={`/dashboard/ofertas/${offer.id}`}>
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
