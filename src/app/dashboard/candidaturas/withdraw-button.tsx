'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'

export function WithdrawButton({ applicationId }: { applicationId: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleWithdraw = async () => {
    if (!confirm) { setConfirm(true); return }
    setLoading(true)
    const supabase = createClient()
    await supabase.from('applications').delete().eq('id', applicationId)
    router.refresh()
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">¿Retirar candidatura?</span>
        <Button
          size="sm"
          variant="destructive"
          className="h-6 text-xs px-2 gap-1"
          disabled={loading}
          onClick={handleWithdraw}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Sí, retirar
        </Button>
        <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => setConfirm(false)}>
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <button
      onClick={handleWithdraw}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
    >
      <Trash2 className="h-3 w-3" /> Retirar candidatura
    </button>
  )
}
