'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useVideoRecorderLogic } from '@/hooks/useVideoRecorderLogic'
import { PermissionRequest } from './PermissionRequest'
import { VideoPreview } from './VideoPreview'
import { RecordingControls } from './RecordingControls'
import { RECORDING_LIMITS } from '@/types/video'

interface DemoVideoRecorderProps {
  sessionId: string
  onDemoComplete: (blob: Blob, duration: number, transcription: string | null) => void
}

export function DemoVideoRecorder({
  sessionId,
  onDemoComplete
}: DemoVideoRecorderProps) {
  const t = useTranslations('video.recorder')
  const tDemo = useTranslations('demo.recording')

  const config = useMemo(() => ({
    endpoint: '/api/demo/upload-video',
    buildFormData: (blob: Blob, duration: number, transcription: string | null) => {
      const formData = new FormData()
      formData.append('video', blob, 'recording.webm')
      formData.append('sessionId', sessionId)
      formData.append('duration', duration.toString())
      if (transcription) {
        formData.append('transcription', transcription)
      }
      return formData
    },
    onSuccess: (blob: Blob, duration: number, transcription: string | null) => {
      onDemoComplete(blob, duration, transcription)
    }
  }), [sessionId, onDemoComplete])

  const {
    phase,
    duration,
    attempts,
    error,
    stream,
    videoUrl,
    countdown,
    isTranscribing,
    isModelLoading,
    progress,
    uploadPhase,
    startCamera,
    startRecording,
    stopRecording,
    retryRecording,
    handleValidate,
    resetUploadPhase,
    retryCamera
  } = useVideoRecorderLogic(config)

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
            onClick={resetUploadPhase}
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
            <div className="relative">
              <VideoPreview
                stream={stream}
                isRecording={phase === 'recording'}
              />
              {/* Watermark DEMO */}
              <div className="absolute top-4 right-4 bg-gray-900/70 text-white text-xs font-semibold px-2 py-1 rounded">
                {tDemo('watermark')}
              </div>
            </div>
            <RecordingControls
              phase={phase}
              duration={duration}
              maxDuration={RECORDING_LIMITS.maxDuration}
              attempts={attempts}
              maxAttempts={1}
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
            <div className="relative">
              <VideoPreview videoUrl={videoUrl} />
              {/* Watermark DEMO sur playback aussi */}
              <div className="absolute top-4 right-4 bg-gray-900/70 text-white text-xs font-semibold px-2 py-1 rounded">
                {tDemo('watermark')}
              </div>
            </div>
            <RecordingControls
              phase={phase}
              duration={duration}
              maxDuration={RECORDING_LIMITS.maxDuration}
              attempts={attempts}
              maxAttempts={1}
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
              onClick={retryCamera}
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
