'use client'

import { useEffect, useState, useCallback } from 'react'
import { useMediaRecorder } from './useMediaRecorder'
import { useWhisperTranscription } from './useWhisperTranscription'

export type UploadPhase = 'idle' | 'uploading' | 'complete' | 'error'

export interface UploadConfig {
  endpoint: string
  buildFormData: (blob: Blob, duration: number, transcription: string | null) => FormData
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

  // Cleanup au unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const handleValidate = useCallback(async () => {
    if (!videoBlob) return

    try {
      // Phase 1: Transcription client-side
      const transcription = await transcribe(videoBlob)

      // Phase 2: Upload avec transcription
      setUploadPhase('uploading')

      const formData = config.buildFormData(videoBlob, duration, transcription)

      const response = await fetch(config.endpoint, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      await response.json()

      // Upload réussi - passer en phase complete
      setUploadPhase('complete')

      // Appeler le callback de succès
      config.onSuccess(videoBlob, duration, transcription)
    } catch (err) {
      console.error('Upload error:', err)
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
