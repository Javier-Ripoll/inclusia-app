'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Mail } from 'lucide-react'

export function BlastIncompleteProfilesButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ emailed: number; skipped: number } | null>(null)

  const handleClick = async () => {
    if (!confirm('¿Enviar email a todos los usuarios con perfil incompleto?')) return
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/admin/blast-incomplete-profiles', { method: 'POST' })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handleClick} disabled={loading} variant="outline" className="gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        Enviar recordatorio a perfiles incompletos
      </Button>
      {result && (
        <p className="text-sm text-muted-foreground">
          ✅ {result.emailed} emails enviados · {result.skipped} perfiles ya completos
        </p>
      )}
    </div>
  )
}
