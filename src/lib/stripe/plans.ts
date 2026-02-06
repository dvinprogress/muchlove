/**
 * MuchLove Plan Configuration
 *
 * Plans: free, pro, enterprise
 * Each plan defines video limits, features, and Stripe price IDs
 *
 * IMPORTANT: Replace STRIPE_PRICE_IDs with actual IDs from your Stripe Dashboard
 */

export type PlanId = 'free' | 'pro' | 'enterprise'

export interface PlanConfig {
  id: PlanId
  name: string
  description: string
  price: number // Monthly price in USD cents
  yearlyPrice: number // Yearly price in USD cents (per month)
  videosLimit: number
  features: string[]
  highlighted: boolean
  stripePriceIdMonthly: string | null // null for free plan
  stripePriceIdYearly: string | null
}

/**
 * Plan definitions
 * Stripe Price IDs must be configured in environment variables
 */
export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'To get started',
    price: 0,
    yearlyPrice: 0,
    videosLimit: 5,
    features: ['videos', 'link', 'storage', 'support'],
    highlighted: false,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For growing businesses',
    price: 2900, // $29/month
    yearlyPrice: 2400, // $24/month billed yearly
    videosLimit: 100,
    features: [
      'videos',
      'linkedin',
      'storage',
      'branding',
      'integrations',
      'support',
    ],
    highlighted: true,
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID ?? '',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large teams',
    price: 9900, // $99/month
    yearlyPrice: 7900, // $79/month billed yearly
    videosLimit: 500,
    features: [
      'videos',
      'linkedin',
      'storage',
      'branding',
      'integrations',
      'api',
      'dedicated',
      'support',
    ],
    highlighted: false,
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ?? '',
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID ?? '',
  },
}

/**
 * Get plan config by ID
 */
export function getPlanConfig(planId: string): PlanConfig {
  if (planId in PLANS) {
    return PLANS[planId as PlanId]
  }
  return PLANS.free
}

/**
 * Get plan from Stripe Price ID
 */
export function getPlanFromPriceId(priceId: string): PlanConfig | null {
  for (const plan of Object.values(PLANS)) {
    if (
      plan.stripePriceIdMonthly === priceId ||
      plan.stripePriceIdYearly === priceId
    ) {
      return plan
    }
  }
  return null
}

/**
 * Check if a plan is paid (has a Stripe price)
 */
export function isPaidPlan(planId: string): boolean {
  const plan = getPlanConfig(planId)
  return plan.stripePriceIdMonthly !== null
}

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}

/**
 * Get remaining credits for a company
 */
export function getRemainingCredits(videosUsed: number, videosLimit: number): number {
  return Math.max(0, videosLimit - videosUsed)
}

/**
 * Check if company has enough credits for an action
 */
export function hasEnoughCredits(
  videosUsed: number,
  videosLimit: number,
  requiredCredits: number = 1
): boolean {
  return getRemainingCredits(videosUsed, videosLimit) >= requiredCredits
}
