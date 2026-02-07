'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import { DemoVideoRecorder } from '@/components/video/DemoVideoRecorder'
import { DemoEmailCapture } from '@/components/demo/DemoEmailCapture'
import { DemoSharePanel } from '@/components/demo/DemoSharePanel'
import { DemoCounter } from '@/components/demo/DemoCounter'
import { CelebrationModal } from '@/components/gamification/CelebrationModal'
import { ProgressBar } from '@/components/gamification/ProgressBar'
import type { ContactStatus } from '@/types/database'

type DemoStep = 'intro' | 'recording' | 'celebration' | 'email_capture' | 'share'

export function DemoFlow() {
  const t = useTranslations('demo')
  const router = useRouter()

  const [step, setStep] = useState<DemoStep>('intro')
  const [sessionId] = useState(() => nanoid(16))
  const [showCelebration, setShowCelebration] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<ContactStatus>('created')

  const handleStartDemo = () => {
    setStep('recording')
  }

  const handleDemoComplete = () => {
    setCurrentStatus('video_completed')
    setShowCelebration(true)
  }

  const handleCelebrationClose = () => {
    setShowCelebration(false)
    setStep('email_capture')
  }

  const handleEmailCaptured = (email: string) => {
    // Rediriger vers /login avec email pré-rempli
    router.push(`/login?email=${encodeURIComponent(email)}`)
  }

  const handleSkipEmail = () => {
    setStep('share')
  }

  const handleShare = (platform: string) => {
    console.log('Shared on:', platform)
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-white">
      <AnimatePresence mode="wait">
        {/* Étape 1: Intro */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-screen p-4"
          >
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl font-bold tracking-tight text-slate-900"
              >
                {t('intro.title')}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-600"
              >
                {t('intro.subtitle')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-6"
              >
                {/* Logo fictif Acme Corp */}
                <div className="text-4xl font-bold text-slate-700 bg-slate-100 px-8 py-4 rounded-lg">
                  ACME CORP
                </div>

                <button
                  onClick={handleStartDemo}
                  className="inline-flex items-center justify-center rounded-lg bg-rose-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-rose-600 hover:scale-105"
                >
                  {t('intro.cta')}
                </button>

                <DemoCounter className="mt-4" />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Étape 2: Recording */}
        {step === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-slate-700">
                    {t('recording.companyName')}
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {t('recording.greeting')}
                  </h1>
                  <p className="text-lg text-gray-600">
                    {t('recording.description')}
                  </p>
                </div>
                <div className="mt-6">
                  <ProgressBar currentStatus={currentStatus} />
                </div>
              </div>
            </div>

            {/* Recorder */}
            <DemoVideoRecorder
              sessionId={sessionId}
              onDemoComplete={handleDemoComplete}
            />
          </motion.div>
        )}

        {/* Étape 3: Email Capture */}
        {step === 'email_capture' && (
          <motion.div
            key="email_capture"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-screen p-4"
          >
            <DemoEmailCapture
              sessionId={sessionId}
              onEmailCaptured={handleEmailCaptured}
              onSkip={handleSkipEmail}
            />
          </motion.div>
        )}

        {/* Étape 4: Share */}
        {step === 'share' && (
          <motion.div
            key="share"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6"
          >
            <DemoSharePanel onShare={handleShare} />

            <button
              onClick={handleBackToHome}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              {t('share.backToHome')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Modal */}
      <CelebrationModal
        type="video_complete"
        isOpen={showCelebration}
        onClose={handleCelebrationClose}
      />
    </div>
  )
}
