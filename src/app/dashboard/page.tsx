import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/auth/actions'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Vérifier l'authentification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Récupérer les données de la company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', user.id)
    .single()

  // Définir les limites par plan
  const planLimits: Record<string, number> = {
    free: 5,
    starter: 20,
    growth: 50,
    pro: 100,
  }

  const planNames: Record<string, string> = {
    free: 'Gratuit',
    starter: 'Starter',
    growth: 'Growth',
    pro: 'Pro',
  }

  const currentPlan = company?.plan || 'free'
  const videosUsed = company?.videos_used || 0
  const videosLimit = company?.videos_limit || planLimits[currentPlan]
  const companyName = company?.name || ''
  const usagePercentage = (videosUsed / videosLimit) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {companyName ? `Bienvenue, ${companyName}` : 'Bienvenue'}
          </h1>
          <p className="text-slate-600">{user.email}</p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plan actuel */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Plan actuel
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {planNames[currentPlan]}
              </p>
            </div>

            {/* Vidéos utilisées */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Vidéos utilisées
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {videosUsed} / {videosLimit}
              </p>
              {/* Barre de progression */}
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    usagePercentage >= 100
                      ? 'bg-red-500'
                      : usagePercentage >= 80
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Statut
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    usagePercentage < 100 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <p className="text-lg font-semibold text-slate-900">
                  {usagePercentage < 100 ? 'Actif' : 'Limite atteinte'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <form action={signOut}>
            <button
              type="submit"
              className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Se déconnecter
            </button>
          </form>
        </div>

        {/* Alert si limite atteinte */}
        {usagePercentage >= 100 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">
                  Limite de vidéos atteinte
                </h3>
                <p className="text-sm text-red-700">
                  Vous avez utilisé toutes vos vidéos pour ce mois. Passez à un
                  plan supérieur pour continuer.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning si proche de la limite */}
        {usagePercentage >= 80 && usagePercentage < 100 && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">
                  Attention
                </h3>
                <p className="text-sm text-orange-700">
                  Vous approchez de votre limite mensuelle de vidéos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
