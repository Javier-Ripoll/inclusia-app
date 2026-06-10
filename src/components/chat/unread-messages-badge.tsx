'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initialCount: number
  userId: string
}

export function UnreadMessagesBadge({ initialCount, userId }: Props) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to new messages — increment if sender is not us
    const channel = supabase
      .channel(`unread-messages:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        if (payload.new.sender_id !== userId) {
          setCount(prev => prev + 1)
        }
      })
      // When we read messages, decrement
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        if (payload.new.read_at && !payload.old.read_at && payload.new.sender_id !== userId) {
          setCount(prev => Math.max(0, prev - 1))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  if (count <= 0) return null

  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold px-1">
      {count > 9 ? '9+' : count}
    </span>
  )
}
