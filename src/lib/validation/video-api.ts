import { z } from 'zod'

/**
 * Schema de validation pour /api/upload-video
 *
 * Valide les inputs FormData :
 * - video: File (video/webm ou video/mp4, max 50MB)
 * - contactId: UUID valide
 * - duration: nombre positif
 */
export const uploadVideoSchema = z.object({
  contactId: z.string().uuid('ID du contact invalide'),
  duration: z.coerce.number().positive('La durée doit être positive'),
  transcription: z.string().max(10000, 'Transcription trop longue').optional(),
  // Le File sera validé manuellement (pas de z.instanceof(File) car serveur)
})

/**
 * Schema de validation pour /api/transcribe
 *
 * Valide le body JSON :
 * - testimonialId: UUID valide
 */
export const transcribeSchema = z.object({
  testimonialId: z.string().uuid('ID du témoignage invalide')
})

/**
 * Constantes de validation
 */
export const VIDEO_VALIDATION = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_MIME_TYPES: ['video/webm', 'video/mp4'],
  MIN_DURATION: 1, // 1 seconde minimum
  MAX_DURATION: 180, // 3 minutes maximum
} as const
