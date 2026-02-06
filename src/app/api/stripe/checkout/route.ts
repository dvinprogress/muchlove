import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { getPlanConfig, type PlanId } from '@/lib/stripe/plans'

const checkoutSchema = z.object({
  planId: z.enum(['pro', 'enterprise']),
  billingPeriod: z.enum(['monthly', 'yearly']).default('monthly'),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Validate input
    const body: unknown = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { planId, billingPeriod } = parsed.data

    // 2. Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Get plan config and price ID
    const plan = getPlanConfig(planId)
    const priceId =
      billingPeriod === 'yearly'
        ? plan.stripePriceIdYearly
        : plan.stripePriceIdMonthly

    if (!priceId) {
      return NextResponse.json(
        { error: 'Plan does not have a configured price ID' },
        { status: 400 }
      )
    }

    // 4. Get or create Stripe customer
    const stripe = getStripe()
    const { data: company } = await supabase
      .from('companies')
      .select('stripe_customer_id, email, name')
      .eq('id', user.id)
      .single()

    let stripeCustomerId = company?.stripe_customer_id

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: company?.email ?? user.email ?? '',
        name: company?.name ?? '',
        metadata: {
          supabase_user_id: user.id,
          company_id: user.id,
        },
      })

      stripeCustomerId = customer.id

      // Save Stripe customer ID to company
      await supabase
        .from('companies')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id)
    }

    // 5. Create Checkout Session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${appUrl}/dashboard/settings?canceled=true`,
      subscription_data: {
        metadata: {
          company_id: user.id,
          plan_id: planId as PlanId,
        },
      },
      metadata: {
        company_id: user.id,
        plan_id: planId as PlanId,
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[Stripe Checkout] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.flatten() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
