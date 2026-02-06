# Phase 3 : Video Recording - Récapitulatif

## Fichiers créés (8 fichiers)

### Hooks (4 fichiers)

1. **`src/hooks/useMediaPermissions.ts`** (2.8 KB)
   - Gère les permissions caméra/micro
   - Auto-check au mount
   - States: `permissionState`, `error`, `stream`
   - Méthodes: `requestPermissions()`, `checkPermission()`
   - Cleanup automatique du stream au unmount

2. **`src/hooks/useMediaRecorder.ts`** (8.1 KB)
   - Hook principal d'enregistrement vidéo
   - States: `phase`, `duration`, `attempts`, `error`, `videoBlob`, `videoUrl`, `countdown`
   - Méthodes: `startCamera()`, `startRecording()`, `stopRecording()`, `retryRecording()`, `cleanup()`
   - Timer auto pour durée et auto-stop à 120s
   - Countdown 3-2-1 avant enregistrement
   - Validation minDuration (15s) et maxFileSize (50 MB)
   - Gestion complète du MediaRecorder API

3. **`src/hooks/index.ts`** (158 B)
   - Barrel export pour tous les hooks
   - Exporte: `useConfetti`, `useMediaPermissions`, `useMediaRecorder`

### Composants (5 fichiers)

4. **`src/components/video/PermissionRequest.tsx`** (3.6 KB)
   - Écran de demande de permission caméra/micro
   - Icône Camera grande taille
   - Bouton rose "Autoriser l'accès à la caméra"
   - Messages d'erreur contextuels (denied, not supported, in use)
   - Guide navigateur (Chrome, Firefox, Safari) si permission refusée
   - Animation Framer Motion (fade in + slide up)

5. **`src/components/video/VideoPreview.tsx`** (1.9 KB)
   - Affiche vidéo en preview live ou playback
   - Mode live: `<video>` avec `srcObject = stream`
   - Mode playback: `<video controls src={videoUrl}>`
   - Aspect-ratio 1:1, rounded-2xl, max-w-md
   - Bordure rouge pulse pendant recording
   - Miroir horizontal pour selfie cam (mode live)
   - Placeholder Camera si pas de stream ni videoUrl

6. **`src/components/video/RecordingControls.tsx`** (5.5 KB)
   - Contrôles d'enregistrement sous la preview
   - Phase 'previewing': gros bouton rouge rond "Enregistrer"
   - Phase 'countdown': chiffre animé (3, 2, 1)
   - Phase 'recording': bouton Stop, timer live, barre progression, "REC" qui pulse
   - Phase 'recorded': boutons "Recommencer" + "Valider", durée finale, compteur "Tentative X/3"
   - Formatage durée mm:ss
   - Animations Framer Motion sur transitions

7. **`src/components/video/VideoRecorder.tsx`** (6.5 KB)
   - Orchestrateur principal qui compose tous les composants
   - Props: `contactId`, `companyId`, `maxAttempts`, `onComplete`
   - Utilise `useMediaRecorder` hook
   - Flow complet:
     - idle/requesting → PermissionRequest
     - previewing/countdown/recording → VideoPreview (live) + RecordingControls
     - recorded → VideoPreview (playback) + RecordingControls
     - uploading → Spinner + "Envoi en cours..."
     - complete → CheckCircle + "Vidéo envoyée avec succès !"
     - error → AlertCircle + message + bouton "Réessayer"
   - Upload POST `/api/upload-video` avec FormData (video blob, contactId, duration)
   - Gestion erreurs upload
   - Cleanup au unmount

8. **`src/components/video/index.ts`** (206 B)
   - Barrel export pour tous les composants video
   - Exporte: `PermissionRequest`, `VideoPreview`, `RecordingControls`, `VideoRecorder`

## Conventions respectées

- ✅ `'use client'` en haut de chaque composant et hook
- ✅ Imports types: `import type { ... } from '...'`
- ✅ Tous les textes UI en français
- ✅ Framer Motion pour animations
- ✅ Lucide React pour icônes (Camera, Video, Square, Circle, RotateCcw, Check, AlertCircle, Loader2, CheckCircle)
- ✅ Pas de shadcn, Tailwind from scratch
- ✅ Cleanup propre (stop stream tracks, clearInterval, URL.revokeObjectURL)

## Dépendances utilisées

- `@/types/video` : RecordingPhase, RecordingError, VIDEO_CONSTRAINTS, RECORDING_LIMITS, ERROR_MESSAGES, getSupportedMimeType
- `@/hooks/useConfetti` : Hook existant (déjà créé)
- `framer-motion` : AnimatePresence, motion
- `lucide-react` : Camera, Video, Square, Circle, RotateCcw, Check, AlertCircle, Loader2, CheckCircle
- MediaRecorder API (navigateur)
- navigator.mediaDevices.getUserMedia (navigateur)
- navigator.permissions.query (navigateur, avec fallback pour Firefox)

## Fonctionnalités implémentées

1. **Gestion permissions caméra/micro**
   - Auto-check au mount
   - Demande explicite avec gestion erreurs
   - Messages contextuels selon type d'erreur

2. **Enregistrement vidéo**
   - Preview live avec miroir horizontal
   - Countdown 3-2-1 avant recording
   - Timer live pendant recording
   - Barre de progression 0→120s
   - Indicateur "REC" qui pulse
   - Auto-stop à 120s (maxDuration)

3. **Validation**
   - Durée minimale 15s (RECORDING_TOO_SHORT)
   - Taille maximale 50 MB (VIDEO_TOO_LARGE)
   - 3 tentatives maximum (MAX_ATTEMPTS_REACHED)

4. **Playback**
   - Preview vidéo enregistrée avec controls
   - Boutons "Recommencer" / "Valider"
   - Compteur tentatives

5. **Upload**
   - POST `/api/upload-video` avec FormData
   - Spinner pendant upload
   - Gestion erreurs
   - Callback `onComplete(blob, duration)` au parent

6. **Cleanup**
   - Stop stream tracks au unmount
   - Clear timers (recording, countdown)
   - Revoke Object URLs
   - Reset states

## Prochaines étapes

- Phase 4 : Upload & Processing (API Routes + Supabase Storage)
- Phase 5 : Transcription (Whisper API ou alternative)
- Phase 6 : Question Generation (OpenAI GPT-4)
- Phase 7 : Dashboard Ambassador

## Notes techniques

- **MediaRecorder API** : getSupportedMimeType() détecte le meilleur codec (VP9 → VP8 → H.264 → fallback)
- **Chunks** : 1000ms chunks pour streaming progressif
- **Aspect ratio** : 1:1 (720x720) pour format mobile-first
- **Bitrate** : 2.5 Mbps pour bonne qualité sans fichier trop lourd
- **Audio** : echoCancellation + noiseSuppression activés pour qualité voix

---

**Date de création** : 2026-02-06
**Status** : ✅ Phase 3 complète (8/8 fichiers créés)
