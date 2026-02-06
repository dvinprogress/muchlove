'use client'

import { CreditCard, ExternalLink, Calendar, AlertCircle } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent } from '@/components/ui'
import { useTranslations } from 'next-intl'
import type { PlanId } from '@/lib/stripe/plans'

interface BillingInfo {
  plan: string
  status: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string | null
}

interface BillingSectionProps {
  billing: BillingInfo
}

/**
 * Billing management section for the Settings page.
 * Shows current plan, subscription status, and management actions.
 */
export function BillingSection({ billing }: BillingSectionProps) {
  const t = useTranslations('billing')
  const { redirectToCheckout, redirectToPortal, isLoading, error } =
    useSubscription()

  const isPaidPlan = billing.plan !== 'free'
  const isActive = billing.status === 'active' || billing.status === 'trialing'
  const isCanceling = billing.cancelAtPeriodEnd

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const planDisplayName: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
  }

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    trialing: 'bg-blue-100 text-blue-800',
    past_due: 'bg-orange-100 text-orange-800',
    canceled: 'bg-slate-100 text-slate-600',
    unpaid: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-4">
      {/* Current Plan */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-rose-50 p-3 rounded-xl">
                <CreditCard className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {t('currentPlan')}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-slate-900">
                    {planDisplayName[billing.plan] ?? billing.plan}
                  </span>
                  {billing.status && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[billing.status] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t(`status.${billing.status}` as Parameters<typeof t>[0])}
                    </span>
                  )}
                </div>

                {isPaidPlan && billing.currentPeriodEnd && (
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    {isCanceling
                      ? t('cancelsOn', { date: formatDate(billing.currentPeriodEnd) })
                      : t('renewsOn', { date: formatDate(billing.currentPeriodEnd) })}
                  </div>
                )}

                {isCanceling && (
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    {t('cancelingNotice')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {isPaidPlan && billing.stripeCustomerId && (
          <button
            onClick={() => redirectToPortal()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <ExternalLink className="w-4 h-4" />
            {t('manageSubscription')}
          </button>
        )}

        {!isPaidPlan && (
          <button
            onClick={() => redirectToCheckout('pro' as PlanId, 'monthly')}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-rose-500 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? t('loading') : t('upgradeToPro')}
          </button>
        )}

        {billing.plan === 'pro' && isActive && (
          <button
            onClick={() =>
              redirectToCheckout('enterprise' as PlanId, 'monthly')
            }
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {t('upgradeToEnterprise')}
          </button>
        )}
      </div>
    </div>
  )
}
