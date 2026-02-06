'use client'

import { motion } from 'framer-motion'
import { Video } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { useTranslations } from 'next-intl'

interface UsageCardProps {
  videosUsed: number
  videosLimit: number
  plan: string
}

/**
 * Visual usage card showing credit consumption with animated progress bar
 */
export function UsageCard({ videosUsed, videosLimit, plan }: UsageCardProps) {
  const t = useTranslations('billing.usage')

  const remaining = Math.max(0, videosLimit - videosUsed)
  const percentage = videosLimit > 0 ? Math.min(100, (videosUsed / videosLimit) * 100) : 0

  const getBarColor = (): string => {
    if (percentage >= 100) return 'from-red-400 to-red-500'
    if (percentage >= 80) return 'from-orange-400 to-orange-500'
    return 'from-rose-400 to-rose-500'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-rose-50 p-3 rounded-xl">
            <Video className="w-6 h-6 text-rose-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">
              {t('title')}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {t('description', { plan: plan.charAt(0).toUpperCase() + plan.slice(1) })}
            </p>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-sm font-medium text-slate-700">
                  {videosUsed} / {videosLimit} {t('videosUsed')}
                </span>
                <span className="text-sm text-slate-500">
                  {remaining} {t('remaining')}
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${getBarColor()} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Warning messages */}
            {percentage >= 100 && (
              <p className="text-sm text-red-600 mt-2 font-medium">
                {t('limitReached')}
              </p>
            )}
            {percentage >= 80 && percentage < 100 && (
              <p className="text-sm text-orange-600 mt-2">
                {t('limitWarning')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
