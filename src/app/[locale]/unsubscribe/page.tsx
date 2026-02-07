import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface UnsubscribePageProps {
  searchParams: Promise<{
    success?: string
    error?: string
  }>
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams
  const t = useTranslations('email.unsubscribe')
  const isSuccess = params.success === 'true'
  const hasError = !!params.error

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>

        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-green-800">{t('success')}</p>
          </div>
        )}

        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-800">{t('error')}</p>
          </div>
        )}

        <p className="text-gray-600 mb-6">{t('resubscribe')}</p>

        <Link
          href="/dashboard"
          className="inline-block bg-[#FFBF00] text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-[#FFD633] transition-colors"
        >
          {t('backToDashboard')}
        </Link>
      </div>
    </div>
  )
}
