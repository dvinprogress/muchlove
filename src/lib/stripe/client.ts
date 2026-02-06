import Stripe from 'stripe'

/**
 * Stripe server-side client (singleton)
 * ONLY use in server-side code (API routes, Server Actions, server components)
 */
function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY environment variable. ' +
      'Add it to .env.local for development or Vercel env vars for production.'
    )
  }

  return new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
    appInfo: {
      name: 'MuchLove',
      version: '0.1.0',
      url: 'https://muchlove.app',
    },
  })
}

// Lazy singleton to avoid instantiation at import time
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = getStripeClient()
  }
  return _stripe
}

/**
 * Verify Stripe webhook signature
 * Returns the verified event or throws if invalid
 */
export function verifyWebhookSignature(
  body: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error(
      'Missing STRIPE_WEBHOOK_SECRET environment variable. ' +
      'Add it to .env.local for development or Vercel env vars for production.'
    )
  }

  return getStripe().webhooks.constructEvent(body, signature, webhookSecret)
}
