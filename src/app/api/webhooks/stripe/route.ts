import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.user_id
    const role = session.metadata?.role
    const plan = session.metadata?.plan

    if (!userId || !role || !plan) {
      console.error('Missing metadata in session:', session.id)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    if (role === 'professional') {
      const { error } = await supabase
        .from('professional_profiles')
        .update({
          plan,
          subscription_status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating professional plan:', error)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }
    }

    if (role === 'company') {
      const { error } = await supabase
        .from('company_profiles')
        .update({
          plan,
          subscription_status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating company plan:', error)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    // Find user by stripe_customer_id and downgrade plan
    const { data: prof } = await supabase
      .from('professional_profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (prof) {
      await supabase
        .from('professional_profiles')
        .update({ plan: 'free', subscription_status: 'cancelled', stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId)
    } else {
      await supabase
        .from('company_profiles')
        .update({ plan: 'basic', subscription_status: 'cancelled', stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId)
    }
  }

  return NextResponse.json({ received: true })
}
