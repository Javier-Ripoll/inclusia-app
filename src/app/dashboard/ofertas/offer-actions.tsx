'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { XCircle, Trash2, CheckCircle, Loader2 } from 'lucide-react'

interface Props {
  offerId: string
  currentStatus: string
}

export function OfferActions({ offerId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateOffer = async (action: 'close' | 'reopen' | 'delete') => {
    setLoading(action)
    setError(null)
    try {
      const res = await fetch(`/api/ofertas/${offerId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: action !== 'delete'
          ? JSON.stringify({ status: action === 'close' ? 'cancelled' : 'active' })
          : undefined,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al actualizar la oferta')
        return
      }
      setConfirmDelete(false)
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(null)
    }
  }

  if (confirmDelete) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">¿Eliminar definitivamente?</span>
        <Button
          size="sm"
          variant="destructive"
          className="h-7 text-xs px-2 gap-1"
          disabled={loading === 'delete'}
          onClick={() => updateOffer('delete')}
        >
          {loading === 'delete' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          Sí, eliminar
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setConfirmDelete(false)}>
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {error && <span className="text-xs text-red-500">{error}</span>}

      {currentStatus === 'active' ? (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs px-2 gap-1 text-muted-foreground"
          disabled={!!loading}
          onClick={() => updateOffer('close')}
        >
          {loading === 'close' ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
          Cerrar oferta
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs px-2 gap-1 text-muted-foreground"
          disabled={!!loading}
          onClick={() => updateOffer('reopen')}
        >
          {loading === 'reopen' ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
          Reactivar
        </Button>
      )}

      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs px-2 gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
        disabled={!!loading}
        onClick={() => setConfirmDelete(true)}
      >
        <Trash2 className="h-3 w-3" />
        Eliminar
      </Button>
    </div>
  )
}
