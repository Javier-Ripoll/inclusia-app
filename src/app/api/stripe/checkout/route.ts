import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { strictLimiter, getIp } from '@/lib/rate-limit'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })

export async function POST(req: NextRequest) {
  const { success } = await strictLimiter.limit(getIp(req))
  if (!success) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Inténtalo más tarde.' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { priceId, plan, role } = await req.json()

  if (!priceId || !plan || !role) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?cancelled=1`,
    metadata: {
      user_id: user.id,
      role,
      plan,
    },
  })

  return NextResponse.json({ url: session.url })
}
