'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, GraduationCap, Building2 } from 'lucide-react'

type Role = 'profesional' | 'empresa'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get('rol') as Role) ?? 'profesional'

  const [role, setRole] = useState<Role>(initialRole)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role === 'profesional' ? 'professional' : 'company',
          company_name: role === 'empresa' ? companyName : undefined,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Enviar email de bienvenida (fire-and-forget, no bloquea el flujo)
    fetch('/api/email/bienvenida', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        fullName,
        role: role === 'profesional' ? 'professional' : 'company',
      }),
    }).catch(() => {})

    // Si hay sesión activa (confirmación desactivada), redirigir directo al dashboard
    if (authData.session) {
      window.location.href = '/dashboard'
      return
    }

    // Si no hay sesión (confirmación activada), mostrar mensaje de email
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Revisa tu email</h2>
            <p className="text-muted-foreground mb-4">
              Te hemos enviado un enlace de confirmación a <strong>{email}</strong>.
              Haz clic en el enlace para activar tu cuenta.
            </p>
            <Link href="/auth/login">
              <Button variant="outline">Ir al inicio de sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold">I</span>
            </div>
            <span className="font-bold text-2xl text-primary">Inclusia</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Crear cuenta</CardTitle>
            <CardDescription>Únete a la red de apoyo educativo</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole('profesional')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === 'profesional'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <GraduationCap className={`h-6 w-6 ${role === 'profesional' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${role === 'profesional' ? 'text-primary' : ''}`}>
                  Soy profesional
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole('empresa')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === 'empresa'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <Building2 className={`h-6 w-6 ${role === 'empresa' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${role === 'empresa' ? 'text-primary' : ''}`}>
                  Soy centro/entidad
                </span>
              </button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  placeholder="Ana García"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {role === 'empresa' && (
                <div>
                  <Label htmlFor="companyName">Nombre del centro / entidad</Label>
                  <Input
                    id="companyName"
                    placeholder="CEIP San José"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear cuenta gratuita
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Al registrarte aceptas los{' '}
                <Link href="/terminos" className="underline">Términos de uso</Link>
                {' '}y la{' '}
                <Link href="/privacidad" className="underline">Política de privacidad</Link>
              </p>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
