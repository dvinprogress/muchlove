import { Header } from '@/components/dashboard'
import { getBillingData } from './actions'
import { BillingSection, UsageCard } from '@/components/billing'
import { CreditTransactionsList } from './CreditTransactionsList'
import { CompanyProfileSection } from '@/components/settings/CompanyProfileSection'
import { getTranslations } from 'next-intl/server'

export default async function SettingsPage() {
  const t = await getTranslations('settings')
  const result = await getBillingData()

  const billing = result.success
    ? result.data
    : {
        company: null,
        subscription: null,
        recentTransactions: [],
        creditsRemaining: 0,
        creditsTotal: 5,
        usagePercentage: 0,
      }

  return (
    <div>
      <Header title={t('title')} description={t('description')} />

      <div className="space-y-6">
        {/* Company Profile */}
        {billing.company && (
          <CompanyProfileSection
            company={{
              name: billing.company.name,
              industry: billing.company.industry,
              logo_url: billing.company.logo_url,
              trustpilot_url: billing.company.trustpilot_url,
              google_place_id: billing.company.google_place_id,
            }}
          />
        )}

        {/* Usage Card */}
        <UsageCard
          videosUsed={billing.company?.videos_used ?? 0}
          videosLimit={billing.company?.videos_limit ?? 20}
          plan={billing.company?.plan ?? 'free'}
        />

        {/* Billing Management */}
        <BillingSection
          billing={{
            plan: billing.company?.plan ?? 'free',
            status: billing.subscription?.status ?? null,
            currentPeriodEnd: billing.subscription?.current_period_end ?? null,
            cancelAtPeriodEnd: billing.subscription?.cancel_at_period_end ?? false,
            stripeCustomerId: billing.company?.stripe_customer_id ?? null,
          }}
        />

        {/* Credit Transactions */}
        {billing.recentTransactions.length > 0 && (
          <CreditTransactionsList transactions={billing.recentTransactions} />
        )}
      </div>
    </div>
  )
}
