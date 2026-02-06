'use client'

import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'
import { getContactStatusConfig } from '@/lib/utils/contact-status'
import { formatRelativeTime } from '@/lib/utils/format'
import type { Contact } from '@/types/database'

interface RecentActivityProps {
  activities: Array<{
    id: string
    first_name: string
    company_name: string
    status: Contact['status']
    updated_at: string
  }>
}

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activite recente</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            Aucune activite recente
          </p>
        ) : (
          <motion.ul
            className="space-y-3"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {activities.map((activity) => {
              const statusConfig = getContactStatusConfig(activity.status)

              return (
                <motion.li
                  key={activity.id}
                  variants={itemVariants}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-semibold text-sm">
                    {activity.first_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.first_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {activity.company_name}
                        </p>
                      </div>
                      <Badge variant={statusConfig.variant} className="flex-shrink-0">
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatRelativeTime(activity.updated_at)}
                    </p>
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </CardContent>
    </Card>
  )
}
