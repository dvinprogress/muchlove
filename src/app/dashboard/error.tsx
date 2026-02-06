'use client'

import { Card, CardContent, Button } from '@/components/ui'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  void _error
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-rose-50 p-4">
              <AlertCircle className="h-12 w-12 text-rose-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Oups, quelque chose s'est mal passé
            </h1>
            <p className="text-slate-600">
              Une erreur inattendue est survenue. Veuillez réessayer.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold"
            >
              Réessayer
            </Button>
            <Link href="/dashboard">
              <Button variant="secondary" className="w-full sm:w-auto">
                Retour au dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
