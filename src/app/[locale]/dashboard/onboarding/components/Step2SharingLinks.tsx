'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { InfoTooltip } from './InfoTooltip'
import { toast } from 'sonner'

interface Step2Props {
  trustpilotUrl: string | null
  googlePlaceId: string | null
  onNext: () => void
  onSkip: () => void
  onBack: () => void
}

export function Step2SharingLinks({
  trustpilotUrl: initialTrustpilot,
  googlePlaceId: initialGooglePlace,
  onNext,
  onSkip,
  onBack,
}: Step2Props) {
  const t = useTranslations('onboarding')
  const [trustpilotUrl, setTrustpilotUrl] = useState(initialTrustpilot || '')
  const [googlePlaceId, setGooglePlaceId] = useState(initialGooglePlace || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const { updateSharingLinks } = await import('../actions')
      const result = await updateSharingLinks({
        trustpilot_url: trustpilotUrl.trim() || '',
        google_place_id: googlePlaceId.trim() || '',
      })

      if (result.success) {
        toast.success('Sharing links saved! ✨')
        onNext()
      } else {
        toast.error(result.error || 'Failed to save sharing links')
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
          {t('step2.title')}
        </h2>
        <p className="text-lg text-slate-600">{t('step2.subtitle')}</p>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        {/* Trustpilot URL */}
        <div>
          <label
            htmlFor="trustpilot-url"
            className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2"
          >
            {t('step2.trustpilotLabel')}
            <InfoTooltip title={t('step2.trustpilotTooltipTitle')}>
              <ol className="list-decimal list-inside space-y-1">
                <li>{t('step2.trustpilotStep1')}</li>
                <li>{t('step2.trustpilotStep2')}</li>
                <li>{t('step2.trustpilotStep3')}</li>
              </ol>
              <a
                href="https://www.trustpilot.com/review"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium underline"
              >
                {t('step2.trustpilotLink')} →
              </a>
            </InfoTooltip>
          </label>
          <input
            id="trustpilot-url"
            type="text"
            value={trustpilotUrl}
            onChange={(e) => setTrustpilotUrl(e.target.value)}
            placeholder="https://www.trustpilot.com/review/yourcompany.com"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Google Place ID */}
        <div>
          <label
            htmlFor="google-place-id"
            className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2"
          >
            {t('step2.googlePlaceLabel')}
            <InfoTooltip title={t('step2.googlePlaceTooltipTitle')}>
              <ol className="list-decimal list-inside space-y-1">
                <li>{t('step2.googlePlaceStep1')}</li>
                <li>{t('step2.googlePlaceStep2')}</li>
                <li>{t('step2.googlePlaceStep3')}</li>
              </ol>
              <a
                href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium underline"
              >
                {t('step2.googlePlaceLink')} →
              </a>
            </InfoTooltip>
          </label>
          <input
            id="google-place-id"
            type="text"
            value={googlePlaceId}
            onChange={(e) => setGooglePlaceId(e.target.value)}
            placeholder="ChIJ..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">{t('step2.whyMatters')}</p>
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
          {t('step2.back')}
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>Continue →</>
          )}
        </button>

        <button
          onClick={onSkip}
          disabled={isSubmitting}
          className="text-slate-500 hover:text-slate-700 transition-colors px-4 py-2 disabled:opacity-50"
        >
          {t('step2.skip')}
        </button>
      </div>
    </div>
  )
}
