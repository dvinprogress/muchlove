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

const ReviewValidation = dynamic(
  () => import('@/components/sharing/ReviewValidation').then(m => ({ default: m.ReviewValidation })),
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
  const [showReviewValidation, setShowReviewValidation] = useState(false)
  const [showSharingFlow, setShowSharingFlow] = useState(false)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [validatedReview, setValidatedReview] = useState<string | null>(null)

  // Si video_completed, shared_1 ou shared_2 → afficher le SharingFlow (pour continuer le partage)
  // Si shared_3 → afficher le message "Ambassadeur, merci !"
  const isAmbassador = currentStatus === 'shared_3'
  const shouldShowSharingFlow =
    currentStatus === 'video_completed' ||
    currentStatus === 'shared_1' ||
    currentStatus === 'shared_2'

  const handleVideoComplete = (_blob: Blob, _duration: number, transcriptionText: string | null) => {
    setCurrentStatus('video_completed')
    setTranscription(transcriptionText)
    setShowCelebration(true)
  }

  const handleCloseCelebration = () => {
    setShowCelebration(false)
    if (currentStatus === 'video_completed') {
      setShowReviewValidation(true)
    }
  }

  const handleReviewValidate = (reviewText: string) => {
    setValidatedReview(reviewText)
    setShowReviewValidation(false)
    setShowSharingFlow(true)
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col items-center justify-center p-4 md:p-8">
      <div className={`w-full space-y-4 md:space-y-6 ${
        currentStatus !== 'video_completed' &&
        currentStatus !== 'shared_1' &&
        currentStatus !== 'shared_2' &&
        currentStatus !== 'shared_3' &&
        !showReviewValidation &&
        !showSharingFlow &&
        !isAmbassador
          ? 'max-w-5xl'
          : 'max-w-lg'
      }`}>
        {/* Header : logo ou nom + salutation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2 mb-2"
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
            <h1 className="text-2xl font-bold text-slate-900">{companyName}</h1>
          )}
          <h2 className="text-xl font-semibold text-slate-900">
            {t('greeting', { firstName: contactFirstName })}
          </h2>
          <p className="text-base text-slate-600 max-w-sm mx-auto">
            {t('description', { companyName })}
          </p>
        </motion.div>

        {/* Contenu principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isAmbassador ? (
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
          ) : shouldShowSharingFlow || showSharingFlow ? (
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
                reviewText={validatedReview}
              />
            </div>
          ) : showReviewValidation ? (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden p-8">
              <ReviewValidation
                transcription={transcription}
                contactFirstName={contactFirstName}
                companyName={companyName}
                onValidate={handleReviewValidate}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <VideoRecorder
                contactId={contactId}
                companyId={companyId}
                companyName={companyName}
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
          className="text-center pt-6 border-t border-slate-100"
        >
          <a
            href="https://muchlove.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors"
          >
            {t('poweredBy', { brandName: 'MuchLove' })}
            <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </a>
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
