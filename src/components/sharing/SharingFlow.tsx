'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Star, MapPin, Linkedin, Check, ExternalLink } from 'lucide-react'
import { LinkedInShareButton } from './LinkedInShareButton'
import { LinkedInConsentCheckbox } from './LinkedInConsentCheckbox'
import { CelebrationModal } from '@/components/gamification/CelebrationModal'
import { updateShareStatus } from '@/app/[locale]/t/[link]/actions'
import type { ContactStatus } from '@/types/database'

interface SharingFlowProps {
  contactId: string
  testimonialId: string
  contactFirstName: string
  companyName: string
  companyGooglePlaceId: string | null
  companyTrustpilotUrl: string | null
  testimonialDuration?: number
  initialStatus: ContactStatus
  reviewText?: string | null
}

type Platform = 'trustpilot' | 'google' | 'linkedin'

interface PlatformState {
  trustpilot: boolean
  google: boolean
  linkedin: boolean
}

export function SharingFlow({
  contactId,
  testimonialId,
  contactFirstName,
  companyName,
  companyGooglePlaceId,
  companyTrustpilotUrl,
  testimonialDuration,
  initialStatus,
  reviewText
}: SharingFlowProps) {
  const t = useTranslations('sharing')
  const locale = useLocale()

  // Initialize shared states based on current status
  const [currentStatus, setCurrentStatus] = useState<ContactStatus>(initialStatus)
  const [platformsShared, setPlatformsShared] = useState<PlatformState>({
    trustpilot: initialStatus !== 'video_completed',
    google: ['shared_2', 'shared_3'].includes(initialStatus),
    linkedin: initialStatus === 'shared_3'
  })
  const [linkedinConsent, setLinkedinConsent] = useState(false)
  const [celebrationType, setCelebrationType] = useState<
    'share_1' | 'share_2' | 'ambassador' | null
  >(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showCopiedToast, setShowCopiedToast] = useState(false)

  const handlePlatformShare = async (platform: Platform) => {
    // Copy review to clipboard for Trustpilot and Google
    if (reviewText && (platform === 'trustpilot' || platform === 'google')) {
      try {
        await navigator.clipboard.writeText(reviewText)
        setShowCopiedToast(true)
        setTimeout(() => setShowCopiedToast(false), 4000)
      } catch {
        // Fallback silencieux
      }
    }

    // Open the external link
    let url: string | null = null

    switch (platform) {
      case 'trustpilot':
        url = companyTrustpilotUrl
        break
      case 'google':
        if (companyGooglePlaceId) {
          url = `https://search.google.com/local/writereview?placeid=${companyGooglePlaceId}`
        }
        break
      case 'linkedin':
        // LinkedIn handled by LinkedInShareButton
        break
    }

    if (url) {
      window.open(url, '_blank')
    }

    // Update status via server action
    const result = await updateShareStatus(contactId, testimonialId, platform, {
      locale,
      firstName: contactFirstName,
      companyName,
      duration: testimonialDuration
    })

    if (result.success) {
      // Update local state
      setPlatformsShared((prev) => ({ ...prev, [platform]: true }))
      setCurrentStatus(result.newStatus)

      // Trigger appropriate celebration
      if (result.newStatus === 'shared_1') {
        setCelebrationType('share_1')
        setShowCelebration(true)
      } else if (result.newStatus === 'shared_2') {
        setCelebrationType('share_2')
        setShowCelebration(true)
      } else if (result.newStatus === 'shared_3') {
        setCelebrationType('ambassador')
        setShowCelebration(true)
      }
    }
  }

  const handleLinkedInShare = () => {
    handlePlatformShare('linkedin')
  }

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Copied toast */}
        {showCopiedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-center text-sm font-medium"
          >
            {t('reviewCopied')}
          </motion.div>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Sharing cards */}
        <div className="space-y-4">
          {/* Trustpilot */}
          <motion.div
            variants={cardVariants}
            className={`
              p-6 rounded-xl border-2 transition-all
              ${
                platformsShared.trustpilot
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div
                className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${platformsShared.trustpilot ? 'bg-green-100' : 'bg-orange-100'}
              `}
              >
                {platformsShared.trustpilot ? (
                  <Check className="w-6 h-6 text-green-600" />
                ) : (
                  <Star className="w-6 h-6 text-orange-600" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {t('trustpilot.title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {companyTrustpilotUrl
                    ? t('trustpilot.action')
                    : t('trustpilot.notConfigured')}
                </p>
              </div>

              <button
                onClick={() => handlePlatformShare('trustpilot')}
                disabled={!companyTrustpilotUrl || platformsShared.trustpilot}
                className={`
                  px-6 py-2 rounded-lg font-semibold transition-colors
                  ${
                    platformsShared.trustpilot
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : companyTrustpilotUrl
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {platformsShared.trustpilot ? (
                  t('trustpilot.done')
                ) : (
                  <>
                    {t('trustpilot.action')} <ExternalLink className="inline w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Google Reviews */}
          <motion.div
            variants={cardVariants}
            className={`
              p-6 rounded-xl border-2 transition-all
              ${
                platformsShared.google
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div
                className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${platformsShared.google ? 'bg-green-100' : 'bg-blue-100'}
              `}
              >
                {platformsShared.google ? (
                  <Check className="w-6 h-6 text-green-600" />
                ) : (
                  <MapPin className="w-6 h-6 text-blue-600" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{t('google.title')}</h3>
                <p className="text-sm text-gray-600">
                  {companyGooglePlaceId
                    ? t('google.action')
                    : t('google.notConfigured')}
                </p>
              </div>

              <button
                onClick={() => handlePlatformShare('google')}
                disabled={!companyGooglePlaceId || platformsShared.google}
                className={`
                  px-6 py-2 rounded-lg font-semibold transition-colors
                  ${
                    platformsShared.google
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : companyGooglePlaceId
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {platformsShared.google ? (
                  t('google.done')
                ) : (
                  <>
                    {t('google.action')} <ExternalLink className="inline w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* LinkedIn */}
          <motion.div
            variants={cardVariants}
            className={`
              p-6 rounded-xl border-2 transition-all
              ${
                platformsShared.linkedin
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${platformsShared.linkedin ? 'bg-green-100' : 'bg-[#0A66C2]/10'}
                `}
                >
                  {platformsShared.linkedin ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <Linkedin className="w-6 h-6 text-[#0A66C2]" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {t('linkedin.title')}
                  </h3>
                  <p className="text-sm text-gray-600">{t('linkedin.action')}</p>
                </div>
              </div>

              {!platformsShared.linkedin && (
                <LinkedInConsentCheckbox
                  checked={linkedinConsent}
                  onChange={setLinkedinConsent}
                />
              )}

              <LinkedInShareButton
                contactId={contactId}
                testimonialId={testimonialId}
                contactFirstName={contactFirstName}
                companyName={companyName}
                testimonialDuration={testimonialDuration}
                currentStatus={currentStatus}
                locale={locale}
                onStatusUpdate={setCurrentStatus}
                onCelebration={handleLinkedInShare}
              />
            </div>
          </motion.div>
        </div>

        {/* Ambassador status */}
        {currentStatus === 'shared_3' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 text-center"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('ambassador.title')}
            </h3>
            <p className="text-gray-700">{t('ambassador.subtitle')}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Celebration Modal */}
      {celebrationType && (
        <CelebrationModal
          type={celebrationType}
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </>
  )
}
