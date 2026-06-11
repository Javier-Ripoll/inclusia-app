import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { NotificationsProvider } from '@/components/notifications/notifications-provider'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { UnreadMessagesBadge } from '@/components/chat/unread-messages-badge'
import {
  LayoutDashboard, User, Briefcase, Users, Bell, CreditCard,
  MessageSquare, LogOut
} from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
    redirect('/auth/login?demo=1')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileData as { full_name: string | null; role: string; onboarding_completed: boolean } | null
  const isProfessional = profile?.role === 'professional'

  // Redirect to onboarding if not completed yet
  if (profile && !profile.onboarding_completed) redirect('/onboarding')

  // Load initial notifications (last 30)
  const { data: initialNotifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  // Count unread messages (sent by others, not yet read)
  const { count: unreadMessages } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null)
    .neq('sender_id', user.id)

  const navItems = isProfessional
    ? [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Panel' },
        { href: '/dashboard/perfil', icon: User, label: 'Mi Perfil' },
        { href: '/dashboard/candidaturas', icon: Briefcase, label: 'Candidaturas' },
        { href: '/dashboard/chat', icon: MessageSquare, label: 'Mensajes' },
        { href: '/dashboard/suscripcion', icon: CreditCard, label: 'Suscripción' },
      ]
    : [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Panel' },
        { href: '/dashboard/empresa', icon: User, label: 'Mi Centro' },
        { href: '/dashboard/ofertas', icon: Briefcase, label: 'Mis Ofertas' },
        { href: '/dashboard/candidatos', icon: Users, label: 'Candidatos' },
        { href: '/dashboard/chat', icon: MessageSquare, label: 'Mensajes' },
        { href: '/dashboard/suscripcion', icon: CreditCard, label: 'Plan' },
      ]

  return (
    <NotificationsProvider userId={user.id} initialNotifications={initialNotifications ?? []}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border">
          <div className="p-6 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="font-bold text-xl text-primary">Inclusia</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {item.href === '/dashboard/chat' && (
                  <UnreadMessagesBadge
                    initialCount={unreadMessages ?? 0}
                    userId={user.id}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{profile?.full_name?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.full_name}</p>
                <Badge variant="secondary" className="text-xs">
                  {isProfessional ? 'Profesional' : 'Centro'}
                </Badge>
              </div>
              <NotificationBell />
            </div>
            <Link href="/auth/logout">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs">I</span>
              </div>
              <span className="font-bold text-lg text-primary">Inclusia</span>
            </Link>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{profile?.full_name?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-20">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-2 text-muted-foreground hover:text-primary transition-colors min-w-0"
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.href === '/dashboard/chat' && (
                  <UnreadMessagesBadge
                    initialCount={unreadMessages ?? 0}
                    userId={user.id}
                  />
                )}
              </div>
              <span className="text-[10px] font-medium truncate max-w-[56px] text-center leading-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </NotificationsProvider>
  )
}
