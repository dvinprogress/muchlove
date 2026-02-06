---
name: create-video-recorder
description: Implemente le composant d'enregistrement video avec MediaRecorder
argument-hint: "[basic|with-preview|full]"
user-invocable: true
---

# Workflow Video Recorder

Variante: **$ARGUMENTS**

## Pre-requis

Consulter l'agent `video-expert` pour les specs techniques detaillees.

## Phase 1: Setup Hooks

### 1.1 Hook useMediaPermissions

Fichier: `src/hooks/useMediaPermissions.ts`

```typescript
'use client'

import { useState, useCallback } from 'react'

type PermissionState = 'prompt' | 'granted' | 'denied' | 'checking'

interface UseMediaPermissionsReturn {
  cameraPermission: PermissionState
  microphonePermission: PermissionState
  checkPermissions: () => Promise<void>
  requestPermissions: () => Promise<MediaStream>
  error: string | null
}

export function useMediaPermissions(): UseMediaPermissionsReturn {
  const [cameraPermission, setCameraPermission] = useState<PermissionState>('checking')
  const [microphonePermission, setMicrophonePermission] = useState<PermissionState>('checking')
  const [error, setError] = useState<string | null>(null)

  const checkPermissions = useCallback(async () => {
    try {
      // Check camera
      const camera = await navigator.permissions.query({ name: 'camera' as PermissionName })
      setCameraPermission(camera.state as PermissionState)

      // Check microphone
      const mic = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      setMicrophonePermission(mic.state as PermissionState)
    } catch {
      // Firefox doesn't support permissions.query for camera/mic
      setCameraPermission('prompt')
      setMicrophonePermission('prompt')
    }
  }, [])

  const requestPermissions = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 720, max: 720 },
          height: { ideal: 720, max: 720 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      setCameraPermission('granted')
      setMicrophonePermission('granted')
      return stream
    } catch (err) {
      const error = err as Error
      if (error.name === 'NotAllowedError') {
        setCameraPermission('denied')
        setError('CAMERA_PERMISSION_DENIED')
      } else if (error.name === 'NotFoundError') {
        setError('CAMERA_NOT_FOUND')
      } else {
        setError('CAMERA_ERROR')
      }
      throw error
    }
  }, [])

  return {
    cameraPermission,
    microphonePermission,
    checkPermissions,
    requestPermissions,
    error
  }
}
```

### 1.2 Hook useMediaRecorder

Fichier: `src/hooks/useMediaRecorder.ts`

```typescript
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface RecorderOptions {
  maxDuration?: number  // seconds
  maxAttempts?: number
  onDataAvailable?: (blob: Blob) => void
}

interface UseMediaRecorderReturn {
  // State
  stream: MediaStream | null
  isRecording: boolean
  isPreviewing: boolean
  recordedBlob: Blob | null
  previewUrl: string | null
  duration: number
  attempt: number

  // Actions
  setStream: (stream: MediaStream) => void
  startRecording: () => void
  stopRecording: () => void
  retryRecording: () => void
  clearRecording: () => void

  // Error
  error: string | null
}

export function useMediaRecorder(options: RecorderOptions = {}): UseMediaRecorderReturn {
  const { maxDuration = 120, maxAttempts = 3 } = options

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [attempt, setAttempt] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Get supported mime type
  const getMimeType = useCallback(() => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/mp4',
      'video/webm'
    ]
    return types.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm'
  }, [])

  // Start recording
  const startRecording = useCallback(() => {
    if (!stream) {
      setError('NO_STREAM')
      return
    }

    chunksRef.current = []
    setDuration(0)
    setError(null)

    const mimeType = getMimeType()
    const recorder = new MediaRecorder(stream, { mimeType })

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType })
      setRecordedBlob(blob)
      setPreviewUrl(URL.createObjectURL(blob))
      setIsPreviewing(true)
    }

    recorder.onerror = () => {
      setError('RECORDING_FAILED')
      setIsRecording(false)
    }

    mediaRecorderRef.current = recorder
    recorder.start(1000) // Chunk every second
    setIsRecording(true)

    // Timer
    timerRef.current = setInterval(() => {
      setDuration(d => {
        if (d >= maxDuration - 1) {
          stopRecording()
          return maxDuration
        }
        return d + 1
      })
    }, 1000)
  }, [stream, getMimeType, maxDuration])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }
    setIsRecording(false)
  }, [])

  // Retry recording
  const retryRecording = useCallback(() => {
    if (attempt >= maxAttempts) {
      setError('MAX_ATTEMPTS_REACHED')
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setRecordedBlob(null)
    setPreviewUrl(null)
    setIsPreviewing(false)
    setDuration(0)
    setAttempt(a => a + 1)
  }, [attempt, maxAttempts, previewUrl])

  // Clear recording
  const clearRecording = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setRecordedBlob(null)
    setPreviewUrl(null)
    setIsPreviewing(false)
    setDuration(0)
  }, [previewUrl])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [])

  return {
    stream,
    isRecording,
    isPreviewing,
    recordedBlob,
    previewUrl,
    duration,
    attempt,
    setStream,
    startRecording,
    stopRecording,
    retryRecording,
    clearRecording,
    error
  }
}
```

## Phase 2: Composants UI

### 2.1 VideoPreview

Fichier: `src/components/video/VideoPreview.tsx`

```typescript
'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface VideoPreviewProps {
  stream?: MediaStream | null
  previewUrl?: string | null
  isRecording?: boolean
}

export function VideoPreview({ stream, previewUrl, isRecording }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-gray-900">
      {/* Live stream or preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={!previewUrl}
        src={previewUrl || undefined}
        className="w-full h-full object-cover"
      />

      {/* Recording indicator */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 left-4 flex items-center gap-2"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-3 h-3 bg-red-500 rounded-full"
          />
          <span className="text-white text-sm font-medium">REC</span>
        </motion.div>
      )}
    </div>
  )
}
```

### 2.2 RecordingControls

Fichier: `src/components/video/RecordingControls.tsx`

```typescript
'use client'

import { motion } from 'framer-motion'

interface RecordingControlsProps {
  isRecording: boolean
  isPreviewing: boolean
  duration: number
  maxDuration: number
  attempt: number
  maxAttempts: number
  onStart: () => void
  onStop: () => void
  onRetry: () => void
  onValidate: () => void
}

export function RecordingControls({
  isRecording,
  isPreviewing,
  duration,
  maxDuration,
  attempt,
  maxAttempts,
  onStart,
  onStop,
  onRetry,
  onValidate
}: RecordingControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      {/* Timer */}
      <div className="text-2xl font-mono">
        {formatTime(duration)} / {formatTime(maxDuration)}
      </div>

      {/* Attempt counter */}
      <div className="text-sm text-gray-500">
        Attempt {attempt} of {maxAttempts}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!isRecording && !isPreviewing && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600"
          >
            Start Recording
          </motion.button>
        )}

        {isRecording && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onStop}
            className="px-6 py-3 bg-gray-800 text-white rounded-full font-medium hover:bg-gray-900"
          >
            Stop Recording
          </motion.button>
        )}

        {isPreviewing && (
          <>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              disabled={attempt >= maxAttempts}
              className="px-6 py-3 border border-gray-300 rounded-full font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Try Again
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onValidate}
              className="px-6 py-3 bg-yellow-500 text-white rounded-full font-medium hover:bg-yellow-600"
            >
              Perfect, continue
            </motion.button>
          </>
        )}
      </div>
    </div>
  )
}
```

### 2.3 VideoRecorder (composant principal)

Fichier: `src/components/video/VideoRecorder.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMediaPermissions } from '@/hooks/useMediaPermissions'
import { useMediaRecorder } from '@/hooks/useMediaRecorder'
import { VideoPreview } from './VideoPreview'
import { RecordingControls } from './RecordingControls'

interface VideoRecorderProps {
  maxDuration?: number
  maxAttempts?: number
  onComplete: (blob: Blob) => void
  scripts?: string[]
}

export function VideoRecorder({
  maxDuration = 120,
  maxAttempts = 3,
  onComplete,
  scripts = []
}: VideoRecorderProps) {
  const { cameraPermission, requestPermissions, error: permissionError } = useMediaPermissions()
  const {
    stream,
    isRecording,
    isPreviewing,
    recordedBlob,
    previewUrl,
    duration,
    attempt,
    setStream,
    startRecording,
    stopRecording,
    retryRecording,
    error: recorderError
  } = useMediaRecorder({ maxDuration, maxAttempts })

  // Request camera on mount
  useEffect(() => {
    if (cameraPermission !== 'granted' && cameraPermission !== 'checking') {
      requestPermissions()
        .then(setStream)
        .catch(console.error)
    }
  }, [cameraPermission])

  const handleValidate = () => {
    if (recordedBlob) {
      onComplete(recordedBlob)
    }
  }

  // Show permission error
  if (permissionError) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-bold mb-4">Camera Access Needed</h3>
        <p className="text-gray-600 mb-6">
          We need camera access to record your video testimonial.
        </p>
        <button
          onClick={() => requestPermissions().then(setStream)}
          className="px-6 py-3 bg-yellow-500 text-white rounded-full"
        >
          Allow Camera Access
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Video preview */}
      <VideoPreview
        stream={stream}
        previewUrl={previewUrl}
        isRecording={isRecording}
      />

      {/* Recording controls */}
      <RecordingControls
        isRecording={isRecording}
        isPreviewing={isPreviewing}
        duration={duration}
        maxDuration={maxDuration}
        attempt={attempt}
        maxAttempts={maxAttempts}
        onStart={startRecording}
        onStop={stopRecording}
        onRetry={retryRecording}
        onValidate={handleValidate}
      />

      {/* Scripts sidebar */}
      {scripts.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-medium mb-3">Suggested talking points:</h4>
          <ul className="space-y-2">
            {scripts.map((script, i) => (
              <li key={i} className="flex gap-2 text-gray-600">
                <span className="text-yellow-500">•</span>
                {script}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error display */}
      {recorderError && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-center">
          {recorderError}
        </div>
      )}
    </motion.div>
  )
}
```

## Phase 3: Integration

### 3.1 Export index

Fichier: `src/components/video/index.ts`

```typescript
export { VideoRecorder } from './VideoRecorder'
export { VideoPreview } from './VideoPreview'
export { RecordingControls } from './RecordingControls'
```

### 3.2 Usage dans une page

```typescript
import { VideoRecorder } from '@/components/video'

export default function RecordPage() {
  const handleComplete = async (blob: Blob) => {
    // Upload to Supabase Storage
    const formData = new FormData()
    formData.append('video', blob, 'recording.webm')

    await fetch('/api/upload-video', {
      method: 'POST',
      body: formData
    })

    // Navigate to next step
  }

  return (
    <VideoRecorder
      maxDuration={60}
      maxAttempts={3}
      scripts={[
        "What problem were you trying to solve?",
        "How did we help you?",
        "What results did you achieve?",
        "Would you recommend us?"
      ]}
      onComplete={handleComplete}
    />
  )
}
```

## Phase 4: Verification

### 4.1 Tests manuels

- [ ] Camera permission request
- [ ] Live preview fonctionne
- [ ] Recording start/stop
- [ ] Timer fonctionne
- [ ] Preview video apres recording
- [ ] Retry fonctionne (max 3)
- [ ] Validate trigger onComplete

### 4.2 Tests cross-browser

- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] iOS Safari
- [ ] Chrome Android

### 4.3 Quality checks

```bash
npm run lint
npm run type-check
```

## Phase 5: Commit

```bash
git add src/hooks/useMedia* src/components/video/
git commit -m "feat(video): add VideoRecorder component with hooks"
```
