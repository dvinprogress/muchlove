'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { RecordingPhase, RecordingError } from '@/types/video'
import { VIDEO_CONSTRAINTS, RECORDING_LIMITS, ERROR_MESSAGES, getSupportedMimeType } from '@/types/video'

interface UseMediaRecorderReturn {
  phase: RecordingPhase
  duration: number
  attempts: number
  maxAttempts: number
  error: RecordingError | null
  stream: MediaStream | null
  videoBlob: Blob | null
  videoUrl: string | null
  countdown: number | null
  startCamera: () => Promise<void>
  startRecording: () => void
  stopRecording: () => void
  retryRecording: () => void
  cleanup: () => void
}

export function useMediaRecorder(): UseMediaRecorderReturn {
  const [phase, setPhase] = useState<RecordingPhase>('idle')
  const [duration, setDuration] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState<RecordingError | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)

  const startCamera = useCallback(async () => {
    setError(null)
    setPhase('requesting')

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('CAMERA_NOT_SUPPORTED')
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS)
      setStream(mediaStream)
      setPhase('previewing')
    } catch (err) {
      let errorCode: RecordingError['code'] = 'CAMERA_PERMISSION_DENIED'

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          errorCode = 'CAMERA_PERMISSION_DENIED'
        } else if (err.name === 'NotFoundError') {
          errorCode = 'CAMERA_NOT_SUPPORTED'
        } else if (err.name === 'NotReadableError') {
          errorCode = 'CAMERA_IN_USE'
        }
      } else if (err instanceof Error && err.message === 'CAMERA_NOT_SUPPORTED') {
        errorCode = 'CAMERA_NOT_SUPPORTED'
      }

      setError({
        code: errorCode,
        message: ERROR_MESSAGES[errorCode]
      })
      setPhase('error')
    }
  }, [])

  const startRecording = useCallback(() => {
    if (!stream || phase !== 'previewing') return

    setError(null)
    setPhase('countdown')
    setCountdown(3)

    // Countdown 3, 2, 1
    let count = 3
    countdownTimerRef.current = setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      } else {
        setCountdown(null)
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current)
          countdownTimerRef.current = null
        }

        // Démarrer l'enregistrement
        try {
          const mimeType = getSupportedMimeType()
          const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 2500000 // 2.5 Mbps pour bonne qualité
          })

          chunksRef.current = []

          recorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              chunksRef.current.push(event.data)
            }
          }

          recorder.onerror = () => {
            setError({
              code: 'RECORDING_FAILED',
              message: ERROR_MESSAGES.RECORDING_FAILED
            })
            setPhase('error')
          }

          recorder.start(RECORDING_LIMITS.chunkInterval)
          mediaRecorderRef.current = recorder
          setPhase('recording')
          setDuration(0)

          // Timer pour incrementer la durée
          timerRef.current = setInterval(() => {
            setDuration(prev => {
              const newDuration = prev + 1

              // Auto-stop à maxDuration
              if (newDuration >= RECORDING_LIMITS.maxDuration) {
                if (timerRef.current) {
                  clearInterval(timerRef.current)
                  timerRef.current = null
                }
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                  mediaRecorderRef.current.stop()
                }
              }

              return newDuration
            })
          }, 1000)
        } catch {
          setError({
            code: 'RECORDING_FAILED',
            message: ERROR_MESSAGES.RECORDING_FAILED
          })
          setPhase('error')
        }
      }
    }, 1000)
  }, [stream, phase])

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || phase !== 'recording') return

    // Stop le timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const recorder = mediaRecorderRef.current

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: getSupportedMimeType() })

      // Validation minDuration
      if (duration < RECORDING_LIMITS.minDuration) {
        setError({
          code: 'RECORDING_TOO_SHORT',
          message: ERROR_MESSAGES.RECORDING_TOO_SHORT
        })
        setPhase('error')
        return
      }

      // Validation maxFileSize
      if (blob.size > RECORDING_LIMITS.maxFileSize) {
        setError({
          code: 'VIDEO_TOO_LARGE',
          message: ERROR_MESSAGES.VIDEO_TOO_LARGE
        })
        setPhase('error')
        return
      }

      // Générer URL pour playback
      const url = URL.createObjectURL(blob)
      setVideoBlob(blob)
      setVideoUrl(url)
      setPhase('recorded')
    }

    recorder.stop()
  }, [phase, duration])

  const retryRecording = useCallback(() => {
    // Vérifier maxAttempts
    if (attempts >= RECORDING_LIMITS.maxAttempts) {
      setError({
        code: 'MAX_ATTEMPTS_REACHED',
        message: ERROR_MESSAGES.MAX_ATTEMPTS_REACHED
      })
      setPhase('error')
      return
    }

    // Incrémenter attempts
    setAttempts(prev => prev + 1)

    // Révoquer l'ancienne URL si elle existe
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }

    // Reset states
    chunksRef.current = []
    setVideoBlob(null)
    setVideoUrl(null)
    setDuration(0)
    setError(null)
    setPhase('previewing')
  }, [attempts, videoUrl])

  const cleanup = useCallback(() => {
    // Stop stream tracks
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }

    // Stop timers
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }

    // Stop recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    // Revoke URLs
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }

    // Reset states
    setStream(null)
    setVideoBlob(null)
    setVideoUrl(null)
    setDuration(0)
    setCountdown(null)
    setPhase('idle')
    chunksRef.current = []
    mediaRecorderRef.current = null
  }, [stream, videoUrl])

  // Cleanup au unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [stream, videoUrl])

  return {
    phase,
    duration,
    attempts,
    maxAttempts: RECORDING_LIMITS.maxAttempts,
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
  }
}
