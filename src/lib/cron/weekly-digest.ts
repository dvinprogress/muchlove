import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { sendEmail } from '@/lib/email/resend'
import { WeeklyDigest } from '@/lib/email/templates/WeeklyDigest'
import { aggregateWeeklyStats } from '@/lib/email/digest/stats-aggregator'
import { generateRecommendation } from '@/lib/email/digest/recommendation-engine'

function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase credentials')
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

/**
 * Retourne le début de la semaine courante (lundi 00:00:00 UTC)
 */
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setUTCDate(diff)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/**
 * Vérifie si un digest a déjà été envoyé cette semaine pour cette company
 */
async function hasDigestBeenSentThisWeek(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  companyId: string
): Promise<boolean> {
  const weekStart = getStartOfWeek(new Date())

  const { count } = await supabase
    .from('email_events')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('email_type', 'weekly_digest')
    .gte('sent_at', weekStart.toISOString())

  return (count || 0) > 0
}

/**
 * Détermine si on doit envoyer un digest basé sur l'activité et les insights
 */
function shouldSendDigest(stats: ReturnType<typeof aggregateWeeklyStats> extends Promise<infer T> ? T : never): boolean {
  // Envoyer si au moins une activité cette semaine
  if (stats.newContacts > 0 || stats.newVideos > 0 || stats.newShares > 0 || stats.newAmbassadors > 0) {
    return true
  }

  // Envoyer si on a des insights actionnables (pas de contacts du tout, ou limite atteinte)
  if (stats.totalContacts === 0 || stats.videosUsed >= stats.videosLimit) {
    return true
  }

  // Sinon, ne pas envoyer (pas d'activité et pas d'insight)
  return false
}

/**
 * Log l'envoi d'email dans email_events
 */
async function logEmailEvent(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  companyId: string,
  emailId: string,
  success: boolean,
  error?: string
): Promise<void> {
  await supabase.from('email_events').insert({
    company_id: companyId,
    email_type: 'weekly_digest',
    sent_at: new Date().toISOString(),
    status: success ? 'sent' : 'bounced',
    resend_email_id: success ? emailId : null,
    error_message: error || null,
  } as any)
}

/**
 * Génère l'URL de désabonnement avec token
 */
function generateUnsubscribeUrl(companyId: string, email: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://muchlove.app'
  const token = Buffer.from(`${companyId}:${email}:weekly_digest`).toString('base64')
  return `${baseUrl}/unsubscribe?token=${token}`
}

/**
 * Envoie les digests hebdomadaires aux companies
 * Appelé 1x/semaine (lundi 9h UTC) par le cron orchestrator
 */
export async function sendWeeklyDigests(): Promise<{ sent: number; skipped: number }> {
  const supabase = getSupabaseAdmin()
  let sent = 0
  let skipped = 0

  try {
    // 1. Fetch toutes les companies avec email_preferences.weekly_digest = true
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, email, name, email_preferences')

    if (companiesError) {
      console.error('[weekly-digest] Error fetching companies:', companiesError)
      throw companiesError
    }

    if (!companies || companies.length === 0) {
      console.log('[weekly-digest] No companies found')
      return { sent: 0, skipped: 0 }
    }

    console.log(`[weekly-digest] Processing ${companies.length} companies`)

    // 2. Pour chaque company
    for (const company of companies) {
      try {
        // Vérifier les préférences email
        const emailPrefs = (company as any).email_preferences as { weekly_digest?: boolean } | null
        if (!emailPrefs?.weekly_digest) {
          console.log(`[weekly-digest] Skipping ${(company as any).id} (weekly_digest disabled)`)
          skipped++
          continue
        }

        // Vérifier l'idempotence (déjà envoyé cette semaine ?)
        const alreadySent = await hasDigestBeenSentThisWeek(supabase, (company as any).id)
        if (alreadySent) {
          console.log(`[weekly-digest] Skipping ${(company as any).id} (already sent this week)`)
          skipped++
          continue
        }

        // Agréger les stats de la semaine
        const stats = await aggregateWeeklyStats((company as any).id)

        // Décider si on envoie (activité ou insight actionnable)
        if (!shouldSendDigest(stats)) {
          console.log(`[weekly-digest] Skipping ${(company as any).id} (no activity or actionable insight)`)
          skipped++
          continue
        }

        // Générer la recommandation contextuelle
        const recommendation = generateRecommendation(stats)

        // Générer l'URL de désabonnement
        const unsubscribeUrl = generateUnsubscribeUrl((company as any).id, (company as any).email)

        // Dashboard URL
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://muchlove.app'}/dashboard`

        // Envoyer l'email via Resend
        const { data, error } = await sendEmail({
          to: (company as any).email,
          subject: 'Your weekly MuchLove recap 💛',
          react: WeeklyDigest({
            companyName: (company as any).name,
            stats: {
              newContacts: stats.newContacts,
              newVideos: stats.newVideos,
              newShares: stats.newShares,
              newAmbassadors: stats.newAmbassadors,
            },
            recommendation,
            dashboardUrl,
            unsubscribeUrl,
          }),
          tags: [
            { name: 'type', value: 'weekly_digest' },
            { name: 'company_id', value: (company as any).id },
          ],
        })

        if (error) {
          console.error(`[weekly-digest] Error sending to ${(company as any).id}:`, error)
          await logEmailEvent(supabase, (company as any).id, '', false, error.message)
          skipped++
          continue
        }

        console.log(`[weekly-digest] Sent to ${(company as any).id} (${(company as any).email}) - ${data?.id}`)
        await logEmailEvent(supabase, (company as any).id, data?.id || '', true)
        sent++
      } catch (error) {
        console.error(`[weekly-digest] Error processing company ${(company as any).id}:`, error)
        skipped++
      }
    }

    console.log(`[weekly-digest] Completed: ${sent} sent, ${skipped} skipped`)
    return { sent, skipped }
  } catch (error) {
    console.error('[weekly-digest] Fatal error:', error)
    throw error
  }
}
