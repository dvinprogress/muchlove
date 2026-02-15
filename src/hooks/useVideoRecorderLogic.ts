'use client'

import { useEffect, useState, useCallback } from 'react'
import { useMediaRecorder } from './useMediaRecorder'
import { useWhisperTranscription } from './useWhisperTranscription'
import { createClient } from '@/lib/supabase/client'
import { generateThumbnail } from '@/lib/video/thumbnail'

export type UploadPhase = 'idle' | 'uploading' | 'complete' | 'error'

export interface UploadConfig {
  endpoint: string
  contactId?: string
  companyId?: string
  buildFormData?: (blob: Blob, duration: number, transcription: string | null) => FormData
  onSuccess: (blob: Blob, duration: number, transcription: string | null) => void
}

export function useVideoRecorderLogic(config: UploadConfig) {
  const {
    phase,
    duration,
    attempts,
    maxAttempts,
    error,
    stream,
    videoBlob,
    videoUrl,
    countdown,
    startCamera,
    startRecording,
    stopRecording,
    retryRecording,
    cleanup
  } = useMediaRecorder()

  const { transcribe, isTranscribing, isModelLoading, progress } = useWhisperTranscription()
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Cleanup au unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const handleValidate = useCallback(async () => {
    if (!videoBlob) return

    try {
      setUploadPhase('uploading')
      setUploadError(null)

      // Détecter le mode (legacy FormData pour demo vs nouveau JSON metadata)
      const isLegacyMode = !!config.buildFormData
      let transcription: string | null = null

      if (isLegacyMode) {
        // Mode legacy (demo) : transcription séquentielle + FormData upload
        try {
          transcription = await transcribe(videoBlob)
        } catch (transcriptionError) {
          console.warn('Transcription failed (non-blocking):', transcriptionError)
        }

        const formData = config.buildFormData!(videoBlob, duration, transcription)

        const response = await fetch(config.endpoint, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Upload failed')
        }

        await response.json()
      } else {
        // Mode production : transcription Groq + upload Storage EN PARALLÈLE
        if (!config.contactId || !config.companyId) {
          throw new Error('contactId and companyId are required for direct upload mode')
        }

        const supabase = createClient()
        const timestamp = Date.now()
        const filePath = `${config.companyId}/${config.contactId}/raw_${timestamp}.webm`

        // Lancer transcription et upload en parallèle
        let storageResult
        ;[transcription, storageResult] = await Promise.all([
          // Transcription via API Groq (non-bloquante)
          transcribe(videoBlob).catch((err) => {
            console.warn('Transcription failed (non-blocking):', err)
            return null
          }),
          // Upload vidéo vers Supabase Storage
          supabase.storage
            .from('videos')
            .upload(filePath, videoBlob, {
              contentType: videoBlob.type || 'video/webm',
              upsert: false
            })
        ])

        if (storageResult.error) {
          throw new Error(`Storage upload failed: ${storageResult.error.message}`)
        }

        // POST metadata vers API (avec transcription si disponible)
        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contactId: config.contactId,
            filePath,
            duration,
            transcription: transcription || undefined
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Upload failed')
        }

        const responseData = await response.json()
        const testimonialId = responseData.testimonialId

        // Phase 4: Generate and upload thumbnail (non-blocking, best-effort)
        if (testimonialId) {
          try {
            const thumbnailBlob = await generateThumbnail(videoBlob)
            const thumbnailPath = `${config.companyId}/${testimonialId}/thumb.jpg`

            await supabase.storage
              .from('thumbnails')
              .upload(thumbnailPath, thumbnailBlob, {
                contentType: 'image/jpeg',
                upsert: true
              })

            // Get public URL and update testimonial
            const { data: { publicUrl } } = supabase.storage
              .from('thumbnails')
              .getPublicUrl(thumbnailPath)

            await supabase
              .from('testimonials')
              .update({ thumbnail_url: publicUrl })
              .eq('id', testimonialId)
          } catch (thumbnailError) {
            // Non-blocking: thumbnail is nice-to-have, not critical
            console.warn('Thumbnail generation failed:', thumbnailError)
          }
        }
      }

      // Upload réussi - passer en phase complete
      setUploadPhase('complete')

      // Appeler le callback de succès
      config.onSuccess(videoBlob, duration, transcription)
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
      setUploadPhase('error')
    }
  }, [videoBlob, duration, transcribe, config])

  const resetUploadPhase = useCallback(() => {
    setUploadPhase('idle')
  }, [])

  const retryCamera = useCallback(() => {
    cleanup()
    startCamera()
  }, [cleanup, startCamera])

  return {
    // State du recorder
    phase,
    duration,
    attempts,
    maxAttempts,
    error,
    stream,
    videoBlob,
    videoUrl,
    countdown,

    // State de la transcription
    isTranscribing,
    isModelLoading,
    progress,

    // State de l'upload
    uploadPhase,
    uploadError,

    // Actions
    startCamera,
    startRecording,
    stopRecording,
    retryRecording,
    handleValidate,
    resetUploadPhase,
    retryCamera,
    cleanup
  }
}
