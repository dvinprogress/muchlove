'use client'

import { Card, CardContent } from '@/components/ui'
import { ArrowDown, ArrowUp, History } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { CreditTransaction } from '@/types/database'

interface CreditTransactionsListProps {
  transactions: CreditTransaction[]
}

export function CreditTransactionsList({
  transactions,
}: CreditTransactionsListProps) {
  const t = useTranslations('billing.transactions')

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const typeLabels: Record<string, string> = {
    subscription_grant: t('types.subscriptionGrant'),
    subscription_renewal: t('types.subscriptionRenewal'),
    one_time_purchase: t('types.oneTimePurchase'),
    usage_deduction: t('types.usageDeduction'),
    admin_adjustment: t('types.adminAdjustment'),
    refund: t('types.refund'),
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-slate-100 p-2 rounded-lg">
            <History className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {t('title')}
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg ${
                    tx.amount > 0
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {tx.amount > 0 ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {tx.description ?? typeLabels[tx.type] ?? tx.type}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(tx.created_at)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {tx.amount > 0 ? '+' : ''}
                  {tx.amount} {t('credits')}
                </p>
                <p className="text-xs text-slate-500">
                  {t('balance')}: {tx.balance_after}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
