'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Mail, MessageSquare, Building2, GraduationCap, Loader2 } from 'lucide-react'

const TIPOS = [
  { value: 'Centro / Entidad', label: 'Soy un centro o entidad', icon: Building2 },
  { value: 'Profesional', label: 'Soy un profesional', icon: GraduationCap },
  { value: 'Otro', label: 'Otro', icon: MessageSquare },
]

export default function ContactoPage() {
  const [tipo, setTipo] = useState('')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, tipo, mensaje }),
      })

      if (!res.ok) throw new Error()
      setEnviado(true)
    } catch {
      setError('Ha ocurrido un error. Por favor inténtalo de nuevo o escríbenos directamente a inclusiajobs@gmail.com')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Contacta con nosotros</h1>
            <p className="text-muted-foreground">
              ¿Tienes dudas sobre Inclusia? Escríbenos y te respondemos en menos de 24h.
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              {enviado ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">¡Mensaje enviado!</h2>
                  <p className="text-muted-foreground mb-6">
                    Hemos recibido tu mensaje. Te responderemos en menos de 24 horas.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                  >
                    Volver al inicio
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Tipo */}
                  <div>
                    <Label className="mb-3 block">¿Quién eres?</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {TIPOS.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setTipo(t.value)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 text-xs font-medium transition-colors ${
                            tipo === t.value
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          <t.icon className="h-5 w-5" />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nombre */}
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      placeholder="Tu nombre o el nombre del centro"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      required
                      className="mt-1.5"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="mt-1.5"
                    />
                  </div>

                  {/* Mensaje */}
                  <div>
                    <Label htmlFor="mensaje">Mensaje *</Label>
                    <Textarea
                      id="mensaje"
                      placeholder="¿En qué podemos ayudarte?"
                      value={mensaje}
                      onChange={e => setMensaje(e.target.value)}
                      required
                      rows={5}
                      className="mt-1.5 resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                    ) : (
                      <><Mail className="h-4 w-4" /> Enviar mensaje</>
                    )}
                  </button>

                  <p className="text-xs text-center text-muted-foreground">
                    También puedes escribirnos directamente a{' '}
                    <a href="mailto:inclusiajobs@gmail.com" className="text-primary hover:underline">
                      inclusiajobs@gmail.com
                    </a>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
