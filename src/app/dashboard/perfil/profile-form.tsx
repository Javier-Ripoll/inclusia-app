'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Loader2, Plus, Trash2, CheckCircle, User, Briefcase,
  GraduationCap, MapPin, Clock, Star
} from 'lucide-react'

const SPECIALIZATIONS = [
  'Integración Social', 'Atención a la Dependencia', 'Auxiliar Educativo',
  'Terapia Ocupacional', 'Logopedia', 'Educación Infantil', 'Psicología Educativa',
  'Educación Especial', 'Fisioterapia', 'Monitor de Ocio y Tiempo Libre',
  'Técnico en Animación Sociocultural', 'Trabajo Social',
]

const AVAILABILITIES = [
  { value: 'full_time', label: 'Jornada completa' },
  { value: 'part_time', label: 'Media jornada' },
  { value: 'mornings', label: 'Mañanas' },
  { value: 'afternoons', label: 'Tardes' },
  { value: 'weekends', label: 'Fines de semana' },
  { value: 'on_call', label: 'A llamada / Sustituciones' },
]

interface Props {
  profile: any
  professionalProfile: any
  education: any[]
  experience: any[]
}

export function ProfessionalProfileForm({ profile, professionalProfile, education, experience }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Personal info
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [province, setProvince] = useState(profile?.province ?? '')

  // Professional info
  const [bio, setBio] = useState(professionalProfile?.bio ?? '')
  const [yearsExp, setYearsExp] = useState(professionalProfile?.years_experience ?? 0)
  const [isAvailable, setIsAvailable] = useState(professionalProfile?.is_available ?? true)
  const [availableNow, setAvailableNow] = useState(professionalProfile?.available_immediately ?? false)
  const [specializations, setSpecializations] = useState<string[]>(professionalProfile?.specializations ?? [])
  const [availabilities, setAvailabilities] = useState<string[]>(professionalProfile?.availabilities ?? [])

  // Education
  const [educationList, setEducationList] = useState(education)
  const [newDegree, setNewDegree] = useState('')
  const [newInstitution, setNewInstitution] = useState('')
  const [newYear, setNewYear] = useState('')

  // Experience
  const [experienceList, setExperienceList] = useState(experience)
  const [newPosition, setNewPosition] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newStartDate, setNewStartDate] = useState('')
  const [newEndDate, setNewEndDate] = useState('')
  const [newIsCurrent, setNewIsCurrent] = useState(false)
  const [newExpDesc, setNewExpDesc] = useState('')

  const toggleSpec = (s: string) =>
    setSpecializations(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const toggleAvail = (a: string) =>
    setAvailabilities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  // Calculate profile completion %
  const completionItems = [
    !!fullName, !!phone, !!city, !!bio,
    specializations.length > 0, availabilities.length > 0,
    yearsExp > 0, educationList.length > 0, experienceList.length > 0,
  ]
  const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const supabase = createClient()

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, city, province })
      .eq('id', profile.id)

    const { error: profError } = await supabase
      .from('professional_profiles')
      .update({
        bio,
        years_experience: yearsExp,
        is_available: isAvailable,
        available_immediately: availableNow,
        specializations,
        availabilities,
      })
      .eq('user_id', profile.id)

    if (profileError || profError) {
      setError('Error al guardar. Inténtalo de nuevo.')
      setSaving(false)
      return
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  const addEducation = async () => {
    if (!newDegree) return
    const supabase = createClient()
    const { data: prof } = await supabase
      .from('professional_profiles').select('id').eq('user_id', profile.id).single()
    const { data, error } = await supabase
      .from('professional_education')
      .insert({ professional_id: prof?.id, degree: newDegree, institution: newInstitution, year_completed: newYear ? parseInt(newYear) : null })
      .select().single()
    if (!error && data) {
      setEducationList(prev => [data, ...prev])
      setNewDegree(''); setNewInstitution(''); setNewYear('')
    }
  }

  const deleteEducation = async (id: string) => {
    const supabase = createClient()
    await supabase.from('professional_education').delete().eq('id', id)
    setEducationList(prev => prev.filter(e => e.id !== id))
  }

  const addExperience = async () => {
    if (!newPosition) return
    const supabase = createClient()
    const { data: prof } = await supabase
      .from('professional_profiles').select('id').eq('user_id', profile.id).single()
    const { data, error } = await supabase
      .from('professional_experience')
      .insert({
        professional_id: prof?.id,
        position: newPosition,
        company: newCompany,
        start_date: newStartDate || null,
        end_date: newIsCurrent ? null : (newEndDate || null),
        is_current: newIsCurrent,
        description: newExpDesc,
      })
      .select().single()
    if (!error && data) {
      setExperienceList(prev => [data, ...prev])
      setNewPosition(''); setNewCompany(''); setNewStartDate('')
      setNewEndDate(''); setNewIsCurrent(false); setNewExpDesc('')
    }
  }

  const deleteExperience = async (id: string) => {
    const supabase = createClient()
    await supabase.from('professional_experience').delete().eq('id', id)
    setExperienceList(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Completion bar */}
      <Card className={completion === 100 ? 'border-green-200 bg-green-50' : 'border-primary/20 bg-primary/5'}>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Completitud del perfil</span>
            <span className={`text-sm font-bold ${completion >= 80 ? 'text-green-600' : 'text-primary'}`}>{completion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${completion >= 80 ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${completion}%` }}
            />
          </div>
          {completion < 100 && (
            <p className="text-xs text-muted-foreground mt-2">
              Un perfil completo tiene {5}x más visibilidad ante los centros
            </p>
          )}
        </CardContent>
      </Card>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {saved && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">Perfil guardado correctamente</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="personal">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="personal" className="gap-1.5 text-xs">
            <User className="h-3.5 w-3.5" /> Personal
          </TabsTrigger>
          <TabsTrigger value="profesional" className="gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5" /> Profesional
          </TabsTrigger>
          <TabsTrigger value="formacion" className="gap-1.5 text-xs">
            <GraduationCap className="h-3.5 w-3.5" /> Formación
          </TabsTrigger>
          <TabsTrigger value="experiencia" className="gap-1.5 text-xs">
            <Briefcase className="h-3.5 w-3.5" /> Experiencia
          </TabsTrigger>
        </TabsList>

        {/* PERSONAL */}
        <TabsContent value="personal" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Datos personales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nombre completo</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ana García López" />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="612 345 678" type="tel" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ciudad</Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Valencia" />
                </div>
                <div>
                  <Label>Provincia</Label>
                  <Input value={province} onChange={e => setProvince(e.target.value)} placeholder="Valencia" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Disponibilidad</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Estoy buscando trabajo</p>
                  <p className="text-xs text-muted-foreground">Los centros podrán encontrarte</p>
                </div>
                <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Disponible ahora mismo</p>
                  <p className="text-xs text-muted-foreground">Aparecerás en el listado de disponibles al instante</p>
                </div>
                <Switch checked={availableNow} onCheckedChange={setAvailableNow} />
              </div>
              <Separator />
              <div>
                <Label className="mb-2 block">Horario disponible</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABILITIES.map(a => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => toggleAvail(a.value)}
                      className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                        availabilities.includes(a.value)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white border-border hover:border-primary/50'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar cambios'}
          </Button>
        </TabsContent>

        {/* PROFESIONAL */}
        <TabsContent value="profesional" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Sobre ti</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Presentación profesional</Label>
                <Textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Cuéntanos quién eres, tu experiencia y qué tipo de puestos te interesan..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">{bio.length}/500 caracteres</p>
              </div>
              <div>
                <Label>Años de experiencia</Label>
                <Input
                  type="number"
                  min="0"
                  max="40"
                  value={yearsExp}
                  onChange={e => setYearsExp(parseInt(e.target.value) || 0)}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Especialidades</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Selecciona las áreas en las que estás formado/a</p>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpec(s)}
                    className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                      specializations.includes(s)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-border hover:border-primary/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {specializations.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                  {specializations.map(s => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar cambios'}
          </Button>
        </TabsContent>

        {/* FORMACIÓN */}
        <TabsContent value="formacion" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Añadir titulación</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titulación *</Label>
                <Input value={newDegree} onChange={e => setNewDegree(e.target.value)} placeholder="Técnico Superior en Integración Social" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Centro / Universidad</Label>
                  <Input value={newInstitution} onChange={e => setNewInstitution(e.target.value)} placeholder="IES Ejemplo" />
                </div>
                <div>
                  <Label>Año de finalización</Label>
                  <Input value={newYear} onChange={e => setNewYear(e.target.value)} placeholder="2022" type="number" min="1980" max="2030" />
                </div>
              </div>
              <Button onClick={addEducation} disabled={!newDegree} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Añadir titulación
              </Button>
            </CardContent>
          </Card>

          {educationList.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Mis titulaciones</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {educationList.map((edu: any) => (
                    <li key={edu.id} className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-sm">{edu.degree}</p>
                        <p className="text-xs text-muted-foreground">
                          {edu.institution}{edu.year_completed ? ` · ${edu.year_completed}` : ''}
                        </p>
                      </div>
                      <button onClick={() => deleteEducation(edu.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* EXPERIENCIA */}
        <TabsContent value="experiencia" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Añadir experiencia</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cargo / Puesto *</Label>
                <Input value={newPosition} onChange={e => setNewPosition(e.target.value)} placeholder="Integrador/a Social" />
              </div>
              <div>
                <Label>Centro / Empresa</Label>
                <Input value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="Fundación Ejemplo" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha inicio</Label>
                  <Input type="date" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} />
                </div>
                <div>
                  <Label>Fecha fin</Label>
                  <Input type="date" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} disabled={newIsCurrent} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={newIsCurrent} onCheckedChange={setNewIsCurrent} />
                <Label>Trabajo aquí actualmente</Label>
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} placeholder="Describe tus tareas y logros..." rows={3} />
              </div>
              <Button onClick={addExperience} disabled={!newPosition} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Añadir experiencia
              </Button>
            </CardContent>
          </Card>

          {experienceList.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Mi experiencia</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {experienceList.map((exp: any) => (
                    <li key={exp.id} className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-sm">{exp.position}</p>
                        <p className="text-xs text-muted-foreground">
                          {exp.company}
                          {exp.start_date && ` · ${new Date(exp.start_date).getFullYear()}`}
                          {exp.is_current ? ' – Actualidad' : exp.end_date ? ` – ${new Date(exp.end_date).getFullYear()}` : ''}
                        </p>
                        {exp.description && <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>}
                      </div>
                      <button onClick={() => deleteExperience(exp.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
