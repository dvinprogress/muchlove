'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ProgressBar } from '@/components/gamification/ProgressBar'
import type { ContactStatus } from '@/types/database'

const VideoRecorder = dynamic(
  () => import('@/components/video/VideoRecorder').then(m => ({ default: m.VideoRecorder })),
  { ssr: false, loading: () => <div className="h-80 bg-slate-100 rounded-xl animate-pulse" /> }
)

const CelebrationModal = dynamic(
  () => import('@/components/gamification/CelebrationModal').then(m => ({ default: m.CelebrationModal })),
  { ssr: false }
)

const SharingFlow = dynamic(
  () => import('@/components/sharing/SharingFlow').then(m => ({ default: m.SharingFlow })),
  { ssr: false, loading: () => <div className="h-60 bg-slate-100 rounded-xl animate-pulse" /> }
)

interface TestimonialRecordingPageProps {
  contactId: string
  companyId: string
  contactFirstName: string
  companyName: string
  companyLogoUrl: string | null
  contactStatus: ContactStatus
  companyGooglePlaceId: string | null
  companyTrustpilotUrl: string | null
  testimonialId: string
  testimonialDuration?: number
}

export function TestimonialRecordingPage({
  contactId,
  companyId,
  contactFirstName,
  companyName,
  companyLogoUrl,
  contactStatus,
  companyGooglePlaceId,
  companyTrustpilotUrl,
  testimonialId,
  testimonialDuration
}: TestimonialRecordingPageProps) {
  const t = useTranslations('recording.page')
  const [currentStatus, setCurrentStatus] = useState<ContactStatus>(contactStatus)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showSharingFlow, setShowSharingFlow] = useState(false)

  const isAlreadyCompleted =
    currentStatus === 'video_completed' ||
    currentStatus === 'shared_1' ||
    currentStatus === 'shared_2' ||
    currentStatus === 'shared_3'

  const handleVideoComplete = (_blob: Blob, _duration: number) => {
    setCurrentStatus('video_completed')
    setShowCelebration(true)
  }

  const handleCloseCelebration = () => {
    setShowCelebration(false)
    // Show sharing flow after celebration closes (if video just completed)
    if (currentStatus === 'video_completed') {
      setShowSharingFlow(true)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header : logo ou nom + salutation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          {companyLogoUrl ? (
            <div className="flex justify-center">
              <img
                src={companyLogoUrl}
                alt={companyName}
                className="h-16 w-auto object-contain"
              />
            </div>
          ) : (
            <h1 className="text-3xl font-bold text-slate-900">{companyName}</h1>
          )}
          <h2 className="text-2xl font-semibold text-slate-900">
            {t('greeting', { firstName: contactFirstName })}
          </h2>
          <p className="text-lg text-slate-700">
            {t('description', { companyName })}
          </p>
        </motion.div>

        {/* Contenu principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isAlreadyCompleted && !showSharingFlow ? (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                {t('alreadyCompletedTitle')}
              </h3>
              <p className="text-slate-700">
                {t('alreadyCompletedDescription')}
              </p>
            </div>
          ) : showSharingFlow ? (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden p-8">
              <SharingFlow
                contactId={contactId}
                testimonialId={testimonialId}
                contactFirstName={contactFirstName}
                companyName={companyName}
                companyGooglePlaceId={companyGooglePlaceId}
                companyTrustpilotUrl={companyTrustpilotUrl}
                testimonialDuration={testimonialDuration}
                initialStatus={currentStatus}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <VideoRecorder
                contactId={contactId}
                companyId={companyId}
                onComplete={handleVideoComplete}
              />
            </div>
          )}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ProgressBar currentStatus={currentStatus} />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center pt-4 border-t border-slate-100"
        >
          <p className="text-xs text-slate-400">
            {t('poweredBy', { brandName: 'MuchLove' })}
          </p>
        </motion.div>

        {/* CelebrationModal */}
        <CelebrationModal
          type="video_complete"
          isOpen={showCelebration}
          onClose={handleCloseCelebration}
        />
      </div>
    </div>
  )
}
