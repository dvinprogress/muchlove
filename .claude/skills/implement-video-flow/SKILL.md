---
name: implement-video-flow
description: Implemente le flow complet d'enregistrement video (recording -> processing -> storage)
user-invocable: true
---

# Workflow Complet Video

Ce workflow orchestre l'implementation complete du flow video MuchLove.

## Task Ledger

| # | Tache | Agent | Dependances | Complexite |
|---|-------|-------|-------------|------------|
| 1 | Schema DB testimonials | supabase-expert | - | M |
| 2 | Storage buckets config | supabase-expert | - | S |
| 3 | Hook useMediaRecorder | video-expert | - | L |
| 4 | Composant VideoRecorder | - | #3 | M |
| 5 | API POST /upload-video | video-expert | #1, #2 | M |
| 6 | API POST /transcribe | video-expert | #5 | M |
| 7 | Page /t/[link]/record | - | #4 | M |
| 8 | UI feedback/progress | ux-copywriter | #7 | S |
| 9 | Security audit | security-auditor | #1-6 | M |
| 10 | Tests E2E | test-engineer | #7 | M |

**Parallelisation possible:** #1, #2, #3 peuvent etre faits en parallele.

---

## Phase 1: Database & Storage

### 1.1 Table testimonials

Utiliser `/setup-supabase-table testimonials`

```sql
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_id UUID UNIQUE NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  -- Video Files
  raw_video_url TEXT,
  processed_video_url TEXT,
  youtube_url TEXT,
  youtube_video_id TEXT,
  thumbnail_url TEXT,

  -- Transcription
  transcription TEXT,
  transcription_edited TEXT,
  whisper_words JSONB,

  -- Metadata
  duration_seconds INT,
  attempt_number INT DEFAULT 1 CHECK (attempt_number BETWEEN 1 AND 3),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),

  -- Sharing
  shared_trustpilot BOOLEAN DEFAULT FALSE,
  shared_google BOOLEAN DEFAULT FALSE,
  shared_linkedin BOOLEAN DEFAULT FALSE,
  linkedin_post_text TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Company peut voir ses testimonials
CREATE POLICY "testimonials_select_company" ON testimonials
  FOR SELECT USING (company_id = auth.uid());

-- Insertion publique (contact qui soumet)
CREATE POLICY "testimonials_insert_public" ON testimonials
  FOR INSERT WITH CHECK (true);

-- Update public (contact qui edite transcription)
CREATE POLICY "testimonials_update_public" ON testimonials
  FOR UPDATE USING (true);
```

### 1.2 Storage Buckets

```sql
-- Bucket videos (prive)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('videos', 'videos', false, 52428800);  -- 50MB limit

-- Policy: contacts peuvent upload dans leur dossier
CREATE POLICY "videos_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'videos'
  );

-- Policy: lecture avec signed URL uniquement
CREATE POLICY "videos_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');
```

---

## Phase 2: Recording Frontend

### 2.1 Hooks

Utiliser `/create-video-recorder full`

Fichiers a creer:
- `src/hooks/useMediaPermissions.ts`
- `src/hooks/useMediaRecorder.ts`

### 2.2 Composants

Fichiers a creer:
- `src/components/video/VideoPreview.tsx`
- `src/components/video/RecordingControls.tsx`
- `src/components/video/VideoRecorder.tsx`
- `src/components/video/index.ts`

### 2.3 Page Recording

Utiliser `/create-page t/[link]/record Page d'enregistrement video temoignage`

Structure:
```
src/app/t/[link]/record/
├── page.tsx
├── loading.tsx
└── _components/
    └── RecordingFlow.tsx
```

---

## Phase 3: Upload API

### 3.1 API Upload Video

Utiliser `/add-api-route upload-video POST Upload video vers Supabase Storage`

```typescript
// src/app/api/upload-video/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const video = formData.get('video') as File
    const contactId = formData.get('contactId') as string

    if (!video || !contactId) {
      return NextResponse.json({ error: 'Missing video or contactId' }, { status: 400 })
    }

    // Validate file
    if (video.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get contact info
    const { data: contact } = await supabase
      .from('contacts')
      .select('company_id')
      .eq('id', contactId)
      .single()

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Upload to storage
    const fileName = `${contact.company_id}/${contactId}/raw-${Date.now()}.webm`
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, video, {
        contentType: video.type,
        upsert: false
      })

    if (uploadError) throw uploadError

    // Create/update testimonial
    const { data: testimonial, error: dbError } = await supabase
      .from('testimonials')
      .upsert({
        contact_id: contactId,
        company_id: contact.company_id,
        raw_video_url: fileName,
        processing_status: 'pending'
      }, {
        onConflict: 'contact_id'
      })
      .select()
      .single()

    if (dbError) throw dbError

    // Update contact status
    await supabase
      .from('contacts')
      .update({ status: 'video_completed' })
      .eq('id', contactId)

    // Trigger transcription (async)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testimonialId: testimonial.id })
    }).catch(console.error)  // Fire and forget

    return NextResponse.json({
      success: true,
      testimonialId: testimonial.id
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
```

### 3.2 API Transcription

Utiliser `/add-api-route transcribe POST Transcription Whisper de la video`

```typescript
// src/app/api/transcribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { testimonialId } = await request.json()

    const supabase = await createClient()

    // Get testimonial
    const { data: testimonial } = await supabase
      .from('testimonials')
      .select('raw_video_url')
      .eq('id', testimonialId)
      .single()

    if (!testimonial?.raw_video_url) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    // Update status
    await supabase
      .from('testimonials')
      .update({ processing_status: 'processing' })
      .eq('id', testimonialId)

    // Download video from storage
    const { data: videoData } = await supabase.storage
      .from('videos')
      .download(testimonial.raw_video_url)

    if (!videoData) {
      throw new Error('Could not download video')
    }

    // Convert to File for OpenAI
    const file = new File([videoData], 'video.webm', { type: 'video/webm' })

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word']
    })

    // Update testimonial
    await supabase
      .from('testimonials')
      .update({
        transcription: transcription.text,
        whisper_words: transcription.words,
        processing_status: 'completed'
      })
      .eq('id', testimonialId)

    return NextResponse.json({
      success: true,
      transcription: transcription.text
    })

  } catch (error) {
    console.error('Transcription error:', error)

    // Update status to failed
    const { testimonialId } = await request.json().catch(() => ({}))
    if (testimonialId) {
      const supabase = await createClient()
      await supabase
        .from('testimonials')
        .update({ processing_status: 'failed' })
        .eq('id', testimonialId)
    }

    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
```

---

## Phase 4: UI/UX

### 4.1 Copy et Feedback

Consulter agent `ux-copywriter` pour:
- Messages de progression
- Instructions recording
- Ecran celebration apres upload

### 4.2 Gamification

Utiliser `/setup-gamification progress-bar` et `/setup-gamification celebration-modal`

---

## Phase 5: Security & Tests

### 5.1 Security Audit

Invoquer agent `security-auditor` pour verifier:
- [ ] Validation taille fichier
- [ ] Verification contact_id valide
- [ ] RLS sur testimonials
- [ ] Storage policies
- [ ] Pas d'injection dans filename

### 5.2 Tests E2E

Invoquer agent `test-engineer` pour:
- Test flow complet recording
- Test upload
- Test permissions camera refusees

---

## Phase 6: Verification Finale

### Checklist

- [ ] Table testimonials creee avec RLS
- [ ] Storage bucket videos configure
- [ ] Hook useMediaRecorder fonctionne
- [ ] Composant VideoRecorder fonctionne
- [ ] API upload-video fonctionne
- [ ] API transcribe fonctionne
- [ ] Page /t/[link]/record complete
- [ ] Celebration modal apres upload
- [ ] Progress tracking mis a jour
- [ ] Security audit passe
- [ ] Tests E2E passent

### Test Manuel End-to-End

1. Ouvrir `/t/[valid-link]/record`
2. Autoriser camera
3. Enregistrer 30s de video
4. Valider l'enregistrement
5. Verifier upload reussi
6. Verifier transcription generee
7. Verifier celebration modal

---

## Commit Final

```bash
git add supabase/ src/app/api/ src/app/t/ src/components/video/ src/hooks/
git commit -m "feat(video): implement complete video recording flow"
```
