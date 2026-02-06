import { Button } from '@/components/ui'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Logo MuchLove */}
        <div className="flex justify-center">
          <div className="text-4xl font-bold">
            <span className="text-rose-500">Much</span>
            <span className="text-slate-900">Love</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="rounded-full bg-slate-100 p-4">
            <Search className="h-12 w-12 text-slate-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">
            {t('title')}
          </h1>
          <p className="text-slate-600">
            {t('subtitle')}
          </p>
        </div>

        <Link href="/">
          <Button className="bg-rose-500 hover:bg-rose-600 text-white font-semibold">
            {t('backButton')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
