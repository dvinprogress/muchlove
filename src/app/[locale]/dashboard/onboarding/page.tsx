import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingFlow } from './OnboardingFlow'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: company } = await supabase
    .from('companies')
    .select('id, name, logo_url, trustpilot_url, google_place_id, industry, onboarding_completed_at')
    .eq('id', user.id)
    .single()

  if (!company) {
    redirect('/login')
  }

  // If onboarding already completed, redirect to dashboard
  if (company.onboarding_completed_at) {
    redirect('/dashboard')
  }

  return <OnboardingFlow company={company} />
}
