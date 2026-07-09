'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  read_at: string | null
}

interface Props {
  conversationId: string
  currentUserId: string
  currentUserName: string
  otherName: string
  offerTitle?: string
  initialMessages: Message[]
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  if (isToday) return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function ChatWindow({
  conversationId, currentUserId, currentUserName,
  otherName, offerTitle, initialMessages
}: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark all messages in this conversation as read on open
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId)
      .is('read_at', null)
      .then(() => {})
  }, [conversationId, currentUserId])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => {
          // Avoid duplicates (our own optimistic messages)
          if (prev.find(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new as Message]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  const handleSend = async () => {
    const content = text.trim()
    if (!content || sending) return

    setSending(true)
    setText('')

    const supabase = createClient()

    // Optimistic message
    const tempId = `temp-${Date.now()}`
    const optimistic: Message = {
      id: tempId,
      content,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      read_at: null,
    }
    setMessages(prev => [...prev, optimistic])

    const { data: inserted, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: currentUserId, content })
      .select('id, content, sender_id, created_at, read_at')
      .single()

    if (error) {
      // Remove optimistic on error
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setText(content)
    } else if (inserted) {
      // Replace optimistic with real
      setMessages(prev => prev.map(m => m.id === tempId ? inserted : m))
      // Update last_message_at
      await supabase.from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId)
      // Email notification to recipient (fire-and-forget)
      fetch('/api/chat/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, senderName: currentUserName, senderUserId: currentUserId }),
      }).catch(() => {})
    }

    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-border flex-shrink-0">
        <Link href="/dashboard/chat">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
          {otherName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{otherName}</p>
          {offerTitle && <p className="text-xs text-muted-foreground truncate">Re: {offerTitle}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Sé el primero en escribir un mensaje
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUserId
          const prevMsg = messages[i - 1]
          const showTime = !prevMsg ||
            new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 5 * 60 * 1000

          return (
            <div key={msg.id}>
              {showTime && (
                <p className="text-center text-xs text-muted-foreground my-3">
                  {formatTime(msg.created_at)}
                </p>
              )}
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white text-foreground rounded-bl-sm shadow-sm border border-border'
                } ${msg.id.startsWith('temp-') ? 'opacity-70' : ''}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-border flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje... (Enter para enviar)"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring max-h-32 overflow-y-auto"
            style={{ minHeight: '42px' }}
          />
          <Button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            size="icon"
            className="rounded-xl h-[42px] w-[42px] flex-shrink-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
