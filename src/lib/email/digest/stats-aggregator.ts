import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export interface WeeklyStats {
  newContacts: number
  newVideos: number
  newShares: number
  newAmbassadors: number
  totalContacts: number
  totalVideos: number
  videosUsed: number
  videosLimit: number
  plan: string
}

function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase credentials')
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function aggregateWeeklyStats(companyId: string): Promise<WeeklyStats> {
  const supabase = getSupabaseAdmin()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoISO = weekAgo.toISOString()

  // 1. Vérifier que la company existe et récupérer ses données
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('plan, videos_used, videos_limit')
    .eq('id', companyId)
    .single()

  if (companyError || !company) {
    throw new Error(`Company not found: ${companyId}`)
  }

  // 2. Nouveaux contacts créés dans les 7 derniers jours
  const { count: newContacts } = await supabase
    .from('contacts')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .gte('created_at', weekAgoISO)

  // 3. Nouvelles vidéos complétées dans les 7 derniers jours
  const { count: newVideos } = await supabase
    .from('testimonials')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('processing_status', 'completed')
    .gte('created_at', weekAgoISO)

  // 4. Nouveaux partages (contacts passés à shared_1/2/3 dans les 7 jours)
  // On compte les contacts qui ont updated_at récent ET au moins un partage
  const { data: recentShares } = await supabase
    .from('contacts')
    .select('shared_1, shared_2, shared_3')
    .eq('company_id', companyId)
    .gte('updated_at', weekAgoISO)
    .or('shared_1.not.is.null,shared_2.not.is.null,shared_3.not.is.null')

  const newShares = (recentShares as Array<{ shared_1?: string | null; shared_2?: string | null; shared_3?: string | null }>)?.reduce((acc, contact) => {
    let shares = 0
    if (contact.shared_1) shares++
    if (contact.shared_2) shares++
    if (contact.shared_3) shares++
    return acc + shares
  }, 0) || 0

  // 5. Nouveaux ambassadeurs (contacts passés à shared_3 dans les 7 jours)
  const { count: newAmbassadors } = await supabase
    .from('contacts')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .not('shared_3', 'is', null)
    .gte('updated_at', weekAgoISO)

  // 6. Totaux globaux
  const { count: totalContacts } = await supabase
    .from('contacts')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)

  const { count: totalVideos } = await supabase
    .from('testimonials')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('processing_status', 'completed')

  return {
    newContacts: newContacts || 0,
    newVideos: newVideos || 0,
    newShares,
    newAmbassadors: newAmbassadors || 0,
    totalContacts: totalContacts || 0,
    totalVideos: totalVideos || 0,
    videosUsed: (company as any).videos_used as number,
    videosLimit: (company as any).videos_limit as number,
    plan: (company as any).plan as string,
  }
}
