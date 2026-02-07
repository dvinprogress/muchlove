import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: {
        schema: 'public',
      },
    }
  )
}

/**
 * Nettoie les demo_sessions expirées et supprime leurs vidéos du storage
 * Appelé toutes les heures par le cron orchestrator
 */
export async function cleanupExpiredDemos() {
  const supabase = getSupabaseAdmin()

  // 1. Trouver les sessions expirées
  const { data: expired, error: fetchError } = await supabase
    .from('demo_sessions')
    .select('id, video_url')
    .lt('expires_at', new Date().toISOString())
    .returns<Array<{ id: string; video_url: string | null }>>()

  if (fetchError) {
    throw new Error(`Failed to fetch expired demos: ${fetchError.message}`)
  }

  if (!expired || expired.length === 0) {
    return { deleted: 0 }
  }

  // 2. Extraire les paths des vidéos depuis les URLs
  const videoPaths = expired
    .filter((session) => session.video_url)
    .map((session) => {
      // URL format: https://{project}.supabase.co/storage/v1/object/public/demo-videos/{path}
      const url = session.video_url!
      const match = url.match(/\/demo-videos\/(.+)$/)
      return match ? match[1] : null
    })
    .filter((path): path is string => path !== null)

  // 3. Supprimer les vidéos du storage
  if (videoPaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('demo-videos')
      .remove(videoPaths)

    if (storageError) {
      console.error('Failed to remove demo videos from storage:', storageError)
      // Continue anyway to delete the session records
    }
  }

  // 4. Supprimer les sessions de la DB
  const { error: deleteError, count } = await supabase
    .from('demo_sessions')
    .delete({ count: 'exact' })
    .lt('expires_at', new Date().toISOString())

  if (deleteError) {
    throw new Error(`Failed to delete expired demos: ${deleteError.message}`)
  }

  return { deleted: count || 0 }
}
