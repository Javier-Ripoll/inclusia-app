'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { MessageSquare, Loader2 } from 'lucide-react'

interface Props {
  offerId: string
  companyId: string
  professionalId: string
}

export function StartChatButton({ offerId, companyId, professionalId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const supabase = createClient()

    // Upsert conversation (unique on company+professional+offer)
    const { data, error } = await supabase
      .from('conversations')
      .upsert(
        { company_id: companyId, professional_id: professionalId, offer_id: offerId },
        { onConflict: 'company_id,professional_id,offer_id', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (data?.id) {
      router.push(`/dashboard/chat/${data.id}`)
    }
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 text-xs"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
      Enviar mensaje
    </Button>
  )
}
