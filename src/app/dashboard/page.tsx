import { createClient } from '@/lib/supabase/server'
import { Video, Users, TrendingUp } from 'lucide-react'
import { Header, StatsCard, QuickActions } from '@/components/dashboard'
import type { Database } from '@/types/database'

type Company = Database['public']['Tables']['companies']['Row']

export default async function DashboardPage() {
  const supabase = await createClient()

  // Récupérer l'utilisateur (déjà vérifié dans le layout)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Récupérer les données de la company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', user?.id)
    .single<Company>()

  // Définir les limites par plan
  const planLimits: Record<string, number> = {
    free: 5,
    starter: 20,
    growth: 50,
    pro: 100,
  }

  const currentPlan = company?.plan || 'free'
  const videosUsed = company?.videos_used || 0
  const videosLimit = company?.videos_limit || planLimits[currentPlan] || 5
  const usagePercentage = videosLimit > 0 ? (videosUsed / videosLimit) * 100 : 0

  // Stats fictives pour la démo (TODO: calculer depuis la base)
  const totalContacts = 0
  const totalTestimonials = 0

  return (
    <div>
      <Header
        title="Dashboard"
        description="Bienvenue sur votre tableau de bord MuchLove"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard
          title="Vidéos utilisées"
          value={`${videosUsed} / ${videosLimit}`}
          icon={<Video className="w-6 h-6" />}
          trend={
            videosUsed > 0
              ? {
                  value: Math.round((videosUsed / videosLimit) * 100),
                  positive: videosUsed < videosLimit * 0.8,
                }
              : undefined
          }
        />
        <StatsCard
          title="Contacts"
          value={totalContacts}
          icon={<Users className="w-6 h-6" />}
        />
        <StatsCard
          title="Témoignages"
          value={totalTestimonials}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Alerts */}
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
              <h3 className="font-semibold text-orange-900 mb-1">Attention</h3>
              <p className="text-sm text-orange-700">
                Vous approchez de votre limite mensuelle de vidéos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
