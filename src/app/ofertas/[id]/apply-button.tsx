'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, Loader2, Send } from 'lucide-react'

interface Props {
  offerId: string
  professionalProfileId: string | null
  alreadyApplied: boolean
  isLoggedIn: boolean
}

export function ApplyButton({ offerId, professionalProfileId, alreadyApplied, isLoggedIn }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(alreadyApplied)

  if (!isLoggedIn) {
    return (
      <div className="space-y-2">
        <Link href="/auth/registro?rol=profesional">
          <Button className="w-full">Crear cuenta para aplicar</Button>
        </Link>
        <Link href="/auth/login">
          <Button variant="outline" className="w-full text-sm">Ya tengo cuenta</Button>
        </Link>
      </div>
    )
  }

  if (!professionalProfileId) {
    return <p className="text-sm text-muted-foreground text-center">Solo los profesionales pueden aplicar a ofertas.</p>
  }

  if (done) {
    return (
      <div className="text-center py-2">
        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
        <p className="font-medium text-green-700">Candidatura enviada</p>
        <p className="text-xs text-muted-foreground mt-1">El centro revisará tu perfil y se pondrá en contacto</p>
      </div>
    )
  }

  const handleApply = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('applications').insert({
      offer_id: offerId,
      professional_id: professionalProfileId,
      cover_letter: coverLetter || null,
      status: 'pending',
    })
    setLoading(false)
    if (!error) {
      setDone(true)
      router.refresh()
    }
  }

  if (showForm) {
    return (
      <div className="space-y-3">
        <Label className="text-sm">Carta de presentación (opcional)</Label>
        <Textarea
          placeholder="Cuéntale al centro por qué eres la persona ideal para este puesto..."
          value={coverLetter}
          onChange={e => setCoverLetter(e.target.value)}
          rows={4}
        />
        <Button onClick={handleApply} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Enviar candidatura
        </Button>
        <Button variant="ghost" className="w-full text-xs" onClick={() => setShowForm(false)}>Cancelar</Button>
      </div>
    )
  }

  return (
    <Button className="w-full gap-2" size="lg" onClick={() => setShowForm(true)}>
      <Send className="h-4 w-4" /> Aplicar a esta oferta
    </Button>
  )
}
