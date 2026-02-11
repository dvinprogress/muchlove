'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface Step3Props {
  onNext: () => void
  onSkip: () => void
  onBack: () => void
}

export function Step3FirstContact({ onNext, onSkip, onBack }: Step3Props) {
  const t = useTranslations('onboarding')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!firstName.trim()) {
      toast.error('Please enter a first name')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    try {
      const { createFirstContact } = await import('../actions')
      const result = await createFirstContact({
        first_name: firstName.trim(),
        email: email.trim().toLowerCase(),
      })

      if (result.success) {
        toast.success(`Invitation sent to ${firstName}! 🚀`)
        onNext()
      } else {
        toast.error(result.error || 'Failed to send invitation')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-slate-900">
          {t('step3.title')}
        </h2>
        <p className="text-lg text-slate-600">{t('step3.subtitle')}</p>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        {/* First Name */}
        <div>
          <label
            htmlFor="first-name"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {t('step3.firstNameLabel')}
          </label>
          <input
            id="first-name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={t('step3.firstNamePlaceholder')}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {t('step3.emailLabel')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('step3.emailPlaceholder')}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Preview Card */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700">
            {firstName.trim()
              ? t('step3.previewWithName', { name: firstName.trim() })
              : t('step3.previewGeneric')}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('step3.back')}
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>Send invitation 🚀</>
          )}
        </button>

        <button
          onClick={onSkip}
          disabled={isSubmitting}
          className="text-slate-500 hover:text-slate-700 transition-colors px-4 py-2 disabled:opacity-50"
        >
          {t('step3.skip')}
        </button>
      </div>
    </div>
  )
}
