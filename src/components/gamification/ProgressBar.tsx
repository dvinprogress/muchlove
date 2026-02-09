'use client'

import { motion } from 'framer-motion'
import { Video, Share2, Trophy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ContactStatus } from '@/types/database'

interface ProgressBarProps {
  currentStatus: ContactStatus
}

type StepState = 'pending' | 'active' | 'completed'

interface Step {
  key: string
  icon: typeof Video
  state: StepState
}

// Mapping statuses to step numbers (1, 2, 3)
const STATUS_TO_STEP: Record<ContactStatus, number> = {
  created: 1,
  invited: 1,
  link_opened: 1,
  video_started: 1,
  video_completed: 2,
  shared_1: 2,
  shared_2: 2,
  shared_3: 3
}

// Mapping statuses to progress percentage within the step
const STATUS_TO_PROGRESS: Record<ContactStatus, number> = {
  created: 33,
  invited: 33,
  link_opened: 33,
  video_started: 50,
  video_completed: 66,
  shared_1: 75,
  shared_2: 83,
  shared_3: 100
}

export function ProgressBar({ currentStatus }: ProgressBarProps) {
  const t = useTranslations('gamification.progress')
  const currentStep = STATUS_TO_STEP[currentStatus]
  const currentProgress = STATUS_TO_PROGRESS[currentStatus]

  const steps: Step[] = [
    { key: 'step1', icon: Video, state: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending' },
    { key: 'step2', icon: Share2, state: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending' },
    { key: 'step3', icon: Trophy, state: currentStep === 3 ? 'completed' : 'pending' }
  ]

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${currentProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
        />
      </div>

      {/* Steps */}
      <div className="flex justify-between items-start">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = step.state === 'completed'
          const isActive = step.state === 'active'

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500'
                    : isActive
                    ? 'bg-rose-500 ring-4 ring-rose-200 ring-offset-2'
                    : 'bg-gray-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isCompleted || isActive ? 'text-white' : 'text-gray-400'
                  }`}
                />
              </motion.div>
              <span
                className={`mt-2 text-xs font-medium text-center ${
                  isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {t(step.key)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
