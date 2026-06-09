'use client'

import { useNotifications } from '@/components/notifications/notifications-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, Zap, Briefcase, User, MessageSquare, CheckCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ICONS: Record<string, any> = {
  new_offer: Briefcase,
  urgent_offer: Zap,
  application_update: User,
  new_application: User,
  message: MessageSquare,
}

const TYPE_LABELS: Record<string, string> = {
  new_offer: 'Nueva oferta',
  urgent_offer: 'Oferta urgente',
  new_application: 'Nueva candidatura',
  application_update: 'Candidatura actualizada',
  message: 'Mensaje',
}

const TYPE_COLORS: Record<string, string> = {
  urgent_offer: 'bg-red-50 text-red-600',
  new_offer: 'bg-blue-50 text-blue-600',
  new_application: 'bg-green-50 text-green-600',
  application_update: 'bg-purple-50 text-purple-600',
  message: 'bg-orange-50 text-orange-600',
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora mismo'
  if (mins < 60) return `hace ${mins} minuto${mins !== 1 ? 's' : ''}`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} hora${hours !== 1 ? 's' : ''}`
  const days = Math.floor(hours / 24)
  return `hace ${days} día${days !== 1 ? 's' : ''}`
}

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" /> Notificaciones
          </h1>
          {unreadCount > 0 && (
            <p className="text-muted-foreground">{unreadCount} sin leer</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
            <CheckCheck className="h-4 w-4" /> Marcar todas como leídas
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map(notif => {
            const Icon = ICONS[notif.type] ?? Bell
            const colorClass = TYPE_COLORS[notif.type] ?? 'bg-gray-50 text-gray-600'
            return (
              <button
                key={notif.id}
                onClick={() => {
                  markAsRead(notif.id)
                  if (notif.data?.href) router.push(notif.data.href)
                }}
                className={`w-full text-left rounded-xl border p-4 flex items-start gap-4 transition-all hover:shadow-sm ${
                  !notif.read ? 'bg-blue-50/40 border-blue-100' : 'bg-white border-border'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-sm font-semibold ${!notif.read ? '' : 'font-medium'}`}>
                      {notif.title}
                    </span>
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                      {TYPE_LABELS[notif.type] ?? notif.type}
                    </Badge>
                  </div>
                  {notif.body && <p className="text-sm text-muted-foreground">{notif.body}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo(notif.created_at)}</p>
                </div>
                {!notif.read && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-medium text-lg">Sin notificaciones</p>
          <p className="text-sm">Cuando haya actividad te avisaremos aquí</p>
        </div>
      )}
    </div>
  )
}
