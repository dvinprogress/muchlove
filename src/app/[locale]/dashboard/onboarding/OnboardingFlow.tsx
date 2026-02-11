'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ProgressIndicator } from './components/ProgressIndicator'
import { Step1BusinessInfo } from './components/Step1BusinessInfo'
import { Step2SharingLinks } from './components/Step2SharingLinks'
import { Step3FirstContact } from './components/Step3FirstContact'
import { toast } from 'sonner'

type OnboardingStep = 'business_info' | 'sharing_links' | 'first_contact' | 'celebration'

interface OnboardingFlowProps {
  company: {
    id: string
    name: string
    logo_url: string | null
    trustpilot_url: string | null
    google_place_id: string | null
    industry: string | null
  }
}

export function OnboardingFlow({ company }: OnboardingFlowProps) {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>('business_info')

  const getCurrentStepNumber = (): 1 | 2 | 3 => {
    switch (step) {
      case 'business_info':
        return 1
      case 'sharing_links':
        return 2
      case 'first_contact':
      case 'celebration':
        return 3
      default:
        return 1
    }
  }

  const handleBusinessInfoNext = () => {
    setStep('sharing_links')
  }

  const handleSharingLinksNext = () => {
    setStep('first_contact')
  }

  const handleSharingLinksBack = () => {
    setStep('business_info')
  }

  const handleFirstContactNext = () => {
    setStep('celebration')
  }

  const handleFirstContactBack = () => {
    setStep('sharing_links')
  }

  const handleSkip = () => {
    switch (step) {
      case 'business_info':
        setStep('sharing_links')
        break
      case 'sharing_links':
        setStep('first_contact')
        break
      case 'first_contact':
        setStep('celebration')
        break
    }
  }

  const handleGoToDashboard = async () => {
    try {
      const { completeOnboarding } = await import('./actions')
      const result = await completeOnboarding()

      if (result.success) {
        // Confetti celebration (lazy loaded)
        const { ambassadorCelebration } = await import('@/lib/utils/confetti')
        void ambassadorCelebration()

        // Navigate to dashboard after celebration
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        toast.error(result.error || 'Failed to complete onboarding')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      console.error('Complete onboarding error:', error)
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-rose-50/50 via-white to-white">
      {/* Header with Progress Indicator */}
      {step !== 'celebration' && (
        <div className="bg-white border-b border-slate-200 py-6">
          <div className="max-w-2xl mx-auto px-4">
            <ProgressIndicator
              currentStep={getCurrentStepNumber()}
              labels={[
                t('progress.step1'),
                t('progress.step2'),
                t('progress.step3'),
              ]}
            />
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 'business_info' && (
            <motion.div
              key="business_info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Step1BusinessInfo
                companyName={company.name}
                companyLogoUrl={company.logo_url}
                companyIndustry={company.industry}
                onNext={handleBusinessInfoNext}
                onSkip={handleSkip}
              />
            </motion.div>
          )}

          {step === 'sharing_links' && (
            <motion.div
              key="sharing_links"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Step2SharingLinks
                trustpilotUrl={company.trustpilot_url}
                googlePlaceId={company.google_place_id}
                onNext={handleSharingLinksNext}
                onSkip={handleSkip}
                onBack={handleSharingLinksBack}
              />
            </motion.div>
          )}

          {step === 'first_contact' && (
            <motion.div
              key="first_contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Step3FirstContact
                onNext={handleFirstContactNext}
                onSkip={handleSkip}
                onBack={handleFirstContactBack}
              />
            </motion.div>
          )}

          {step === 'celebration' && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-6xl"
              >
                🎉
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-slate-900"
              >
                {t('celebration.title')}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-slate-600 max-w-md"
              >
                {t('celebration.subtitle')}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={handleGoToDashboard}
                className="inline-flex items-center justify-center gap-2 bg-rose-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-rose-600 transition-all hover:scale-105 mt-4"
              >
                {t('celebration.cta')} →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
