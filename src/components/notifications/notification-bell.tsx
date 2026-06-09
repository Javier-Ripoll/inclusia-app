'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck, Zap, Briefcase, User, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from './notifications-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ICONS: Record<string, any> = {
  new_offer: Briefcase,
  urgent_offer: Zap,
  application_update: Check,
  new_application: User,
  message: MessageSquare,
}

const TYPE_COLORS: Record<string, string> = {
  urgent_offer: 'text-red-500 bg-red-50',
  new_offer: 'text-blue-500 bg-blue-50',
  new_application: 'text-green-500 bg-green-50',
  application_update: 'text-purple-500 bg-purple-50',
  message: 'text-orange-500 bg-orange-50',
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}

export function NotificationBell() {
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const recent = notifications.slice(0, 8)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex items-center justify-center h-9 w-9 rounded-md hover:bg-gray-100 transition-colors focus:outline-none">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm">Notificaciones</span>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-primary hover:underline flex items-center gap-1">
              <CheckCheck className="h-3 w-3" /> Marcar todas como leídas
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto">
          {recent.length > 0 ? (
            recent.map(notif => {
              const Icon = ICONS[notif.type] ?? Bell
              const colorClass = TYPE_COLORS[notif.type] ?? 'text-gray-500 bg-gray-50'
              return (
                <button
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id)
                    if (notif.data?.href) router.push(notif.data.href)
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-gray-50 transition-colors flex items-start gap-3 ${!notif.read ? 'bg-blue-50/40' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold' : 'font-medium'}`}>
                      {notif.title}
                    </p>
                    {notif.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                </button>
              )
            })
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sin notificaciones</p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t">
            <button onClick={() => router.push('/dashboard/notificaciones')} className="text-xs text-primary hover:underline w-full text-center">
              Ver todas las notificaciones
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
