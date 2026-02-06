import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { uploadVideoSchema, VIDEO_VALIDATION } from '@/lib/validation/video-api'

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
    // 1. Authentification - Vérifier que l'utilisateur est connecté
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // 2. Parser le FormData
    const formData = await request.formData()
    const video = formData.get('video') as File | null
    const contactIdRaw = formData.get('contactId') as string | null
    const durationRaw = formData.get('duration') as string | null
    const transcriptionRaw = formData.get('transcription') as string | null

    // 3. Validation Zod des inputs
    const validationResult = uploadVideoSchema.safeParse({
      contactId: contactIdRaw,
      duration: durationRaw,
      transcription: transcriptionRaw,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      )
    }

    const { contactId, duration: durationSeconds, transcription } = validationResult.data

    // 4. Validation du fichier vidéo
    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Vidéo manquante' },
        { status: 400 }
      )
    }

    if (!VIDEO_VALIDATION.ALLOWED_MIME_TYPES.includes(video.type as 'video/webm' | 'video/mp4')) {
      return NextResponse.json(
        { success: false, error: 'Format vidéo non supporté (accepté: webm, mp4)' },
        { status: 400 }
      )
    }

    if (video.size > VIDEO_VALIDATION.MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Fichier trop volumineux (max 50MB)' },
        { status: 400 }
      )
    }

    if (durationSeconds < VIDEO_VALIDATION.MIN_DURATION || durationSeconds > VIDEO_VALIDATION.MAX_DURATION) {
      return NextResponse.json(
        { success: false, error: `Durée invalide (entre ${VIDEO_VALIDATION.MIN_DURATION}s et ${VIDEO_VALIDATION.MAX_DURATION}s)` },
        { status: 400 }
      )
    }

    // 5. Fetch le contact pour obtenir company_id
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .select('id, company_id')
      .eq('id', contactId)
      .single<{ id: string; company_id: string }>()

    if (contactError || !contact) {
      return NextResponse.json(
        { success: false, error: 'Contact introuvable' },
        { status: 404 }
      )
    }

    // 6. Autorisation - Vérifier que l'utilisateur a accès à cette company
    const { data: userCompany, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('id', contact.company_id)
      .eq('email', user.email!)
      .single<{ id: string }>()

    if (companyError || !userCompany) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé à ce contact' },
        { status: 403 }
      )
    }

    // 7. Compter les tentatives existantes pour ce contact
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

    // 8. Upload vers Supabase Storage (bucket: raw-videos)
    const timestamp = Date.now()
    const fileName = `${contact.company_id}/${contactId}/raw_${timestamp}.webm`

    const videoBuffer = await video.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('raw-videos')
      .upload(fileName, videoBuffer, {
        contentType: video.type || 'video/webm',
        upsert: false
      })

    if (uploadError || !uploadData) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'upload de la vidéo' },
        { status: 500 }
      )
    }

    // 9. Obtenir l'URL publique
    const { data: urlData } = supabaseAdmin
      .storage
      .from('raw-videos')
      .getPublicUrl(fileName)

    const rawVideoUrl = urlData.publicUrl

    // 10. Insert dans la table testimonials
    const hasTranscription = !!transcription
    const { data: testimonial, error: testimonialError } = await supabaseAdmin
      .from('testimonials')
      // @ts-ignore - Supabase admin client type inference issue with service role
      .insert({
        company_id: contact.company_id,
        contact_id: contactId,
        raw_video_url: rawVideoUrl,
        duration_seconds: durationSeconds,
        attempt_number: attemptNumber,
        transcription: transcription || null,
        processing_status: hasTranscription ? 'completed' : 'pending',
        completed_at: hasTranscription ? new Date().toISOString() : null
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

    // 11. Update le contact status
    const { error: updateContactError } = await supabaseAdmin
      .from('contacts')
      // @ts-ignore - Supabase admin client type inference issue with service role
      .update({
        status: 'video_completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', contactId)

    if (updateContactError) {
      console.error('Contact update error:', updateContactError)
      // Ne pas faire planter la requete, juste logger
    }

    // 12. Retourner le succes (plus de fire-and-forget vers /api/transcribe)
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
