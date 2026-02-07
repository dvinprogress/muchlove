import { NextRequest } from 'next/server'
import { cleanupExpiredDemos } from '@/lib/cron/demo-cleanup'
import { processEmailSequences } from '@/lib/cron/email-sequences'
import { evaluateSegments } from '@/lib/cron/segment-evaluation'
import { sendWeeklyDigests } from '@/lib/cron/weekly-digest'

export const maxDuration = 60 // Max execution time: 60s
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Auth: vérifier CRON_SECRET header
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const hour = now.getUTCHours()
  const dayOfWeek = now.getUTCDay() // 0=Sun, 1=Mon

  const results: Record<string, unknown> = {}

  // Toutes les heures : cleanup demos expirées
  try {
    results.demoCleanup = await cleanupExpiredDemos()
  } catch (e) {
    results.demoCleanup = { error: String(e) }
  }

  // 9h, 12h, 15h, 18h UTC : envoi emails séquences
  if ([9, 12, 15, 18].includes(hour)) {
    try {
      results.emailSequences = await processEmailSequences()
    } catch (e) {
      results.emailSequences = { error: String(e) }
    }
  }

  // 10h UTC : évaluation segments quotidienne
  if (hour === 10) {
    try {
      results.segmentEvaluation = await evaluateSegments()
    } catch (e) {
      results.segmentEvaluation = { error: String(e) }
    }
  }

  // Lundi 9h UTC : weekly digest
  if (dayOfWeek === 1 && hour === 9) {
    try {
      results.weeklyDigest = await sendWeeklyDigests()
    } catch (e) {
      results.weeklyDigest = { error: String(e) }
    }
  }

  return Response.json({ ok: true, timestamp: now.toISOString(), ran: results })
}
