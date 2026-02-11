'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface ProgressIndicatorProps {
  currentStep: 1 | 2 | 3
  labels: [string, string, string]
}

export function ProgressIndicator({ currentStep, labels }: ProgressIndicatorProps) {
  const steps = [1, 2, 3] as const

  const getStepState = (step: number): 'complete' | 'current' | 'future' => {
    if (step < currentStep) return 'complete'
    if (step === currentStep) return 'current'
    return 'future'
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between relative">
        {/* Lines between steps */}
        <div className="absolute top-5 left-0 right-0 h-0.5 -z-10">
          <div className="flex justify-between items-center h-full mx-5">
            {[1, 2].map((step) => {
              const isComplete = step < currentStep
              return (
                <motion.div
                  key={`line-${step}`}
                  className="flex-1 h-full mx-2"
                  initial={{ scaleX: 0 }}
                  animate={{
                    backgroundColor: isComplete ? '#f43f5e' : '#e2e8f0',
                    scaleX: 1,
                  }}
                  transition={{ duration: 0.3, delay: step * 0.1 }}
                  style={{ transformOrigin: 'left' }}
                />
              )
            })}
          </div>
        </div>

        {/* Step circles */}
        {steps.map((step) => {
          const state = getStepState(step)

          return (
            <div key={step} className="flex flex-col items-center gap-2 z-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: (step - 1) * 0.1 }}
                className="relative"
              >
                <motion.div
                  animate={{
                    backgroundColor:
                      state === 'complete'
                        ? '#10b981'
                        : state === 'current'
                        ? '#f43f5e'
                        : '#e2e8f0',
                    color: state === 'future' ? '#94a3b8' : '#ffffff',
                  }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    font-semibold text-sm transition-all
                    ${state === 'current' ? 'ring-4 ring-rose-200' : ''}
                  `}
                >
                  {state === 'complete' ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    step
                  )}
                </motion.div>
              </motion.div>

              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: (step - 1) * 0.1 + 0.1 }}
                className={`
                  text-xs font-medium text-center max-w-[80px] sm:max-w-none
                  ${state === 'current' ? 'text-rose-600' : 'text-slate-600'}
                `}
              >
                {labels[step - 1]}
              </motion.span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
