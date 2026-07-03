'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, XCircle, CheckCircle } from 'lucide-react'

export function OfferStatusButton({ offerId, currentStatus }: { offerId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isClosed = currentStatus !== 'active'

  const toggle = async () => {
    if (!confirm(isClosed ? '¿Reabrir esta oferta?' : '¿Cerrar esta oferta? Los profesionales ya no podrán aplicar.')) return
    setLoading(true)
    const res = await fetch('/api/ofertas/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId, status: isClosed ? 'active' : 'closed' }),
    })
    setLoading(false)
    if (res.ok) router.refresh()
  }

  return (
    <Button
      variant={isClosed ? 'outline' : 'destructive'}
      size="sm"
      className="gap-1.5 text-xs"
      onClick={toggle}
      disabled={loading}
    >
      {loading
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : isClosed
          ? <><CheckCircle className="h-3.5 w-3.5" /> Reabrir oferta</>
          : <><XCircle className="h-3.5 w-3.5" /> Cerrar oferta</>
      }
    </Button>
  )
}
