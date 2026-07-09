'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function OutreachBlast() {
  const [emailsRaw, setEmailsRaw] = useState('')
  const [subject, setSubject] = useState('Encuentra profesionales de apoyo educativo con Inclusia')
  const [message, setMessage] = useState(`Hola,

Me pongo en contacto contigo porque hemos creado Inclusia, una plataforma específica para conectar centros educativos, gabinetes y entidades sociales con profesionales de apoyo educativo: PATI, logopedas, terapeutas ocupacionales, integradores sociales, psicólogos y educadores sociales.

Publicar una oferta es gratuito y en pocos minutos tienes candidatos cualificados en tu zona.

Si en algún momento necesitáis cubrir una baja, ampliar el equipo o encontrar un profesional para un proyecto, Inclusia os puede ayudar.

Un saludo,
El equipo de Inclusia`)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: string[]; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parsedEmails = emailsRaw
    .split(/[\n,;]+/)
    .map(e => e.trim())
    .filter(e => e.includes('@'))

  const handleSend = async () => {
    setError(null)
    setResult(null)
    if (parsedEmails.length === 0) { setError('Añade al menos un email'); return }
    if (!subject.trim()) { setError('El asunto no puede estar vacío'); return }
    if (!message.trim()) { setError('El mensaje no puede estar vacío'); return }

    const confirmed = window.confirm(
      `¿Enviar el email a ${parsedEmails.length} destinatario${parsedEmails.length !== 1 ? 's' : ''}?\n\nAsunto: ${subject}`
    )
    if (!confirmed) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/blast-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: parsedEmails, subject, message }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al enviar'); return }
      setResult(data)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="outreach-emails" className="text-sm font-medium">
          Emails destinatarios
          {parsedEmails.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              ({parsedEmails.length} detectados)
            </span>
          )}
        </Label>
        <Textarea
          id="outreach-emails"
          placeholder={"contacto@ceip-ejemplo.es\ndirector@gabinete.com\ninfo@asociacion.org\n\nSepara por líneas, comas o punto y coma"}
          value={emailsRaw}
          onChange={e => setEmailsRaw(e.target.value)}
          className="mt-1.5 font-mono text-xs h-32 resize-none"
        />
      </div>

      <div>
        <Label htmlFor="outreach-subject" className="text-sm font-medium">Asunto</Label>
        <Input
          id="outreach-subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="outreach-message" className="text-sm font-medium">Mensaje</Label>
        <Textarea
          id="outreach-message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="mt-1.5 text-sm h-52 resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          El email incluirá automáticamente la cabecera de Inclusia y el botón "Conocer Inclusia".
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="flex items-start gap-2 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 font-medium">
              Enviado a {result.sent} de {result.total} destinatarios
            </p>
            {result.failed.length > 0 && (
              <p className="text-red-600 text-xs mt-1">
                Fallaron: {result.failed.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      <Button
        onClick={handleSend}
        disabled={loading || parsedEmails.length === 0}
        className="w-full"
      >
        {loading
          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando ({parsedEmails.length} emails)...</>
          : <><Send className="mr-2 h-4 w-4" /> Enviar a {parsedEmails.length} destinatario{parsedEmails.length !== 1 ? 's' : ''}</>
        }
      </Button>
    </div>
  )
}
