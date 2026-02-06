---
paths:
  - "src/components/**/Video*"
  - "src/hooks/useMedia*"
  - "src/app/api/video/**/*"
  - "src/app/api/upload/**/*"
---

# Conventions Video MuchLove

## MediaRecorder

### Toujours verifier le support

```typescript
if (!navigator.mediaDevices?.getUserMedia) {
  throw new Error('CAMERA_NOT_SUPPORTED')
}

// Verifier le codec supporte
function getSupportedMimeType(): string {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/mp4;codecs=h264,aac',
    'video/webm'
  ]
  return types.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm'
}
```

### Configuration MuchLove

```typescript
const VIDEO_CONSTRAINTS = {
  video: {
    width: { ideal: 720, max: 720 },
    height: { ideal: 720, max: 720 },
    frameRate: { ideal: 30, max: 30 },
    facingMode: 'user'
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100
  }
} as const

const RECORDING_LIMITS = {
  minDuration: 15,    // secondes
  maxDuration: 120,   // secondes
  maxAttempts: 3,
  maxFileSize: 50 * 1024 * 1024  // 50MB
} as const
```

### Gestion des permissions

```typescript
async function checkCameraPermission(): Promise<PermissionState> {
  try {
    const result = await navigator.permissions.query({
      name: 'camera' as PermissionName
    })
    return result.state
  } catch {
    // Firefox ne supporte pas permissions.query pour camera
    return 'prompt'
  }
}
```

### Cleanup obligatoire

```typescript
// TOUJOURS nettoyer dans useEffect
useEffect(() => {
  return () => {
    // Arreter les tracks camera/micro
    stream?.getTracks().forEach(track => track.stop())

    // Revoquer les object URLs
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    // Arreter le recorder si actif
    if (recorder?.state !== 'inactive') {
      recorder?.stop()
    }
  }
}, [stream, previewUrl, recorder])
```

## Recording Flow

### Structure du hook

```typescript
interface UseMediaRecorderReturn {
  // State
  stream: MediaStream | null
  isRecording: boolean
  isPreviewing: boolean
  recordedBlob: Blob | null
  duration: number
  attempt: number

  // Actions
  startCamera: () => Promise<void>
  startRecording: () => void
  stopRecording: () => void
  retryRecording: () => void
  validateRecording: () => Promise<void>

  // Errors
  error: RecordingError | null
}
```

### Gestion des chunks

```typescript
// Collecter en chunks de 1 seconde
recorder.ondataavailable = (event) => {
  if (event.data.size > 0) {
    chunks.current.push(event.data)
  }
}

// Start avec timeslice
recorder.start(1000) // Chunk toutes les secondes
```

## Processing

### Contraintes Vercel Functions

```typescript
const VERCEL_LIMITS = {
  maxExecutionTime: 60_000,  // 60 secondes
  maxPayloadSize: 50 * 1024 * 1024,  // 50MB
  maxResponseSize: 50 * 1024 * 1024
} as const
```

### Upload Chunked

```typescript
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

async function uploadChunked(
  file: Blob,
  path: string,
  onProgress?: (progress: number) => void
) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)

    await uploadChunk(chunk, `${path}/chunk-${i}`)
    onProgress?.((i + 1) / totalChunks * 100)
  }
}
```

### Transcription Whisper

```typescript
// Limite: 25MB audio, formats supportes
const WHISPER_LIMITS = {
  maxFileSize: 25 * 1024 * 1024,
  supportedFormats: ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']
} as const

// Extraire audio avant envoi si video > 25MB
async function extractAudio(videoBlob: Blob): Promise<Blob> {
  // Utiliser Web Audio API ou FFmpeg WASM
}
```

## Error Codes

```typescript
type RecordingErrorCode =
  | 'CAMERA_NOT_SUPPORTED'
  | 'CAMERA_PERMISSION_DENIED'
  | 'CAMERA_IN_USE'
  | 'MICROPHONE_PERMISSION_DENIED'
  | 'RECORDING_FAILED'
  | 'VIDEO_TOO_SHORT'
  | 'VIDEO_TOO_LONG'
  | 'FILE_TOO_LARGE'
  | 'UPLOAD_FAILED'
  | 'PROCESSING_FAILED'
  | 'TRANSCRIPTION_FAILED'

const errorMessages: Record<RecordingErrorCode, string> = {
  CAMERA_NOT_SUPPORTED: "Votre navigateur ne supporte pas l'acces camera",
  CAMERA_PERMISSION_DENIED: "Autorisez l'acces camera dans les parametres",
  CAMERA_IN_USE: "La camera est utilisee par une autre application",
  MICROPHONE_PERMISSION_DENIED: "Autorisez l'acces micro dans les parametres",
  RECORDING_FAILED: "L'enregistrement a echoue, reessayez",
  VIDEO_TOO_SHORT: "Enregistrez au moins 15 secondes",
  VIDEO_TOO_LONG: "La video doit faire moins de 2 minutes",
  FILE_TOO_LARGE: "Le fichier est trop volumineux (max 50MB)",
  UPLOAD_FAILED: "Echec de l'envoi, verifiez votre connexion",
  PROCESSING_FAILED: "Le traitement a echoue, reessayez",
  TRANSCRIPTION_FAILED: "La transcription a echoue"
}
```

## Tests

### Mock MediaRecorder

```typescript
// Pour les tests unitaires
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  state: 'inactive',
  ondataavailable: null,
  onerror: null,
  onstop: null
}

vi.stubGlobal('MediaRecorder', vi.fn(() => mockMediaRecorder))
```

### E2E avec Playwright

```typescript
// Mocker les permissions camera
await context.grantPermissions(['camera', 'microphone'])

// Utiliser un fichier video fake
await page.route('**/api/upload-video', route => {
  route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
})
```
