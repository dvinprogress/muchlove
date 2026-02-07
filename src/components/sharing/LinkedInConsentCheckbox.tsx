'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

interface LinkedInConsentCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function LinkedInConsentCheckbox({
  checked,
  onChange
}: LinkedInConsentCheckboxProps) {
  const t = useTranslations('sharing.linkedin')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100"
    >
      <input
        type="checkbox"
        id="linkedin-consent"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <div className="flex-1">
        <label
          htmlFor="linkedin-consent"
          className="text-sm font-medium text-gray-900 cursor-pointer"
        >
          {t('consent')}
        </label>
        <p className="text-xs text-gray-600 mt-1">{t('consentDescription')}</p>
      </div>
    </motion.div>
  )
}
