'use client'

import { useState, useCallback } from 'react'
import type { PlanId } from '@/lib/stripe/plans'

type BillingPeriod = 'monthly' | 'yearly'

interface UseSubscriptionReturn {
  isLoading: boolean
  error: string | null
  redirectToCheckout: (planId: PlanId, billingPeriod?: BillingPeriod) => Promise<void>
  redirectToPortal: () => Promise<void>
}

/**
 * Hook for managing Stripe subscription actions from client components
 */
export function useSubscription(): UseSubscriptionReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirectToCheckout = useCallback(
    async (planId: PlanId, billingPeriod: BillingPeriod = 'monthly') => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId, billingPeriod }),
        })

        const data = await response.json() as { url?: string; error?: string }

        if (!response.ok) {
          throw new Error(data.error ?? 'Failed to create checkout session')
        }

        if (data.url) {
          window.location.href = data.url
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong'
        setError(message)
        console.error('[useSubscription] Checkout error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const redirectToPortal = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json() as { url?: string; error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to open billing portal')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      console.error('[useSubscription] Portal error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    redirectToCheckout,
    redirectToPortal,
  }
}
