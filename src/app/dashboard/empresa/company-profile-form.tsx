'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Loader2, Building2, Globe, MapPin, Phone, FileText, Tag } from 'lucide-react'

const COMPANY_TYPES = [
  'Colegio público',
  'Colegio concertado',
  'Colegio privado',
  'Centro de educación especial',
  'Centro de atención temprana',
  'AMPA / Asociación',
  'Centro terapéutico',
  'Escuela infantil',
  'Otro',
]

interface Props {
  profile: any
  companyProfile: any
}

export function CompanyProfileForm({ profile, companyProfile }: Props) {
  // profiles fields
  const [contactName, setContactName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [city, setCity] = useState(profile?.city ?? '')
  const [province, setProvince] = useState(profile?.province ?? '')

  // company_profiles fields
  const [companyName, setCompanyName] = useState(companyProfile?.company_name ?? '')
  const [companyType, setCompanyType] = useState(companyProfile?.company_type ?? '')
  const [cif, setCif] = useState(companyProfile?.cif ?? '')
  const [website, setWebsite] = useState(companyProfile?.website ?? '')
  const [description, setDescription] = useState(companyProfile?.description ?? '')

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const completeness = [companyName, companyType, description, city, phone]
    .filter(Boolean).length
  const completePct = Math.round((completeness / 5) * 100)

  const handleSave = async () => {
    if (!companyName.trim()) {
      setError('El nombre del centro es obligatorio.')
      return
    }
    setSaving(true)
    setSaved(false)
    setError(null)
    const supabase = createClient()

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from('profiles')
        .update({ full_name: contactName, phone, city, province })
        .eq('id', profile.id),
      supabase.from('company_profiles')
        .update({ company_name: companyName, company_type: companyType || null, cif: cif || null, website: website || null, description: description || null })
        .eq('user_id', profile.id),
    ])

    setSaving(false)
    if (e1 || e2) {
      setError('Error al guardar. Inténtalo de nuevo.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Completeness bar */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Perfil completado</span>
          <span className="text-sm font-bold text-primary">{completePct}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${completePct}%` }}
          />
        </div>
        {completePct < 100 && (
          <p className="text-xs text-muted-foreground mt-2">
            Un perfil completo genera más confianza en los profesionales.
          </p>
        )}
      </div>

      {/* Centro */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Información del centro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="company-name">
                Nombre del centro <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Colegio San José"
              />
            </div>
            <div>
              <Label htmlFor="company-type">Tipo de centro</Label>
              <select
                id="company-type"
                value={companyType}
                onChange={e => setCompanyType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Seleccionar tipo...</option>
                {COMPANY_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="cif">CIF / NIF</Label>
              <Input
                id="cif"
                value={cif}
                onChange={e => setCif(e.target.value)}
                placeholder="B12345678"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">
              Descripción del centro
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe tu centro: filosofía educativa, etapas que cubre, número de alumnos, necesidades habituales de apoyo..."
            />
            <p className="text-xs text-muted-foreground mt-1">{description.length}/500 caracteres</p>
          </div>
        </CardContent>
      </Card>

      {/* Ubicación */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Ciudad / Municipio</Label>
              <Input
                id="city"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Valencia"
              />
            </div>
            <div>
              <Label htmlFor="province">Provincia</Label>
              <Input
                id="province"
                value={province}
                onChange={e => setProvince(e.target.value)}
                placeholder="Valencia"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacto */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" /> Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact-name">Nombre del responsable</Label>
              <Input
                id="contact-name"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="María García"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono de contacto</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="612 345 678"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="website" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Sitio web
            </Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://www.micentro.es"
            />
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {saved && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Perfil guardado correctamente.</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Guardar perfil
      </Button>
    </div>
  )
}
