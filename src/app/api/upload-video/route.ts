import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { uploadVideoMetadataSchema } from '@/lib/validation/video-api'

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: {
        schema: 'public'
      }
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    // 2. Parser le JSON body
    const body = await request.json()

    // 3. Validation Zod des metadata
    const validationResult = uploadVideoMetadataSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      )
    }

    const { contactId, filePath, duration: durationSeconds, transcription } = validationResult.data

    // 5. Fetch le contact et vérifier qu'il est autorisé à uploader
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .select('id, company_id, status, unique_link')
      .eq('id', contactId)
      .single<{ id: string; company_id: string; status: string; unique_link: string }>()

    if (contactError || !contact) {
      return NextResponse.json(
        { success: false, error: 'Contact introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que le contact est dans un état qui permet l'upload
    const allowedStatuses = ['created', 'invited', 'link_opened', 'video_completed']
    if (!allowedStatuses.includes(contact.status)) {
      return NextResponse.json(
        { success: false, error: 'Ce lien n\'est plus valide' },
        { status: 403 }
      )
    }

    // 6. Compter les tentatives existantes pour ce contact
    const { count, error: countError } = await supabaseAdmin
      .from('testimonials')
      .select('id', { count: 'exact', head: true })
      .eq('contact_id', contactId)

    if (countError) {
      console.error('Error counting attempts:', countError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors du comptage des tentatives' },
        { status: 500 }
      )
    }

    const attemptNumber = (count || 0) + 1

    // 7. Le fichier a déjà été uploadé par le client - construire l'URL publique
    const { data: urlData } = supabaseAdmin
      .storage
      .from('videos')
      .getPublicUrl(filePath)

    const rawVideoUrl = urlData.publicUrl

    // 8. Upsert dans la table testimonials (contact_id est UNIQUE — gère le re-enregistrement)
    const hasTranscription = !!transcription
    const { data: testimonial, error: testimonialError } = await supabaseAdmin
      .from('testimonials')
      .upsert({
        company_id: contact.company_id,
        contact_id: contactId,
        raw_video_url: rawVideoUrl,
        duration_seconds: durationSeconds,
        attempt_number: attemptNumber,
        transcription: transcription || null,
        processing_status: hasTranscription ? 'completed' : 'pending',
        completed_at: hasTranscription ? new Date().toISOString() : null
      }, {
        onConflict: 'contact_id'
      })
      .select('id')
      .single()

    if (testimonialError || !testimonial) {
      console.error('Testimonial insert error:', testimonialError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du témoignage' },
        { status: 500 }
      )
    }

    const testimonialId = (testimonial as { id: string }).id

    // 9. Update le contact status
    const { error: updateContactError } = await supabaseAdmin
      .from('contacts')
      .update({
        status: 'video_completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', contactId)

    if (updateContactError) {
      console.error('Contact update error:', updateContactError)
      // Ne pas faire planter la requete, juste logger
    }

    // 10. Vérifier si la company a atteint la limite (Free Maximizer trigger)
    // Fetch company pour vérifier videos_used vs videos_limit
    const { data: companyData, error: companyFetchError } = await supabaseAdmin
      .from('companies')
      .select('id, videos_used, videos_limit, plan, email_preferences')
      .eq('id', contact.company_id)
      .single<{
        id: string
        videos_used: number
        videos_limit: number
        plan: string
        email_preferences: any
      }>()

    if (!companyFetchError && companyData) {
      // Incrémenter videos_used
      const newVideosUsed = companyData.videos_used + 1

      await supabaseAdmin
        .from('companies')
        .update({ videos_used: newVideosUsed })
        .eq('id', companyData.id)

      // Si on atteint la limite ET plan = free ET email_preferences.sequences = true
      // Créer immédiatement une séquence FREE_MAXIMIZER
      const emailPrefs = (companyData.email_preferences || {}) as {
        marketing?: boolean
        sequences?: boolean
        weekly_digest?: boolean
      }

      if (
        newVideosUsed >= companyData.videos_limit &&
        companyData.plan === 'free' &&
        emailPrefs.sequences !== false
      ) {
        // Vérifier si une séquence active FREE_MAXIMIZER existe déjà
        const { data: existingSequence } = await supabaseAdmin
          .from('email_sequences')
          .select('id')
          .eq('company_id', companyData.id)
          .eq('segment', 'free_maximizer')
          .eq('status', 'active')
          .single()

        if (!existingSequence) {
          // Créer la séquence immédiatement
          const now = new Date()
          await supabaseAdmin.from('email_sequences').insert({
            company_id: companyData.id,
            segment: 'free_maximizer',
            step: 1,
            status: 'active',
            started_at: now.toISOString(),
            next_send_at: now.toISOString(), // Envoyer immédiatement
          })

          console.log(`[upload-video] Created FREE_MAXIMIZER sequence for company ${companyData.id}`)
        }
      }
    }

    // 11. Retourner le succes
    return NextResponse.json({
      success: true,
      testimonialId
    })

  } catch (error) {
    console.error('Unexpected error in upload-video:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur inattendue' },
      { status: 500 }
    )
  }
}
