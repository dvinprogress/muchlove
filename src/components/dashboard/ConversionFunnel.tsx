'use client'

import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { FUNNEL_STEPS, getContactStatusConfig } from '@/lib/utils/contact-status'
import type { ContactStatus } from '@/types/database'

interface ConversionFunnelProps {
  funnelData: Record<ContactStatus, number>
}

export function ConversionFunnel({ funnelData }: ConversionFunnelProps) {
  // Calculer le total et le max pour les barres
  const counts = FUNNEL_STEPS.map((step) =>
    step.statuses.reduce((sum, status) => sum + (funnelData[status] || 0), 0)
  )

  const maxCount = Math.max(...counts, 1) // Eviter division par zero

  const totalCount = counts.reduce((sum, count) => sum + count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel de conversion</CardTitle>
      </CardHeader>
      <CardContent>
        {totalCount === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            Ajoutez des contacts pour voir votre funnel
          </p>
        ) : (
          <div className="space-y-4">
            {FUNNEL_STEPS.map((step, index) => {
              const count = counts[index] ?? 0
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

              // Utiliser la couleur du premier status du step
              const statusConfig = getContactStatusConfig(step.statuses[0])

              return (
                <div key={step.key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      {step.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {count}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${statusConfig.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: 'easeOut',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
