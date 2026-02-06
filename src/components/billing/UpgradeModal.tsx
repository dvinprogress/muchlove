'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Check } from 'lucide-react'
import { useEffect } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { useTranslations } from 'next-intl'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal shown when user hits credit limit.
 * Encourages upgrade with warm MuchLove voice.
 */
export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const t = useTranslations('billing.upgrade')
  const { redirectToCheckout, isLoading, error } = useSubscription()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const features = [
    t('features.videos'),
    t('features.linkedin'),
    t('features.storage'),
    t('features.branding'),
    t('features.integrations'),
    t('features.support'),
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
            >
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-rose-500 to-orange-400 px-6 py-8 text-white text-center">
                <button
                  onClick={onClose}
                  className="absolute right-3 top-3 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
                >
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-yellow-200" />
                </motion.div>

                <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
                <p className="text-white/90 text-sm">{t('subtitle')}</p>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  {t('whatsIncluded')}
                </h3>

                <ul className="space-y-2.5 mb-6">
                  {features.map((feature, index) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.05 }}
                      className="flex items-center gap-2.5 text-sm text-slate-700"
                    >
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                {/* Price */}
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-slate-900">$29</span>
                  <span className="text-slate-500">{t('perMonth')}</span>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-500 text-center mb-3">
                    {error}
                  </p>
                )}

                {/* CTA */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => redirectToCheckout('pro', 'monthly')}
                  disabled={isLoading}
                  className="w-full bg-rose-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('loading') : t('cta')}
                </motion.button>

                <button
                  onClick={onClose}
                  className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700 transition-colors py-2"
                >
                  {t('later')}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
