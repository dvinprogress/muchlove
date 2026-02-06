import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import { verifyWebhookSignature } from '@/lib/stripe/client'
import { getPlanFromPriceId } from '@/lib/stripe/plans'
import type { Database } from '@/types/database'

/**
 * Create a Supabase admin client for webhook processing
 * Webhooks run outside of user context, so we need service_role key
 */
function getAdminClient() {
  return createSupabaseAdmin<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: {
        schema: 'public'
      }
    }
  )
}

/**
 * Check if webhook event has already been processed (idempotency)
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('stripe_webhook_events')
    .select('id')
    .eq('id', eventId)
    .single()

  return data !== null
}

/**
 * Mark webhook event as processed
 */
async function markEventProcessed(
  eventId: string,
  eventType: string
): Promise<void> {
  const supabase = getAdminClient()
  // @ts-ignore - Supabase admin client type inference issue with service role
  await supabase.from('stripe_webhook_events').insert({
    id: eventId,
    type: eventType,
  })
}

// Disable body parsing for webhook verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // 1. Read raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // 2. Verify webhook signature
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(body, signature)
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // 3. Idempotency check
    const alreadyProcessed = await isEventProcessed(event.id)
    if (alreadyProcessed) {
      console.log(`[Stripe Webhook] Event ${event.id} already processed, skipping`)
      return NextResponse.json({ received: true, deduplicated: true })
    }

    // 4. Process event
    console.log(`[Stripe Webhook] Processing event: ${event.type} (${event.id})`)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        )
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        )
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        )
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    // 5. Mark as processed
    await markEventProcessed(event.id, event.type)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    )
  }
}

// =====================================================
// HELPERS
// =====================================================

function extractCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): string | null {
  if (!customer) return null
  if (typeof customer === 'string') return customer
  return customer.id
}

// =====================================================
// EVENT HANDLERS
// =====================================================

/**
 * Handle checkout.session.completed
 * Creates or updates subscription record and grants credits
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const supabase = getAdminClient()
  const companyId = session.metadata?.company_id
  const planId = session.metadata?.plan_id

  if (!companyId) {
    console.error('[Webhook] checkout.session.completed missing company_id metadata')
    return
  }

  const stripeCustomerId = extractCustomerId(session.customer)

  if (!stripeCustomerId) {
    console.error('[Webhook] checkout.session.completed missing customer')
    return
  }

  // Update company with Stripe customer ID and plan
  const plan = (planId === 'pro' || planId === 'enterprise') ? planId : 'pro'
  await supabase
    .from('companies')
    // @ts-ignore - Supabase admin client type inference issue with service role
    .update({
      stripe_customer_id: stripeCustomerId,
      plan,
    })
    .eq('id', companyId)

  console.log(`[Webhook] Checkout completed for company ${companyId}, plan: ${planId}`)
}

/**
 * Handle subscription created/updated
 * Sync subscription state to database
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getAdminClient()

  const stripeCustomerId = extractCustomerId(subscription.customer)
  if (!stripeCustomerId) {
    console.error('[Webhook] subscription.updated: missing customer')
    return
  }

  // Find company by Stripe customer ID
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single<{ id: string }>()

  if (!company) {
    console.error(
      `[Webhook] subscription.updated: company not found for customer ${stripeCustomerId}`
    )
    return
  }

  // Determine plan from price ID
  const firstItem = subscription.items.data[0]
  const priceId = typeof firstItem?.price === 'string' ? firstItem.price : firstItem?.price?.id
  const planConfig = priceId ? getPlanFromPriceId(priceId) : null
  const planId = planConfig?.id ?? 'pro'

  // Get period dates from the first subscription item
  const periodStart = firstItem?.current_period_start
    ? new Date(firstItem.current_period_start * 1000).toISOString()
    : null
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000).toISOString()
    : null

  // Check if subscription record exists
  const { data: existingSub } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  const subscriptionRecord = {
    company_id: company.id,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId ?? null,
    status: subscription.status as Database['public']['Enums']['subscription_status'],
    plan: planId,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  }

  if (existingSub) {
    await supabase
      .from('user_subscriptions')
      // @ts-ignore - Supabase admin client type inference issue with service role
      .update(subscriptionRecord)
      .eq('stripe_subscription_id', subscription.id)
  } else {
    // @ts-ignore - Supabase admin client type inference issue with service role
    await supabase.from('user_subscriptions').insert(subscriptionRecord)
  }

  // Update company plan and limits
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    await supabase
      .from('companies')
      // @ts-ignore - Supabase admin client type inference issue with service role
      .update({
        plan: planId,
        videos_limit: planConfig?.videosLimit ?? 100,
      })
      .eq('id', company.id)
  }

  console.log(
    `[Webhook] Subscription ${subscription.id} updated: status=${subscription.status}, plan=${planId}`
  )
}

/**
 * Handle subscription deleted (cancellation completed)
 * Downgrade to free plan
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getAdminClient()

  const stripeCustomerId = extractCustomerId(subscription.customer)
  if (!stripeCustomerId) return

  // Find company
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single<{ id: string }>()

  if (!company) {
    console.error(
      `[Webhook] subscription.deleted: company not found for customer ${stripeCustomerId}`
    )
    return
  }

  // Update subscription record
  await supabase
    .from('user_subscriptions')
    // @ts-ignore - Supabase admin client type inference issue with service role
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  // Downgrade company to free plan
  await supabase
    .from('companies')
    // @ts-ignore - Supabase admin client type inference issue with service role
    .update({
      plan: 'free',
      videos_limit: 5,
    })
    .eq('id', company.id)

  console.log(
    `[Webhook] Subscription ${subscription.id} deleted, company ${company.id} downgraded to free`
  )
}

/**
 * Handle invoice paid
 * Grant/renew credits for the billing period
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const supabase = getAdminClient()

  // Skip if no subscription (one-time payments handled differently)
  const subscriptionId = invoice.parent?.subscription_details?.subscription
  if (!subscriptionId) return

  const stripeCustomerId = extractCustomerId(invoice.customer)
  if (!stripeCustomerId) return

  // Check idempotency on invoice ID
  const { data: existingTransaction } = await supabase
    .from('credit_transactions')
    .select('id')
    .eq('stripe_invoice_id', invoice.id)
    .single()

  if (existingTransaction) {
    console.log(`[Webhook] Invoice ${invoice.id} already processed, skipping credit grant`)
    return
  }

  // Find company
  const { data: company } = await supabase
    .from('companies')
    .select('id, plan')
    .eq('stripe_customer_id', stripeCustomerId)
    .single<{ id: string; plan: string }>()

  if (!company) {
    console.error(
      `[Webhook] invoice.paid: company not found for customer ${stripeCustomerId}`
    )
    return
  }

  // Determine credits from plan via line item pricing
  const firstLineItem = invoice.lines?.data?.[0]
  const priceObj = firstLineItem?.pricing?.price_details?.price
  const priceId = typeof priceObj === 'string' ? priceObj : priceObj?.id
  const planConfig = priceId ? getPlanFromPriceId(priceId) : null
  const creditAmount = planConfig?.videosLimit ?? 100

  // Grant credits using atomic RPC
  try {
    // @ts-ignore - Supabase admin client type inference issue with service role
    await supabase.rpc('grant_credits', {
      p_company_id: company.id,
      p_amount: creditAmount,
      p_type: 'subscription_renewal',
      p_description: `Subscription renewal - ${planConfig?.name ?? 'Pro'} plan`,
      p_stripe_invoice_id: invoice.id,
    })

    console.log(
      `[Webhook] Granted ${creditAmount} credits to company ${company.id} for invoice ${invoice.id}`
    )
  } catch (error) {
    console.error(`[Webhook] Failed to grant credits:`, error)
  }
}

/**
 * Handle invoice payment failed
 * Log the failure, subscription status update handled by subscription.updated event
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const stripeCustomerId = extractCustomerId(invoice.customer)

  console.error(
    `[Webhook] Payment failed for customer ${stripeCustomerId}, invoice ${invoice.id}`
  )

  // The subscription.updated event will handle status change to past_due/unpaid
  // Here we just log for monitoring
}
