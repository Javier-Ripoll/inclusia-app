'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, XCircle, Trash2, CheckCircle, Loader2 } from 'lucide-react'

interface Props {
  offerId: string
  currentStatus: string
}

export function OfferActions({ offerId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleClose = async () => {
    setLoading('close')
    const supabase = createClient()
    await supabase.from('job_offers').update({ status: 'closed' }).eq('id', offerId)
    setLoading(null)
    router.refresh()
  }

  const handleReopen = async () => {
    setLoading('reopen')
    const supabase = createClient()
    await supabase.from('job_offers').update({ status: 'active' }).eq('id', offerId)
    setLoading(null)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setLoading('delete')
    const supabase = createClient()
    await supabase.from('job_offers').delete().eq('id', offerId)
    setLoading(null)
    router.refresh()
  }

  if (confirmDelete) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">¿Seguro?</span>
        <Button
          size="sm"
          variant="destructive"
          className="h-7 text-xs px-2 gap-1"
          disabled={loading === 'delete'}
          onClick={handleDelete}
        >
          {loading === 'delete' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          Eliminar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs px-2"
          onClick={() => setConfirmDelete(false)}
        >
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors disabled:opacity-50" disabled={!!loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {currentStatus === 'active' ? (
          <button
            onClick={handleClose}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-gray-100 text-muted-foreground"
          >
            <XCircle className="h-4 w-4" />
            Cerrar oferta
          </button>
        ) : (
          <button
            onClick={handleReopen}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-gray-100 text-muted-foreground"
          >
            <CheckCircle className="h-4 w-4" />
            Reactivar oferta
          </button>
        )}
        <button
          onClick={handleDelete}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-red-50 text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar oferta
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
