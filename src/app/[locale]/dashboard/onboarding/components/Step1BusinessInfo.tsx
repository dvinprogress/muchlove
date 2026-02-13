'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { LogoUploader } from './LogoUploader'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Step1Props {
  companyName: string
  companyLogoUrl: string | null
  companyIndustry: string | null
  onNext: () => void
  onSkip: () => void
}

export function Step1BusinessInfo({
  companyName: initialName,
  companyLogoUrl: initialLogoUrl,
  companyIndustry: initialIndustry,
  onNext,
  onSkip,
}: Step1Props) {
  const t = useTranslations('onboarding')
  const [name, setName] = useState(initialName)
  const [industry, setIndustry] = useState(initialIndustry || '')
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const industries = [
    { value: 'saas', label: t('step1.industries.saas') },
    { value: 'ecommerce', label: t('step1.industries.ecommerce') },
    { value: 'consulting', label: t('step1.industries.consulting') },
    { value: 'agency', label: t('step1.industries.agency') },
    { value: 'healthcare', label: t('step1.industries.healthcare') },
    { value: 'education', label: t('step1.industries.education') },
    { value: 'other', label: t('step1.industries.other') },
  ]

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      // Import action dynamically to avoid circular dependencies
      const { uploadCompanyLogo } = await import('../actions')

      // Create FormData and append file
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadCompanyLogo(formData)

      if (result.success) {
        // Reload to get updated logo URL
        window.location.reload()
        toast.success('Logo uploaded! 🎉')
      } else {
        toast.error(result.error || 'Failed to upload logo')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter your company name')
      return
    }

    setIsSubmitting(true)
    try {
      const { updateBusinessInfo } = await import('../actions')
      const result = await updateBusinessInfo({
        name: name.trim(),
        industry: industry || null,
      })

      if (result.success) {
        toast.success('Business info saved! 🙌')
        onNext()
      } else {
        toast.error(result.error || 'Failed to save business info')
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
          {t('step1.title')}
        </h2>
        <p className="text-lg text-slate-600">{t('step1.subtitle')}</p>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        {/* Company Name */}
        <div>
          <label
            htmlFor="company-name"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {t('step1.nameLabel')}
          </label>
          <input
            id="company-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            placeholder={t('step1.namePlaceholder')}
          />
        </div>

        {/* Industry */}
        <div>
          <label
            htmlFor="industry"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {t('step1.industryLabel')}
          </label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white"
          >
            <option value="">{t('step1.industryPlaceholder')}</option>
            {industries.map((ind) => (
              <option key={ind.value} value={ind.value}>
                {ind.label}
              </option>
            ))}
          </select>
        </div>

        {/* Logo Uploader */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('step1.logoLabel')}
          </label>
          <LogoUploader
            currentLogoUrl={initialLogoUrl}
            onUpload={handleUpload}
            isUploading={isUploading}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading}
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
          disabled={isSubmitting || isUploading}
          className="text-slate-500 hover:text-slate-700 transition-colors px-4 py-2 disabled:opacity-50"
        >
          {t('step1.skip')}
        </button>
      </div>
    </div>
  )
}
