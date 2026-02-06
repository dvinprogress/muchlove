'use client'

import { useState, useCallback } from 'react'
import { checkCredits, useCredit } from '@/app/[locale]/dashboard/settings/actions'

interface UseCreditsReturn {
  isChecking: boolean
  isDeducting: boolean
  error: string | null
  /** Check if the user has enough credits, optionally showing a paywall */
  checkAvailability: (required?: number) => Promise<{
    hasEnough: boolean
    remaining: number
    limit: number
  } | null>
  /** Deduct a credit for an action */
  deductCredit: (description?: string) => Promise<{
    success: boolean
    newBalance?: number
    error?: string
  }>
}

/**
 * Hook for checking and deducting credits from client components
 */
export function useCredits(): UseCreditsReturn {
  const [isChecking, setIsChecking] = useState(false)
  const [isDeducting, setIsDeducting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkAvailability = useCallback(
    async (required: number = 1) => {
      setIsChecking(true)
      setError(null)

      try {
        const result = await checkCredits(required)
        if (!result.success) {
          setError(result.error)
          return null
        }
        return result.data
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to check credits'
        setError(message)
        return null
      } finally {
        setIsChecking(false)
      }
    },
    []
  )

  const deductCredit = useCallback(
    async (description: string = 'Video recording') => {
      setIsDeducting(true)
      setError(null)

      try {
        const result = await useCredit(description)
        if (!result.success) {
          setError(result.error)
          return { success: false, error: result.error }
        }
        return { success: true, newBalance: result.data.newBalance }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to deduct credit'
        setError(message)
        return { success: false, error: message }
      } finally {
        setIsDeducting(false)
      }
    },
    []
  )

  return {
    isChecking,
    isDeducting,
    error,
    checkAvailability,
    deductCredit,
  }
}
