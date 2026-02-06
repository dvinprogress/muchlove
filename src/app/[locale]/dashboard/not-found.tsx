import { Card, CardContent, Button } from '@/components/ui'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  const t = await getTranslations('dashboard.notFound')

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-slate-100 p-4">
              <Search className="h-12 w-12 text-slate-400" />
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

          <Link href="/dashboard">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white font-semibold">
              {t('backToDashboard')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
