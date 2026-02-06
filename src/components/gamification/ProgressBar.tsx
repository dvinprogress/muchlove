'use client'

import { motion } from 'framer-motion'
import type { ContactStatus } from '@/types/database'

interface ProgressBarProps {
  currentStatus: ContactStatus
}

const STEPS = [
  { label: 'Début', percentage: 0 },
  { label: 'Vidéo', percentage: 25 },
  { label: 'Trustpilot', percentage: 50 },
  { label: 'Google', percentage: 75 },
  { label: 'Ambassadeur', percentage: 100 }
]

const STATUS_TO_PERCENTAGE: Record<ContactStatus, number> = {
  created: 0,
  invited: 0,
  link_opened: 0,
  video_started: 12,
  video_completed: 25,
  shared_1: 50,
  shared_2: 75,
  shared_3: 100
}

export function ProgressBar({ currentStatus }: ProgressBarProps) {
  const currentPercentage = STATUS_TO_PERCENTAGE[currentStatus]

  return (
    <div className="w-full space-y-3">
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${currentPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
        />
      </div>

      <div className="relative flex justify-between items-center">
        {STEPS.map((step, index) => {
          const isActive = currentPercentage >= step.percentage
          const isCurrent =
            currentPercentage >= step.percentage &&
            (index === STEPS.length - 1 || currentPercentage < (STEPS[index + 1]?.percentage ?? 100))

          return (
            <div
              key={step.label}
              className="flex flex-col items-center"
              style={{ width: `${100 / STEPS.length}%` }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor: isActive ? '#f59e0b' : '#d1d5db'
                }}
                transition={{ duration: 0.3 }}
                className={`w-4 h-4 rounded-full ${
                  isCurrent ? 'ring-4 ring-yellow-200' : ''
                }`}
              />
              <span
                className={`mt-1.5 text-xs font-medium ${
                  isActive ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
