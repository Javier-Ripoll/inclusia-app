'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initialCount: number
  userId: string
}

export function UnreadMessagesBadge({ initialCount, userId }: Props) {
  const [count, setCount] = useState(initialCount)
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  // Fetch real unread count from DB
  const refetchCount = async () => {
    const supabase = createClient()
    const { count: c } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .is('read_at', null)
      .neq('sender_id', userId)
    setCount(c ?? 0)
  }

  // When entering a chat: set to 0 immediately (messages get marked as read by chat-window)
  // When leaving a chat: refetch real count from DB
  useEffect(() => {
    const wasInChat = prevPathname.current.startsWith('/dashboard/chat/')
    const isInChat = pathname.startsWith('/dashboard/chat/')

    if (isInChat) {
      setCount(0)
    } else if (wasInChat) {
      // Left a chat — refetch actual count
      refetchCount()
    }

    prevPathname.current = pathname
  }, [pathname])

  // Realtime: only handle new incoming messages (INSERT)
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`unread-messages:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        // Only increment if we're not currently in that conversation
        if (
          payload.new.sender_id !== userId &&
          !window.location.pathname.startsWith('/dashboard/chat/')
        ) {
          setCount(prev => prev + 1)
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
