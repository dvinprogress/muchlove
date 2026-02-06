import { loadStripe, type Stripe } from '@stripe/stripe-js'

/**
 * Stripe browser-side client (singleton via promise)
 * ONLY use in client components
 */
let stripePromise: Promise<Stripe | null> | null = null

export function getStripeJs(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!publishableKey) {
      console.error(
        'Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.'
      )
      return Promise.resolve(null)
    }

    stripePromise = loadStripe(publishableKey)
  }

  return stripePromise
}
