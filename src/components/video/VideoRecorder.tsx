'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMediaRecorder } from '@/hooks/useMediaRecorder'
import { useWhisperTranscription } from '@/hooks/useWhisperTranscription'
import { PermissionRequest } from './PermissionRequest'
import { VideoPreview } from './VideoPreview'
import { RecordingControls } from './RecordingControls'
import { RECORDING_LIMITS } from '@/types/video'

interface VideoRecorderProps {
  contactId: string
  companyId: string
  maxAttempts?: number
  onComplete: (blob: Blob, duration: number) => void
}

export function VideoRecorder({
  contactId,
  companyId,
  maxAttempts: _maxAttempts = RECORDING_LIMITS.maxAttempts,
  onComplete
}: VideoRecorderProps) {
  const t = useTranslations('video.recorder')
  const {
    phase,
    duration,
    attempts,
    maxAttempts: hookMaxAttempts,
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
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'uploading' | 'complete' | 'error'>('idle')

  // Cleanup au unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const handleValidate = async () => {
    if (!videoBlob) return

    try {
      // Phase 1: Transcription client-side
      const transcription = await transcribe(videoBlob)

      // Phase 2: Upload avec transcription
      setUploadPhase('uploading')

      const formData = new FormData()
      formData.append('video', videoBlob, 'recording.webm')
      formData.append('contactId', contactId)
      formData.append('companyId', companyId)
      formData.append('duration', duration.toString())
      formData.append('transcription', transcription || '')

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      await response.json()

      // Upload réussi - passer en phase complete
      setUploadPhase('complete')

      // Appeler onComplete avec le blob et la durée
      onComplete(videoBlob, duration)
    } catch (err) {
      console.error('Upload error:', err)
      // En cas d'erreur, passer en phase error
      setUploadPhase('error')
    }
  }

  const renderPhase = () => {
    // Phase de transcription
    if (isTranscribing) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center space-y-4 p-8"
        >
          <Loader2 className="w-16 h-16 text-rose-500 animate-spin" />
          <p className="text-lg font-semibold text-gray-900">
            {isModelLoading ? t('modelLoading') : t('transcribing')}
          </p>
          <p className="text-sm text-gray-600">
            {t('transcribingDescription')}
          </p>
          <div className="w-full max-w-md">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-400 to-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              {Math.round(progress)}%
            </p>
          </div>
        </motion.div>
      )
    }

    // Priorité à uploadPhase si l'upload est en cours ou terminé
    if (uploadPhase === 'uploading') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center space-y-4 p-8"
        >
          <Loader2 className="w-16 h-16 text-rose-500 animate-spin" />
          <p className="text-lg font-semibold text-gray-900">
            {t('uploading')}
          </p>
          <p className="text-sm text-gray-600">
            {t('uploadingDescription')}
          </p>
        </motion.div>
      )
    }

    if (uploadPhase === 'complete') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center space-y-4 p-8"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {t('uploadSuccess')}
          </p>
          <p className="text-sm text-gray-600">
            {t('uploadSuccessDescription')}
          </p>
        </motion.div>
      )
    }

    if (uploadPhase === 'error') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center space-y-4 p-8"
        >
          <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-rose-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {t('uploadError')}
          </p>
          <p className="text-sm text-gray-600 text-center max-w-md">
            {t('uploadErrorDescription')}
          </p>
          <button
            onClick={() => setUploadPhase('idle')}
            className="px-6 py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          >
            {t('retryUpload')}
          </button>
        </motion.div>
      )
    }

    switch (phase) {
      case 'idle':
      case 'requesting':
        return (
          <PermissionRequest
            onRequestPermission={startCamera}
            error={error}
          />
        )

      case 'previewing':
      case 'countdown':
      case 'recording':
        return (
          <div className="w-full max-w-lg mx-auto">
            <VideoPreview
              stream={stream}
              isRecording={phase === 'recording'}
            />
            <RecordingControls
              phase={phase}
              duration={duration}
              maxDuration={RECORDING_LIMITS.maxDuration}
              attempts={attempts}
              maxAttempts={hookMaxAttempts}
              countdown={countdown}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onRetry={retryRecording}
              onValidate={handleValidate}
            />
          </div>
        )

      case 'recorded':
        return (
          <div className="w-full max-w-lg mx-auto">
            <VideoPreview videoUrl={videoUrl} />
            <RecordingControls
              phase={phase}
              duration={duration}
              maxDuration={RECORDING_LIMITS.maxDuration}
              attempts={attempts}
              maxAttempts={hookMaxAttempts}
              countdown={countdown}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onRetry={retryRecording}
              onValidate={handleValidate}
            />
          </div>
        )

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-4 p-8"
          >
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-rose-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {t('genericError')}
            </p>
            {error && (
              <p className="text-sm text-gray-600 text-center max-w-md">
                {error.message}
              </p>
            )}
            <button
              onClick={() => {
                cleanup()
                startCamera()
              }}
              className="px-6 py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              {t('retry')}
            </button>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <AnimatePresence mode="wait">
        {renderPhase()}
      </AnimatePresence>
    </div>
  )
}
