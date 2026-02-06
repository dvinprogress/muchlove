'use client'

import { useTranslations } from 'next-intl'

export default function Loading() {
  const t = useTranslations('recording.loading')
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-block h-12 w-12 animate-pulse">
          <div className="h-full w-full rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-600 font-medium">{t('message')}</p>
      </div>
    </div>
  )
}
