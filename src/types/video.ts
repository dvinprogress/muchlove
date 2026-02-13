// === Error Codes ===
export type RecordingErrorCode =
  | 'CAMERA_NOT_SUPPORTED'
  | 'CAMERA_PERMISSION_DENIED'
  | 'CAMERA_IN_USE'
  | 'MICROPHONE_PERMISSION_DENIED'
  | 'RECORDING_FAILED'
  | 'RECORDING_TOO_SHORT'
  | 'RECORDING_TOO_LONG'
  | 'VIDEO_TOO_LARGE'
  | 'UPLOAD_FAILED'
  | 'UPLOAD_TIMEOUT'
  | 'PROCESSING_FAILED'
  | 'TRANSCRIPTION_FAILED'
  | 'MAX_ATTEMPTS_REACHED'

export interface RecordingError {
  code: RecordingErrorCode
  message: string
}

// Messages en francais
export const ERROR_MESSAGES: Record<RecordingErrorCode, string> = {
  CAMERA_NOT_SUPPORTED: "Votre navigateur ne supporte pas l'acces camera",
  CAMERA_PERMISSION_DENIED: "L'acces a la camera a ete refuse. Autorisez-le dans les parametres de votre navigateur.",
  CAMERA_IN_USE: "La camera est deja utilisee par une autre application",
  MICROPHONE_PERMISSION_DENIED: "L'acces au microphone a ete refuse. Autorisez-le dans les parametres.",
  RECORDING_FAILED: "L'enregistrement a echoue. Veuillez reessayer.",
  RECORDING_TOO_SHORT: "La video doit durer au moins 15 secondes",
  RECORDING_TOO_LONG: "La video ne peut pas depasser 1 minute",
  VIDEO_TOO_LARGE: "Le fichier video est trop volumineux (max 50 Mo)",
  UPLOAD_FAILED: "L'envoi de la video a echoue. Verifiez votre connexion.",
  UPLOAD_TIMEOUT: "L'envoi a pris trop de temps. Reessayez.",
  PROCESSING_FAILED: "Le traitement de la video a echoue",
  TRANSCRIPTION_FAILED: "La transcription a echoue",
  MAX_ATTEMPTS_REACHED: "Nombre maximum de tentatives atteint (3)"
}

// === Video Constraints ===
export const VIDEO_CONSTRAINTS: MediaStreamConstraints = {
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
}

// === Recording Limits ===
export const RECORDING_LIMITS = {
  minDuration: 15,
  maxDuration: 60,
  maxAttempts: 3,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  chunkInterval: 1000, // 1s chunks
} as const

// === Supported Codecs ===
// Fonction pour detecter le meilleur codec supporte
export function getSupportedMimeType(): string {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=h264,aac',
    'video/mp4',
  ]

  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }

  return 'video/webm' // fallback
}

// === Recording State ===
export type RecordingPhase =
  | 'idle'           // Pas encore demarre
  | 'requesting'     // Demande permissions
  | 'previewing'     // Camera active, pas encore d'enregistrement
  | 'countdown'      // 3-2-1
  | 'recording'      // En cours d'enregistrement
  | 'recorded'       // Enregistrement termine, preview
  | 'uploading'      // Upload en cours
  | 'complete'       // Tout termine
  | 'error'          // Erreur
