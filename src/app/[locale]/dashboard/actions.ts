'use server'

import { createClient } from '@/lib/supabase/server'
import type { Contact, ContactStatus } from '@/types/database'

// Type de retour pour les stats du dashboard
type DashboardStats = {
  totalContacts: number
  totalTestimonials: number
  recentActivity: Contact[]
  funnelData: Record<ContactStatus, number>
}

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

/**
 * Stats globales pour le dashboard
 * Récupère en parallèle :
 * - Nombre total de contacts
 * - Nombre total de témoignages
 * - 5 derniers contacts modifiés
 * - Répartition des contacts par status (funnel)
 */
export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Non authentifié' }
  }

  // 2. Faire les queries EN PARALLELE
  const [
    contactsCount,
    testimonialsCount,
    recentActivity,
    funnelData,
  ] = await Promise.all([
    // a. Count contacts
    supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true }),

    // b. Count testimonials
    supabase
      .from('testimonials')
      .select('id', { count: 'exact', head: true }),

    // c. Recent activity: 5 derniers contacts modifiés
    supabase
      .from('contacts')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5),

    // d. Funnel data: tous les statuts pour agrégation
    supabase
      .from('contacts')
      .select('status'),
  ])

  // Gestion des erreurs
  if (contactsCount.error) {
    return { success: false, error: contactsCount.error.message }
  }
  if (testimonialsCount.error) {
    return { success: false, error: testimonialsCount.error.message }
  }
  if (recentActivity.error) {
    return { success: false, error: recentActivity.error.message }
  }
  if (funnelData.error) {
    return { success: false, error: funnelData.error.message }
  }

  // Agrégation des stats du funnel
  const funnelStats: Record<ContactStatus, number> = {
    created: 0,
    invited: 0,
    link_opened: 0,
    video_started: 0,
    video_completed: 0,
    shared_1: 0,
    shared_2: 0,
    shared_3: 0,
  }

  funnelData.data.forEach((contact) => {
    if (contact.status in funnelStats) {
      funnelStats[contact.status as ContactStatus]++
    }
  })

  // 3. Return dashboard stats
  return {
    success: true,
    data: {
      totalContacts: contactsCount.count ?? 0,
      totalTestimonials: testimonialsCount.count ?? 0,
      recentActivity: recentActivity.data,
      funnelData: funnelStats,
    },
  }
}
