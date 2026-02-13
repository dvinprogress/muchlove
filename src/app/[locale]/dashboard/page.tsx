import { createClient } from '@/lib/supabase/server'
import { Video, Users, TrendingUp } from 'lucide-react'
import {
  Header,
  StatsCard,
  QuickActions,
  RecentActivity,
  ConversionFunnel,
} from '@/components/dashboard'
import { getDashboardStats } from './actions'
import type { Database } from '@/types/database'
import { getTranslations } from 'next-intl/server'

type Company = Database['public']['Tables']['companies']['Row']

export default async function DashboardPage() {
  const supabase = await createClient()
  const t = await getTranslations('dashboard')
  const tStats = await getTranslations('dashboard.stats')
  const tAlerts = await getTranslations('dashboard.alerts')

  // Récupérer l'utilisateur (déjà vérifié dans le layout)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Récupérer company + stats en parallèle
  const [companyResult, statsResult] = await Promise.all([
    supabase
      .from('companies')
      .select('*')
      .eq('id', user!.id)
      .single<Company>(),
    getDashboardStats(),
  ])

  const company = companyResult.data

  // Définir les limites par plan
  const planLimits: Record<string, number> = {
    free: 20,
    starter: 20,
    growth: 50,
    pro: 100,
  }

  const currentPlan = company?.plan || 'free'
  const videosUsed = company?.videos_used || 0
  const videosLimit = company?.videos_limit || planLimits[currentPlan] || 20
  const usagePercentage = videosLimit > 0 ? (videosUsed / videosLimit) * 100 : 0
  const stats = statsResult.success
    ? statsResult.data
    : {
        totalContacts: 0,
        totalTestimonials: 0,
        recentActivity: [],
        funnelData: {
          created: 0,
          invited: 0,
          link_opened: 0,
          video_started: 0,
          video_completed: 0,
          shared_1: 0,
          shared_2: 0,
          shared_3: 0,
        },
      }

  const totalContacts = stats.totalContacts
  const totalTestimonials = stats.totalTestimonials

  return (
    <div>
      <Header
        title={t('title')}
        description={t('description')}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard
          title={tStats('videosUsed')}
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
          title={tStats('contacts')}
          value={totalContacts}
          icon={<Users className="w-6 h-6" />}
        />
        <StatsCard
          title={tStats('testimonials')}
          value={totalTestimonials}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RecentActivity activities={stats.recentActivity} />
        <ConversionFunnel funnelData={stats.funnelData} />
      </div>

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
                {tAlerts('limitReached.title')}
              </h3>
              <p className="text-sm text-red-700">
                {tAlerts('limitReached.description')}
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
              <h3 className="font-semibold text-orange-900 mb-1">{tAlerts('limitWarning.title')}</h3>
              <p className="text-sm text-orange-700">
                {tAlerts('limitWarning.description')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
