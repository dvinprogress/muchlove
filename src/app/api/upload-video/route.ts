import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin() as any
    // 1. Parser le FormData
    const formData = await request.formData()
    const video = formData.get('video') as File | null
    const contactId = formData.get('contactId') as string | null
    const duration = formData.get('duration') as string | null

    // 2. Validation des champs
    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Vidéo manquante' },
        { status: 400 }
      )
    }

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: 'ID du contact manquant' },
        { status: 400 }
      )
    }

    const durationSeconds = duration ? parseFloat(duration) : 0
    if (durationSeconds <= 0) {
      return NextResponse.json(
        { success: false, error: 'Durée invalide' },
        { status: 400 }
      )
    }

    if (video.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Fichier trop volumineux (max 50MB)' },
        { status: 400 }
      )
    }

    // 3. Fetch le contact pour obtenir company_id
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .select('id, company_id')
      .eq('id', contactId)
      .single() as { data: { id: string; company_id: string } | null; error: any }

    if (contactError || !contact) {
      return NextResponse.json(
        { success: false, error: 'Contact introuvable' },
        { status: 404 }
      )
    }

    // 4. Compter les tentatives existantes pour ce contact
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

    // 5. Upload vers Supabase Storage (bucket: raw-videos)
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

    // 6. Obtenir l'URL publique
    const { data: urlData } = supabaseAdmin
      .storage
      .from('raw-videos')
      .getPublicUrl(fileName)

    const rawVideoUrl = urlData.publicUrl

    // 7. Insert dans la table testimonials
    const { data: testimonial, error: testimonialError } = await supabaseAdmin
      .from('testimonials')
      .insert({
        company_id: contact.company_id,
        contact_id: contactId,
        raw_video_url: rawVideoUrl,
        duration_seconds: durationSeconds,
        attempt_number: attemptNumber,
        processing_status: 'pending' as const
      })
      .select('id')
      .single() as { data: { id: string } | null; error: any }

    if (testimonialError || !testimonial) {
      console.error('Testimonial insert error:', testimonialError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du témoignage' },
        { status: 500 }
      )
    }

    // 8. Update le contact status
    const { error: updateContactError } = await supabaseAdmin
      .from('contacts')
      .update({
        status: 'video_completed' as const,
        updated_at: new Date().toISOString()
      })
      .eq('id', contactId)

    if (updateContactError) {
      console.error('Contact update error:', updateContactError)
      // Ne pas faire planter la requete, juste logger
    }

    // 9. Fire and forget : lancer la transcription
    const transcribeUrl = new URL('/api/transcribe', request.url)
    fetch(transcribeUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testimonialId: testimonial.id })
    }).catch(err => {
      console.error('Failed to trigger transcription:', err)
    })

    // 10. Retourner le succes
    return NextResponse.json({
      success: true,
      testimonialId: testimonial.id
    })

  } catch (error) {
    console.error('Unexpected error in upload-video:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur inattendue' },
      { status: 500 }
    )
  }
}
