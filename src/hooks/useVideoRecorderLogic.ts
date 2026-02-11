'use client'

import { useEffect, useState, useCallback } from 'react'
import { useMediaRecorder } from './useMediaRecorder'
import { useWhisperTranscription } from './useWhisperTranscription'
import { createClient } from '@/lib/supabase/client'

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

      // Phase 1: Transcription client-side (non-bloquante)
      let transcription: string | null = null
      try {
        transcription = await transcribe(videoBlob)
      } catch (transcriptionError) {
        console.warn('Transcription failed (non-blocking):', transcriptionError)
        // Continue sans transcription
      }

      // Détecter le mode (legacy FormData pour demo vs nouveau JSON metadata)
      const isLegacyMode = !!config.buildFormData

      if (isLegacyMode) {
        // Mode legacy (demo) : FormData upload
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
        // Nouveau mode (production) : Upload Storage client-side + JSON metadata
        if (!config.contactId || !config.companyId) {
          throw new Error('contactId and companyId are required for direct upload mode')
        }

        // Phase 2: Upload direct du blob vers Supabase Storage
        const supabase = createClient()
        const timestamp = Date.now()
        const filePath = `${config.companyId}/${config.contactId}/raw_${timestamp}.webm`

        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, videoBlob, {
            contentType: videoBlob.type || 'video/webm',
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`)
        }

        // Phase 3: POST vers API avec metadata JSON (pas de FormData)
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

        await response.json()
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
