'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Eye, Loader2, Phone } from 'lucide-react'

interface Props {
  applicationId: string
  currentStatus: string
  phone?: string | null
}

export function ApplicationActions({ applicationId, currentStatus, phone }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const updateStatus = async (status: string) => {
    setLoading(status)
    const supabase = createClient()
    await supabase
      .from('applications')
      .update({ status, viewed_at: status === 'reviewed' ? new Date().toISOString() : undefined })
      .eq('id', applicationId)
    setLoading(null)
    router.refresh()
  }

  if (currentStatus === 'accepted') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
          <CheckCircle className="h-4 w-4" /> Candidatura aceptada
        </span>
        {phone && (
          <a href={`tel:${phone}`}>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Phone className="h-3.5 w-3.5" /> {phone}
            </Button>
          </a>
        )}
        <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => updateStatus('pending')}>
          Deshacer
        </Button>
      </div>
    )
  }

  if (currentStatus === 'rejected') {
    return (
      <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => updateStatus('pending')}>
        Restaurar candidatura
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {currentStatus === 'pending' && (
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => updateStatus('reviewed')} disabled={!!loading}>
          {loading === 'reviewed' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
          Marcar revisada
        </Button>
      )}
      <Button size="sm" className="gap-1.5 text-xs bg-green-600 hover:bg-green-700" onClick={() => updateStatus('accepted')} disabled={!!loading}>
        {loading === 'accepted' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
        Aceptar
      </Button>
      <Button size="sm" variant="outline" className="gap-1.5 text-xs text-muted-foreground hover:text-destructive" onClick={() => updateStatus('rejected')} disabled={!!loading}>
        {loading === 'rejected' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
        Descartar
      </Button>
      {phone && (
        <a href={`tel:${phone}`}>
          <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
            <Phone className="h-3.5 w-3.5" /> {phone}
          </Button>
        </a>
      )}
    </div>
  )
}
