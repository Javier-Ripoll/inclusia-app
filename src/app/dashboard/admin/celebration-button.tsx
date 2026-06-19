'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function CelebrationBlastButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ emailed: number } | null>(null)

  const handleClick = async () => {
    if (!confirm('¿Enviar el email de celebración "Ya somos 300" a TODOS los usuarios?')) return
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/admin/blast-celebration', { method: 'POST' })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handleClick} disabled={loading} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '🎉'}
        Enviar email celebración 300 usuarios
      </Button>
      {result && (
        <p className="text-sm text-muted-foreground">
          ✅ {result.emailed} emails enviados
        </p>
      )}
    </div>
  )
}
