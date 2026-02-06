'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Company = Database['public']['Tables']['companies']['Row']
type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row']
type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row']

export type BillingData = {
  company: Company | null
  subscription: UserSubscription | null
  recentTransactions: CreditTransaction[]
  creditsRemaining: number
  creditsTotal: number
  usagePercentage: number
}

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

/**
 * Get complete billing data for the settings page
 */
export async function getBillingData(): Promise<ActionResult<BillingData>> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Parallel queries
  const [companyResult, subscriptionResult, transactionsResult] =
    await Promise.all([
      supabase.from('companies').select('*').eq('id', user.id).single(),
      supabase
        .from('user_subscriptions')
        .select('*')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('credit_transactions')
        .select('*')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

  const company = companyResult.data
  const subscription = subscriptionResult.data
  const recentTransactions = transactionsResult.data ?? []

  const videosUsed = company?.videos_used ?? 0
  const videosLimit = company?.videos_limit ?? 5
  const creditsRemaining = Math.max(0, videosLimit - videosUsed)
  const usagePercentage = videosLimit > 0 ? (videosUsed / videosLimit) * 100 : 0

  return {
    success: true,
    data: {
      company: company ?? null,
      subscription: subscription ?? null,
      recentTransactions,
      creditsRemaining,
      creditsTotal: videosLimit,
      usagePercentage,
    },
  }
}

/**
 * Check if user has enough credits for an action
 */
export async function checkCredits(
  requiredCredits: number = 1
): Promise<ActionResult<{ hasEnough: boolean; remaining: number; limit: number }>> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: company } = await supabase
    .from('companies')
    .select('videos_used, videos_limit')
    .eq('id', user.id)
    .single()

  if (!company) {
    return { success: false, error: 'Company not found' }
  }

  const remaining = Math.max(0, company.videos_limit - company.videos_used)

  return {
    success: true,
    data: {
      hasEnough: remaining >= requiredCredits,
      remaining,
      limit: company.videos_limit,
    },
  }
}

/**
 * Deduct credits for a video usage (calls atomic RPC)
 */
export async function useCredit(
  description: string = 'Video recording'
): Promise<ActionResult<{ newBalance: number }>> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const { data, error } = await supabase.rpc('deduct_credits', {
      p_company_id: user.id,
      p_amount: 1,
      p_description: description,
    })

    if (error) {
      if (error.message.includes('Insufficient credits')) {
        return { success: false, error: 'insufficient_credits' }
      }
      return { success: false, error: error.message }
    }

    return { success: true, data: { newBalance: data ?? 0 } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
