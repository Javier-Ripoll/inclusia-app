import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Clock } from 'lucide-react'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  const isProfessional = profile?.role === 'professional'

  // Load conversations with last message + other party info
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id, last_message_at, offer_id,
      job_offers ( title ),
      company_profiles ( id, company_name ),
      professional_profiles ( id, profiles ( full_name ) )
    `)
    .order('last_message_at', { ascending: false })

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mensajes</h1>
        <p className="text-muted-foreground">
          {isProfessional ? 'Conversaciones con centros educativos' : 'Conversaciones con profesionales'}
        </p>
      </div>

      {!conversations?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-medium text-lg mb-1">Sin mensajes aún</p>
          <p className="text-sm">
            {isProfessional
              ? 'Los centros podrán escribirte cuando revisen tu candidatura.'
              : 'Inicia una conversación desde la vista de candidatos de una oferta.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv: any) => {
            const company = conv.company_profiles
            const prof = conv.professional_profiles
            const profName = prof?.profiles?.full_name ?? 'Profesional'
            const otherName = isProfessional ? company?.company_name : profName
            const offerTitle = conv.job_offers?.title

            return (
              <Link key={conv.id} href={`/dashboard/chat/${conv.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                      {otherName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{otherName}</p>
                      {offerTitle && (
                        <p className="text-xs text-muted-foreground truncate">Re: {offerTitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      {timeAgo(conv.last_message_at)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
