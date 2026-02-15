'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { TestimonialRecordingPage } from '@/app/[locale]/t/[link]/TestimonialRecordingPage'

interface PublicRecordingPageProps {
  slug: string
  companyId: string
  companyName: string
  companyLogoUrl: string | null
  companyGooglePlaceId: string | null
  companyTrustpilotUrl: string | null
}

interface RegisterResult {
  contactId: string
  uniqueLink: string
  alreadyRecorded: boolean
}

export function PublicRecordingPage({
  slug,
  companyId,
  companyName,
  companyLogoUrl,
  companyGooglePlaceId,
  companyTrustpilotUrl,
}: PublicRecordingPageProps) {
  const t = useTranslations('publicLink')

  const [step, setStep] = useState<'form' | 'recording'>('form')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [companyNameInput, setCompanyNameInput] = useState('')
  const [website, setWebsite] = useState('') // Honeypot
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registerResult, setRegisterResult] = useState<RegisterResult | null>(null)
  const [alreadyRecorded, setAlreadyRecorded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/public/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          email,
          company_name: companyNameInput,
          website, // Honeypot
        }),
      })

      if (response.status === 403) {
        setError(t('form.quotaReached'))
        return
      }

      if (response.status === 429) {
        setError('Too many requests. Please try again later.')
        return
      }

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'An error occurred')
        return
      }

      const data: RegisterResult = await response.json()
      setRegisterResult(data)

      if (data.alreadyRecorded) {
        setAlreadyRecorded(true)
      } else {
        setStep('recording')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReRecord = () => {
    setAlreadyRecorded(false)
    setStep('recording')
  }

  // Step 2: Recording (reuse existing component)
  if (step === 'recording' && registerResult) {
    return (
      <TestimonialRecordingPage
        contactId={registerResult.contactId}
        companyId={companyId}
        contactFirstName={firstName}
        companyName={companyName}
        companyLogoUrl={companyLogoUrl}
        contactStatus="link_opened"
        companyGooglePlaceId={companyGooglePlaceId}
        companyTrustpilotUrl={companyTrustpilotUrl}
        testimonialId=""
      />
    )
  }

  // Step 1: Identification form
  return (
    <div className="min-h-dvh bg-white flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
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
            <h1 className="text-2xl font-bold text-slate-900">{companyName}</h1>
          )}
          <h2 className="text-xl font-semibold text-slate-900">
            {t('title', { companyName })}
          </h2>
          <p className="text-base text-slate-600">
            {t('description')}
          </p>
        </motion.div>

        {/* Already recorded message */}
        {alreadyRecorded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3"
          >
            <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-slate-700 font-medium">{t('form.alreadyRecorded')}</p>
            <button
              onClick={handleReRecord}
              className="text-sm text-rose-500 hover:text-rose-600 font-medium underline"
            >
              {t('form.reRecord')}
            </button>
          </motion.div>
        )}

        {/* Form */}
        {!alreadyRecorded && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-xl shadow-lg p-6 space-y-4"
          >
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                {t('form.firstName')}
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                {t('form.email')}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                maxLength={255}
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">
                {t('form.companyName')}
              </label>
              <input
                id="companyName"
                type="text"
                required
                value={companyNameInput}
                onChange={(e) => setCompanyNameInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                maxLength={200}
              />
            </div>

            {/* Honeypot - hidden from users */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('form.submitting') : t('form.submit')}
            </button>
          </motion.form>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <a
            href="https://muchlove.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors"
          >
            Powered by MuchLove
            <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </a>
        </motion.div>
      </div>
    </div>
  )
}
