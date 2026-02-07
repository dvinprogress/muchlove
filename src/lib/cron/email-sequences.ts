import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { EMAIL_SEGMENTS, type EmailSegment, generateUnsubscribeToken } from '@/types/automations'
import { FrozenStarterEmail } from '@/lib/email/templates/FrozenStarterEmail'
import { RejectedRequesterEmail } from '@/lib/email/templates/RejectedRequesterEmail'
import { CollectorUnusedEmail } from '@/lib/email/templates/CollectorUnusedEmail'
import { FreeMaximizerEmail } from '@/lib/email/templates/FreeMaximizerEmail'

/**
 * Traite les séquences d'emails automatiques (behavioral emails)
 * Appelé toutes les heures par le cron orchestrator
 *
 * Pour chaque séquence active:
 * 1. Vérifie que next_send_at <= now()
 * 2. Vérifie que la company est toujours dans le segment (sinon cancel)
 * 3. Vérifie email_preferences.sequences = true
 * 4. Rend le template email
 * 5. Envoie via Resend
 * 6. Log dans email_events
 * 7. Calcule next_send_at ou marque completed
 */
export async function processEmailSequences(): Promise<{
  processed: number
  sent: number
  cancelled: number
  errors: number
}> {
  const supabase = getSupabaseAdmin()
  let processed = 0
  let sent = 0
  let cancelled = 0
  let errors = 0

  try {
    const now = new Date()

    // Fetch sequences actives où next_send_at <= now()
    const { data: sequences, error: sequencesError } = await supabase
      .from('email_sequences')
      .select('*')
      .eq('status', 'active')
      .lte('next_send_at', now.toISOString())

    if (sequencesError) {
      console.error('[processEmailSequences] Error fetching sequences:', sequencesError)
      throw sequencesError
    }

    if (!sequences || sequences.length === 0) {
      console.log('[processEmailSequences] No sequences to process')
      return { processed: 0, sent: 0, cancelled: 0, errors: 0 }
    }

    console.log(`[processEmailSequences] Processing ${sequences.length} sequences`)

    for (const sequence of sequences) {
      processed++

      try {
        // Fetch company avec stats pour vérifier si toujours dans le segment
        const { data: company, error: companyError } = await supabase
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
            email_preferences
          `
          )
          .eq('id', sequence.company_id)
          .single()

        if (companyError || !company) {
          console.error(`[processEmailSequences] Company ${sequence.company_id} not found`)
          errors++
          continue
        }

        // Vérifier email_preferences.sequences
        const emailPrefs = (company.email_preferences || {}) as {
          marketing?: boolean
          sequences?: boolean
          weekly_digest?: boolean
        }
        if (emailPrefs.sequences === false) {
          // Annuler la séquence
          await supabase
            .from('email_sequences')
            .update({
              status: 'cancelled',
              cancelled_reason: 'user_unsubscribed',
            })
            .eq('id', sequence.id)

          cancelled++
          console.log(`[processEmailSequences] Cancelled sequence ${sequence.id} (unsubscribed)`)
          continue
        }

        // Vérifier si la company est toujours dans le segment
        const stillInSegment = await checkIfStillInSegment(
          sequence.segment as EmailSegment,
          company.id
        )

        if (!stillInSegment) {
          // Annuler la séquence (l'utilisateur a progressé)
          await supabase
            .from('email_sequences')
            .update({
              status: 'cancelled',
              cancelled_reason: 'user_progressed',
            })
            .eq('id', sequence.id)

          cancelled++
          console.log(`[processEmailSequences] Cancelled sequence ${sequence.id} (user progressed)`)
          continue
        }

        // Générer l'URL unsubscribe
        const unsubscribeToken = generateUnsubscribeToken(company.id, 'sequences')
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${unsubscribeToken}`
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

        // Rendre le template en fonction du segment et step
        const emailTemplate = await renderEmailTemplate({
          segment: sequence.segment as EmailSegment,
          step: sequence.step,
          company,
          dashboardUrl,
          unsubscribeUrl,
        })

        if (!emailTemplate) {
          console.error(`[processEmailSequences] No template for segment ${sequence.segment} step ${sequence.step}`)
          errors++
          continue
        }

        // Envoyer l'email via Resend
        const result = await sendEmail({
          to: company.email,
          subject: emailTemplate.subject,
          react: emailTemplate.component,
          tags: [
            { name: 'sequence_id', value: sequence.id },
            { name: 'segment', value: sequence.segment },
            { name: 'step', value: String(sequence.step) },
          ],
        })

        if (!result.data?.id) {
          console.error(`[processEmailSequences] Failed to send email for sequence ${sequence.id}`)
          errors++
          continue
        }

        // Logger dans email_events
        await supabase.from('email_events').insert({
          sequence_id: sequence.id,
          company_id: company.id,
          email_type: sequence.segment,
          resend_id: result.data.id,
          recipient_email: company.email,
          status: 'sent',
          metadata: {
            segment: sequence.segment,
            step: sequence.step,
            subject: emailTemplate.subject,
          },
          sent_at: now.toISOString(),
        })

        // Calculer next_send_at ou marquer completed
        const { nextStep, nextSendAt, isCompleted } = calculateNextStep(
          sequence.segment as EmailSegment,
          sequence.step
        )

        if (isCompleted) {
          // Marquer la séquence comme completed
          await supabase
            .from('email_sequences')
            .update({
              status: 'completed',
              last_sent_at: now.toISOString(),
            })
            .eq('id', sequence.id)

          console.log(`[processEmailSequences] Completed sequence ${sequence.id}`)
        } else {
          // Passer à l'étape suivante
          await supabase
            .from('email_sequences')
            .update({
              step: nextStep,
              last_sent_at: now.toISOString(),
              next_send_at: nextSendAt,
            })
            .eq('id', sequence.id)

          console.log(`[processEmailSequences] Sequence ${sequence.id} → step ${nextStep}`)
        }

        sent++
      } catch (error) {
        console.error(`[processEmailSequences] Error processing sequence ${sequence.id}:`, error)
        errors++
      }
    }

    console.log(
      `[processEmailSequences] Processed ${processed}, sent ${sent}, cancelled ${cancelled}, errors ${errors}`
    )
    return { processed, sent, cancelled, errors }
  } catch (error) {
    console.error('[processEmailSequences] Unexpected error:', error)
    throw error
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Vérifie si une company est toujours dans un segment donné
 */
async function checkIfStillInSegment(
  segment: EmailSegment,
  companyId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin()

  // Fetch company avec stats
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, created_at, videos_used, videos_limit, plan')
    .eq('id', companyId)
    .single()

  if (companyError || !company) {
    return false
  }

  const [contactsResult, testimonialsResult] = await Promise.all([
    supabase.from('contacts').select('id, status, created_at').eq('company_id', companyId),
    supabase
      .from('testimonials')
      .select(
        'id, processing_status, created_at, completed_at, shared_trustpilot, shared_google, shared_linkedin'
      )
      .eq('company_id', companyId),
  ])

  const contacts = contactsResult.data || []
  const testimonials = testimonialsResult.data || []

  switch (segment) {
    case EMAIL_SEGMENTS.FROZEN_STARTER: {
      // Sortir du segment dès qu'1 contact est créé
      return contacts.length === 0
    }

    case EMAIL_SEGMENTS.REJECTED_REQUESTER: {
      // Sortir du segment dès qu'1 vidéo est reçue
      return testimonials.length === 0
    }

    case EMAIL_SEGMENTS.COLLECTOR_UNUSED: {
      // Sortir du segment dès qu'1 vidéo est partagée
      const completedVideos = testimonials.filter((t) => t.processing_status === 'completed')
      if (completedVideos.length === 0) return false

      const hasAnyShared = completedVideos.some(
        (t) => t.shared_trustpilot || t.shared_google || t.shared_linkedin
      )
      return !hasAnyShared
    }

    case EMAIL_SEGMENTS.FREE_MAXIMIZER: {
      // Reste dans le segment tant que videos_used >= videos_limit ET plan = free
      return company.videos_used >= company.videos_limit && company.plan === 'free'
    }

    default:
      return false
  }
}

/**
 * Rend le template email en fonction du segment et step
 */
async function renderEmailTemplate(params: {
  segment: EmailSegment
  step: number
  company: any
  dashboardUrl: string
  unsubscribeUrl: string
}): Promise<{ subject: string; component: React.ReactElement } | null> {
  const { segment, step, company, dashboardUrl, unsubscribeUrl } = params
  const supabase = getSupabaseAdmin()

  switch (segment) {
    case EMAIL_SEGMENTS.FROZEN_STARTER: {
      if (step === 1) {
        return {
          subject: 'Your first request takes 30 seconds ⚡',
          component: FrozenStarterEmail({
            step: 1,
            companyName: company.name,
            dashboardUrl,
            unsubscribeUrl,
          }),
        }
      } else if (step === 2) {
        return {
          subject: 'How TechCorp got 47 testimonials in 30 days',
          component: FrozenStarterEmail({
            step: 2,
            companyName: company.name,
            dashboardUrl,
            unsubscribeUrl,
          }),
        }
      }
      break
    }

    case EMAIL_SEGMENTS.REJECTED_REQUESTER: {
      if (step === 1) {
        const { count } = await supabase
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', company.id)

        return {
          subject: '3 ways to get more customers to respond',
          component: RejectedRequesterEmail({
            companyName: company.name,
            contactCount: count || 0,
            dashboardUrl,
            unsubscribeUrl,
          }),
        }
      }
      break
    }

    case EMAIL_SEGMENTS.COLLECTOR_UNUSED: {
      if (step === 1) {
        const { count } = await supabase
          .from('testimonials')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .eq('processing_status', 'completed')

        return {
          subject: `You have ${count || 0} video testimonial${count !== 1 ? 's' : ''} waiting 🎁`,
          component: CollectorUnusedEmail({
            companyName: company.name,
            videoCount: count || 0,
            dashboardUrl,
            unsubscribeUrl,
          }),
        }
      }
      break
    }

    case EMAIL_SEGMENTS.FREE_MAXIMIZER: {
      if (step === 1) {
        // Compter les contacts en attente (invited, link_opened)
        const { count: pendingCount } = await supabase
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .in('status', ['invited', 'link_opened'])

        return {
          subject: '🎉 You hit your free plan limit!',
          component: FreeMaximizerEmail({
            companyName: company.name,
            videosUsed: company.videos_used,
            pendingContacts: pendingCount || 0,
            dashboardUrl,
            unsubscribeUrl,
          }),
        }
      }
      break
    }

    default:
      return null
  }

  return null
}

/**
 * Calcule la prochaine étape et next_send_at
 * Règles:
 * - Frozen Starter: 2 emails (J+1, J+3) → espacés de 48h
 * - Rejected Requester: 1 email
 * - Collector Unused: 1 email
 * - Free Maximizer: 1 email
 */
function calculateNextStep(segment: EmailSegment, currentStep: number): {
  nextStep: number
  nextSendAt: string
  isCompleted: boolean
} {
  const now = new Date()

  switch (segment) {
    case EMAIL_SEGMENTS.FROZEN_STARTER: {
      if (currentStep === 1) {
        // Email 2 dans 48h
        const nextSendAt = new Date(now.getTime() + 48 * 60 * 60 * 1000)
        return {
          nextStep: 2,
          nextSendAt: nextSendAt.toISOString(),
          isCompleted: false,
        }
      } else {
        // Séquence terminée
        return {
          nextStep: currentStep,
          nextSendAt: now.toISOString(),
          isCompleted: true,
        }
      }
    }

    case EMAIL_SEGMENTS.REJECTED_REQUESTER:
    case EMAIL_SEGMENTS.COLLECTOR_UNUSED:
    case EMAIL_SEGMENTS.FREE_MAXIMIZER: {
      // 1 seul email → completed
      return {
        nextStep: currentStep,
        nextSendAt: now.toISOString(),
        isCompleted: true,
      }
    }

    default:
      return {
        nextStep: currentStep,
        nextSendAt: now.toISOString(),
        isCompleted: true,
      }
  }
}
