'use client'

import { Button } from '@/components/ui'
import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('recording.error')
  void _error
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-rose-50 p-4">
            <AlertCircle className="h-12 w-12 text-rose-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            {t('title')}
          </h1>
          <p className="text-slate-600">
            {t('description')}
          </p>
        </div>

        <Button
          onClick={reset}
          className="bg-rose-500 hover:bg-rose-600 text-white font-semibold"
        >
          {t('retry')}
        </Button>
      </div>
    </div>
  )
}
