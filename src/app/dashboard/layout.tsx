import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard'
import type { Database } from '@/types/database'

type Company = Database['public']['Tables']['companies']['Row']

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Vérifier l'authentification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Récupérer les informations de l'entreprise
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', user.id)
    .single<Company>()

  return (
    <DashboardShell
      user={{ email: user.email ?? '' }}
      company={
        company
          ? {
              name: company.name,
              plan: company.plan,
            }
          : null
      }
    >
      {children}
    </DashboardShell>
  )
}
