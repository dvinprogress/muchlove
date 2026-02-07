import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WidgetDashboard } from './WidgetDashboard'

export default async function WidgetPage() {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user's company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name, plan')
    .eq('email', user.email!)
    .single()

  if (companyError || !company) {
    redirect('/dashboard')
  }

  // Fetch widget config
  const { data: widgetConfig } = await supabase
    .from('widget_configs')
    .select('*')
    .eq('company_id', company.id)
    .single()

  return (
    <WidgetDashboard
      company={company}
      initialConfig={widgetConfig}
    />
  )
}
