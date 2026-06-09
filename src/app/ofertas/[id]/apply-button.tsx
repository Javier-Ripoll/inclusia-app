'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, Loader2, Send, AlertCircle } from 'lucide-react'

interface Props {
  offerId: string
  professionalProfileId: string | null
  alreadyApplied: boolean
  isLoggedIn: boolean
}

export function ApplyButton({ offerId, professionalProfileId: initialProfId, alreadyApplied, isLoggedIn: initialIsLoggedIn }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(alreadyApplied)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  // Client-side state: fallback if server-render had no session
  const [professionalProfileId, setProfessionalProfileId] = useState<string | null>(initialProfId)
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn)
  const [clientChecked, setClientChecked] = useState(false)

  useEffect(() => {
    // If server already found the profile, no need to check client-side
    if (initialProfId) { setClientChecked(true); return }

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setClientChecked(true); return }
      setIsLoggedIn(true)
      const { data: prof } = await supabase
        .from('professional_profiles').select('id').eq('user_id', user.id).single()
      if (prof) setProfessionalProfileId(prof.id)
      setClientChecked(true)
    })
  }, [])

  // While checking client-side session, show a spinner (only if server also had no session)
  if (!clientChecked && !initialIsLoggedIn) {
    return <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
  }

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
    return (
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">Solo los profesionales pueden aplicar a ofertas.</p>
        <p className="text-xs text-muted-foreground">¿Tienes cuenta de profesional? <Link href="/auth/login" className="text-primary underline">Inicia sesión</Link></p>
      </div>
    )
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
    setErrorMsg(null)
    const supabase = createClient()

    // First verify the session is active
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErrorMsg('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.')
      setLoading(false)
      return
    }

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
    } else {
      console.error('Apply error:', error)
      if (error.code === '23505') {
        setErrorMsg('Ya has enviado una candidatura para esta oferta.')
        setDone(true)
      } else {
        setErrorMsg(`Error al enviar: ${error.message}`)
      }
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
        {errorMsg && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-md p-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        <Button onClick={handleApply} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Enviar candidatura
        </Button>
        <Button variant="ghost" className="w-full text-xs" onClick={() => setShowForm(false)}>Cancelar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {errorMsg && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-md p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      <Button className="w-full gap-2" size="lg" onClick={() => setShowForm(true)}>
        <Send className="h-4 w-4" /> Aplicar a esta oferta
      </Button>
    </div>
  )
}
