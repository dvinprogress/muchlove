import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { EMAIL_SEGMENTS, type EmailSegment } from '@/types/automations'

/**
 * Évalue et met à jour les segments comportementaux pour les email sequences
 * Appelé toutes les heures par le cron orchestrator
 *
 * Segments:
 * - Frozen Starter: signup > 24h ET 0 contacts créés
 * - Rejected Requester: 1-5 contacts invités + 0 vidéos reçues après 48h
 * - Collector Unused: 1+ vidéos complétées + aucune vue/partage après 3 jours
 * - Free Maximizer: videos_used >= videos_limit (20/20 en free)
 */
export async function evaluateSegments(): Promise<{
  evaluated: number
  newSequences: number
}> {
  const supabase = getSupabaseAdmin()
  let evaluated = 0
  let newSequences = 0

  try {
    // Fetch toutes les companies avec leurs stats
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select(
        `
        id,
        email,
        name,
        created_at,
        videos_used,
        videos_limit,
        plan,
        email_preferences,
        last_active_at
      `
      )

    if (companiesError) {
      console.error('[evaluateSegments] Error fetching companies:', companiesError)
      throw companiesError
    }

    if (!companies || companies.length === 0) {
      console.log('[evaluateSegments] No companies found')
      return { evaluated: 0, newSequences: 0 }
    }

    console.log(`[evaluateSegments] Evaluating ${companies.length} companies`)

    // Pour chaque company, vérifier si elle tombe dans un segment
    for (const company of companies) {
      evaluated++

      // Vérifier email_preferences.sequences = true
      const emailPrefs = (company.email_preferences || {}) as {
        marketing?: boolean
        sequences?: boolean
        weekly_digest?: boolean
      }
      if (emailPrefs.sequences === false) {
        continue // Skip si désabonné des sequences
      }

      // Fetch stats pour cette company
      const [contactsResult, testimonialsResult, sequencesResult] = await Promise.all([
        // Contacts
        supabase
          .from('contacts')
          .select('id, status, created_at')
          .eq('company_id', company.id),

        // Testimonials
        supabase
          .from('testimonials')
          .select('id, processing_status, created_at, completed_at, shared_trustpilot, shared_google, shared_linkedin')
          .eq('company_id', company.id),

        // Sequences actives/complétées/annulées pour cette company
        supabase
          .from('email_sequences')
          .select('id, segment, status')
          .eq('company_id', company.id)
          .in('status', ['active', 'completed', 'cancelled']),
      ])

      const contacts = contactsResult.data || []
      const testimonials = testimonialsResult.data || []
      const existingSequences = sequencesResult.data || []

      // Helper: vérifier si une séquence existe déjà pour un segment
      const hasSequenceForSegment = (segment: EmailSegment) => {
        return existingSequences.some((seq) => seq.segment === segment)
      }

      const now = new Date()

      // --- Segment A: Frozen Starter ---
      // Trigger: signup > 24h ET 0 contacts créés
      // Ne pas recréer si séquence existe déjà
      if (!hasSequenceForSegment(EMAIL_SEGMENTS.FROZEN_STARTER)) {
        const signupDate = new Date(company.created_at)
        const hoursSinceSignup = (now.getTime() - signupDate.getTime()) / (1000 * 60 * 60)

        if (hoursSinceSignup > 24 && contacts.length === 0) {
          const { error: insertError } = await supabase.from('email_sequences').insert({
            company_id: company.id,
            segment: EMAIL_SEGMENTS.FROZEN_STARTER,
            step: 1,
            status: 'active',
            started_at: now.toISOString(),
            next_send_at: now.toISOString(), // Envoyer immédiatement
          })

          if (!insertError) {
            newSequences++
            console.log(`[evaluateSegments] Created FROZEN_STARTER sequence for company ${company.id}`)
          } else {
            console.error(`[evaluateSegments] Error creating FROZEN_STARTER sequence:`, insertError)
          }
        }
      }

      // --- Segment B: Rejected Requester ---
      // Trigger: 1-5 contacts créés + invitations envoyées ET 0 vidéos reçues après 48h
      // Ne pas recréer si séquence existe déjà
      if (!hasSequenceForSegment(EMAIL_SEGMENTS.REJECTED_REQUESTER)) {
        const invitedContacts = contacts.filter((c) =>
          ['invited', 'link_opened'].includes(c.status)
        )

        if (
          invitedContacts.length > 0 &&
          invitedContacts.length <= 5 &&
          testimonials.length === 0
        ) {
          // Vérifier que le contact le plus ancien a été invité il y a plus de 48h
          const oldestInvite = invitedContacts.reduce((oldest, current) => {
            return new Date(current.created_at) < new Date(oldest.created_at)
              ? current
              : oldest
          })

          const hoursSinceInvite =
            (now.getTime() - new Date(oldestInvite.created_at).getTime()) / (1000 * 60 * 60)

          if (hoursSinceInvite > 48) {
            const { error: insertError } = await supabase.from('email_sequences').insert({
              company_id: company.id,
              segment: EMAIL_SEGMENTS.REJECTED_REQUESTER,
              step: 1,
              status: 'active',
              started_at: now.toISOString(),
              next_send_at: now.toISOString(), // Envoyer immédiatement
            })

            if (!insertError) {
              newSequences++
              console.log(`[evaluateSegments] Created REJECTED_REQUESTER sequence for company ${company.id}`)
            } else {
              console.error(`[evaluateSegments] Error creating REJECTED_REQUESTER sequence:`, insertError)
            }
          }
        }
      }

      // --- Segment C: Collector Who Doesn't Use ---
      // Trigger: 1+ vidéos complétées ET aucune vue/download/partage après 3 jours
      // Ne pas recréer si séquence existe déjà
      if (!hasSequenceForSegment(EMAIL_SEGMENTS.COLLECTOR_UNUSED)) {
        const completedVideos = testimonials.filter(
          (t) => t.processing_status === 'completed'
        )

        if (completedVideos.length > 0) {
          // Vérifier qu'aucune vidéo n'a été partagée
          const hasAnyShared = completedVideos.some(
            (t) => t.shared_trustpilot || t.shared_google || t.shared_linkedin
          )

          if (!hasAnyShared) {
            // Vérifier que la plus ancienne vidéo complétée a plus de 3 jours
            const oldestCompleted = completedVideos.reduce((oldest, current) => {
              const oldestDate = oldest.completed_at || oldest.created_at
              const currentDate = current.completed_at || current.created_at
              return new Date(currentDate) < new Date(oldestDate) ? current : oldest
            })

            const completedDate = oldestCompleted.completed_at || oldestCompleted.created_at
            const hoursSinceCompleted =
              (now.getTime() - new Date(completedDate).getTime()) / (1000 * 60 * 60)

            if (hoursSinceCompleted > 72) {
              // 3 jours
              const { error: insertError } = await supabase.from('email_sequences').insert({
                company_id: company.id,
                segment: EMAIL_SEGMENTS.COLLECTOR_UNUSED,
                step: 1,
                status: 'active',
                started_at: now.toISOString(),
                next_send_at: now.toISOString(), // Envoyer immédiatement
              })

              if (!insertError) {
                newSequences++
                console.log(`[evaluateSegments] Created COLLECTOR_UNUSED sequence for company ${company.id}`)
              } else {
                console.error(`[evaluateSegments] Error creating COLLECTOR_UNUSED sequence:`, insertError)
              }
            }
          }
        }
      }

      // --- Segment D: Free Plan Maximizer ---
      // Trigger: videos_used >= videos_limit
      // Ce segment peut être recréé si les conditions changent (contrairement aux autres)
      // Note: Le trigger immédiat est dans /api/upload-video, ici c'est juste un safety net
      if (company.videos_used >= company.videos_limit && company.plan === 'free') {
        // Vérifier si une séquence active existe déjà pour ce segment
        const hasActiveMaximizerSequence = existingSequences.some(
          (seq) => seq.segment === EMAIL_SEGMENTS.FREE_MAXIMIZER && seq.status === 'active'
        )

        if (!hasActiveMaximizerSequence) {
          const { error: insertError } = await supabase.from('email_sequences').insert({
            company_id: company.id,
            segment: EMAIL_SEGMENTS.FREE_MAXIMIZER,
            step: 1,
            status: 'active',
            started_at: now.toISOString(),
            next_send_at: now.toISOString(), // Envoyer immédiatement
          })

          if (!insertError) {
            newSequences++
            console.log(`[evaluateSegments] Created FREE_MAXIMIZER sequence for company ${company.id}`)
          } else {
            console.error(`[evaluateSegments] Error creating FREE_MAXIMIZER sequence:`, insertError)
          }
        }
      }
    }

    console.log(
      `[evaluateSegments] Evaluated ${evaluated} companies, created ${newSequences} new sequences`
    )
    return { evaluated, newSequences }
  } catch (error) {
    console.error('[evaluateSegments] Unexpected error:', error)
    throw error
  }
}
