# Video Patterns MuchLove

Documentation des patterns video utilises dans MuchLove.

---

## MediaRecorder Configuration

### Contraintes MuchLove

| Parametre | Valeur | Raison |
|-----------|--------|--------|
| Resolution | 720x720 | Format carre pour reseaux sociaux |
| Framerate | 30fps | Balance qualite/taille |
| Max duration | 120s | Limite raisonnable pour testimonials |
| Min duration | 15s | Assure un contenu substantiel |
| Max attempts | 3 | Evite frustration utilisateur |
| Max file size | 50MB | Limite Vercel Functions |

### Code Reference

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
}
```

### Codecs par Navigateur

| Navigateur | Codec Prefere | Fallback |
|------------|---------------|----------|
| Chrome | VP9 | VP8 |
| Firefox | VP8 | WebM |
| Safari | H.264 | - |
| Edge | VP9 | VP8 |

```typescript
function getSupportedMimeType(): string {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/mp4;codecs=h264,aac',
    'video/webm'
  ]
  return types.find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm'
}
```

---

## Upload Strategy

### Chunked Upload

Pour les videos > 5MB, utiliser upload chunke:

```typescript
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

async function uploadChunked(file: Blob, path: string) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

  for (let i = 0; i < totalChunks; i++) {
    const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
    await supabase.storage
      .from('videos')
      .upload(`${path}/chunk-${i}`, chunk)
  }
}
```

### Resume Capability

Stocker l'index du dernier chunk reussi en localStorage pour permettre la reprise.

---

## Processing Pipeline

### Etapes

```
1. UPLOAD (Client → Supabase Storage)
   └── Validation taille/format
   └── Chunked si > 5MB
   └── Progress tracking

2. TRANSCRIPTION (Vercel Function → Whisper API)
   └── Limite: 25MB audio
   └── Output: text + word timestamps

3. SUBTITLE GENERATION (Optionnel)
   └── Grouper mots en phrases
   └── Format SRT

4. YOUTUBE UPLOAD (Vercel Function → YouTube API)
   └── OAuth2 authentication
   └── Metadata standardise
   └── Privacy: Unlisted
```

### Vercel Function Limits

| Limite | Valeur | Impact |
|--------|--------|--------|
| Execution time | 60s | Processing leger seulement |
| Payload size | 50MB | OK pour nos videos |
| Memory | 1024MB (Pro) | Suffisant |

---

## Error Patterns

### Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| NotAllowedError | Permission refusee | Guide utilisateur vers settings |
| NotFoundError | Pas de camera | Verifier peripheriques |
| NotReadableError | Camera utilisee | Fermer autres apps |
| OverconstrainedError | Contraintes impossibles | Fallback vers contraintes de base |

### Retry Strategy

```typescript
const MAX_RETRIES = 3
const BACKOFF_MS = 1000

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === MAX_RETRIES - 1) throw error
      await delay(BACKOFF_MS * (i + 1))
    }
  }
  throw new Error('Max retries reached')
}
```

---

## Performance Tips

1. **Preload camera** avant que l'utilisateur clique "Record"
2. **Utiliser chunks de 1s** pour MediaRecorder (meilleur controle)
3. **Cleanup systematique** des streams et object URLs
4. **Compression client-side** si possible avant upload
5. **Progress feedback** constant pour UX

---

*Derniere MAJ: 2026-02-02*
