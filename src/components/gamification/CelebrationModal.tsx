'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { mediumCelebration, ambassadorCelebration } from '@/lib/utils/confetti'

type CelebrationType = 'video_complete' | 'share_1' | 'share_2' | 'ambassador'

interface CelebrationModalProps {
  type: CelebrationType
  isOpen: boolean
  onClose: () => void
}

export function CelebrationModal({ type, isOpen, onClose }: CelebrationModalProps) {
  const t = useTranslations('gamification.celebration')

  const celebrationTypes = {
    video_complete: 'videoComplete',
    share_1: 'share1',
    share_2: 'share2',
    ambassador: 'ambassador'
  } as const

  const configKey = celebrationTypes[type]

  useEffect(() => {
    if (isOpen) {
      if (type === 'ambassador') {
        ambassadorCelebration()
      } else {
        mediumCelebration()
      }
    }
  }, [isOpen, type])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center pointer-events-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-6xl mb-4"
              >
                {t(`${configKey}.emoji`)}
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {t(`${configKey}.headline`)}
              </h2>

              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                {t(`${configKey}.body`)}
              </p>

              <button
                onClick={onClose}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {t(`${configKey}.cta`)}
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
