'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { LogoUploader } from '@/app/[locale]/dashboard/onboarding/components/LogoUploader'
import { InfoTooltip } from '@/app/[locale]/dashboard/onboarding/components/InfoTooltip'
import {
  updateBusinessInfo,
  uploadCompanyLogo,
  updateSharingLinks,
} from '@/app/[locale]/dashboard/onboarding/actions'

interface CompanyProfileSectionProps {
  company: {
    name: string
    industry: string | null
    logo_url: string | null
    trustpilot_url: string | null
    google_place_id: string | null
  }
}

export function CompanyProfileSection({ company }: CompanyProfileSectionProps) {
  const tOnboarding = useTranslations('onboarding.step1')
  const tOnboardingStep2 = useTranslations('onboarding.step2')
  const tSettings = useTranslations('settings.profile')

  // Section 1: Business info
  const [businessName, setBusinessName] = useState(company.name)
  const [industry, setIndustry] = useState(company.industry || '')
  const [isSavingBusiness, setIsSavingBusiness] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [logoUrl, setLogoUrl] = useState(company.logo_url)

  // Section 2: Sharing links
  const [trustpilotUrl, setTrustpilotUrl] = useState(company.trustpilot_url || '')
  const [googlePlaceId, setGooglePlaceId] = useState(company.google_place_id || '')
  const [isSavingLinks, setIsSavingLinks] = useState(false)

  const handleSaveBusinessInfo = async () => {
    setIsSavingBusiness(true)
    try {
      const result = await updateBusinessInfo({
        name: businessName,
        industry: industry || '',
      })

      if (result.success) {
        toast.success(tSettings('saved'))
      } else {
        toast.error(tSettings('error'))
      }
    } catch {
      toast.error(tSettings('error'))
    } finally {
      setIsSavingBusiness(false)
    }
  }

  const handleLogoUpload = async (file: File) => {
    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadCompanyLogo(formData)

      if (result.success) {
        // Generate new URL to force refresh
        const timestamp = Date.now()
        const newUrl = company.logo_url?.split('?')[0] + `?t=${timestamp}`
        setLogoUrl(newUrl)
        toast.success(tSettings('saved'))
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error(tSettings('error'))
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleSaveLinks = async () => {
    setIsSavingLinks(true)
    try {
      const result = await updateSharingLinks({
        trustpilot_url: trustpilotUrl || '',
        google_place_id: googlePlaceId || '',
      })

      if (result.success) {
        toast.success(tSettings('saved'))
      } else {
        toast.error(tSettings('error'))
      }
    } catch {
      toast.error(tSettings('error'))
    } finally {
      setIsSavingLinks(false)
    }
  }

  const industries = [
    { value: 'saas', label: tOnboarding('industries.saas') },
    { value: 'ecommerce', label: tOnboarding('industries.ecommerce') },
    { value: 'consulting', label: tOnboarding('industries.consulting') },
    { value: 'agency', label: tOnboarding('industries.agency') },
    { value: 'healthcare', label: tOnboarding('industries.healthcare') },
    { value: 'education', label: tOnboarding('industries.education') },
    { value: 'restaurant', label: tOnboarding('industries.restaurant') },
    { value: 'retail', label: tOnboarding('industries.retail') },
    { value: 'other', label: tOnboarding('industries.other') },
  ]

  return (
    <div className="space-y-6">
      {/* Section 1: Business Information */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">{tSettings('title')}</h2>
          <p className="text-sm text-slate-600 mt-1">{tSettings('description')}</p>
        </div>

        <div className="space-y-6">
          {/* Company name */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
              {tOnboarding('nameLabel')}
            </label>
            <input
              id="companyName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder={tOnboarding('namePlaceholder')}
            />
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-2">
              {tOnboarding('industryLabel')}
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">{tOnboarding('industryPlaceholder')}</option>
              {industries.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {tOnboarding('logoLabel')}
            </label>
            <LogoUploader
              currentLogoUrl={logoUrl}
              onUpload={handleLogoUpload}
              isUploading={isUploadingLogo}
            />
            <p className="text-xs text-slate-500 mt-2">{tOnboarding('logoMaxSize')}</p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveBusinessInfo}
            disabled={isSavingBusiness || isUploadingLogo}
            className="px-6 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingBusiness ? tSettings('saving') : tSettings('save')}
          </button>
        </div>
      </div>

      {/* Section 2: Sharing Links */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">{tSettings('sharingLinks')}</h2>
          <p className="text-sm text-slate-600 mt-1">{tSettings('sharingLinksDescription')}</p>
        </div>

        <div className="space-y-6">
          {/* Trustpilot URL */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="trustpilotUrl" className="block text-sm font-medium text-slate-700">
                {tOnboardingStep2('trustpilotLabel')}
              </label>
              <InfoTooltip title={tOnboardingStep2('trustpilotTooltipTitle')}>
                <p className="text-xs">
                  <strong>1.</strong> {tOnboardingStep2('trustpilotTooltipStep1')}
                </p>
                <p className="text-xs">
                  <strong>2.</strong> {tOnboardingStep2('trustpilotTooltipStep2')}
                </p>
                <p className="text-xs">
                  <strong>3.</strong> {tOnboardingStep2('trustpilotTooltipStep3')}
                </p>
                <a
                  href="https://www.trustpilot.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                >
                  {tOnboardingStep2('trustpilotTooltipLink')} →
                </a>
              </InfoTooltip>
            </div>
            <input
              id="trustpilotUrl"
              type="url"
              value={trustpilotUrl}
              onChange={(e) => setTrustpilotUrl(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder={tOnboardingStep2('trustpilotPlaceholder')}
            />
          </div>

          {/* Google Place ID */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="googlePlaceId" className="block text-sm font-medium text-slate-700">
                {tOnboardingStep2('googleLabel')}
              </label>
              <InfoTooltip title={tOnboardingStep2('googleTooltipTitle')}>
                <p className="text-xs">
                  <strong>1.</strong> {tOnboardingStep2('googleTooltipStep1')}
                </p>
                <p className="text-xs">
                  <strong>2.</strong> {tOnboardingStep2('googleTooltipStep2')}
                </p>
                <p className="text-xs">
                  <strong>3.</strong> {tOnboardingStep2('googleTooltipStep3')}
                </p>
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                >
                  {tOnboardingStep2('googleTooltipLink')} →
                </a>
              </InfoTooltip>
            </div>
            <input
              id="googlePlaceId"
              type="text"
              value={googlePlaceId}
              onChange={(e) => setGooglePlaceId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder={tOnboardingStep2('googlePlaceholder')}
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveLinks}
            disabled={isSavingLinks}
            className="px-6 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingLinks ? tSettings('saving') : tSettings('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
