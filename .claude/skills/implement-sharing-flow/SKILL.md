---
name: implement-sharing-flow
description: Implemente le flow de partage multi-platform (Trustpilot, Google Reviews, LinkedIn)
user-invocable: true
---

# Workflow Partage Multi-Platform

Ce workflow orchestre l'implementation du flow de partage gamifie MuchLove.

## Task Ledger

| # | Tache | Agent | Dependances | Complexite |
|---|-------|-------|-------------|------------|
| 1 | Composant ShareStep | ux-copywriter | - | M |
| 2 | Deep links Trustpilot/Google | - | - | S |
| 3 | AI LinkedIn post generation | - | - | M |
| 4 | YouTube upload API | video-expert | - | L |
| 5 | Page /t/[link]/share/trustpilot | - | #1, #2 | S |
| 6 | Page /t/[link]/share/google | - | #1, #2 | S |
| 7 | Page /t/[link]/share/linkedin | - | #1, #3, #4 | M |
| 8 | Page /t/[link]/complete | ux-copywriter | #5-7 | S |
| 9 | Tracking partage (DB updates) | supabase-expert | #5-7 | S |
| 10 | Email notifications | - | #9 | M |

---

## Phase 1: Composants Partage

### 1.1 Composant ShareStep

Fichier: `src/components/share/ShareStep.tsx`

```typescript
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, ExternalLink, Check } from 'lucide-react'
import { ProgressBar, MUCHLOVE_PROGRESS_STEPS } from '@/components/gamification'

interface ShareStepProps {
  platform: 'trustpilot' | 'google' | 'linkedin'
  progress: number
  stepNumber: number
  totalSteps: number
  textToCopy: string
  shareUrl: string
  onComplete: () => void
  onSkip?: () => void
}

const PLATFORM_CONFIG = {
  trustpilot: {
    name: 'Trustpilot',
    icon: '⭐',
    color: 'bg-green-500',
    instructions: "Copy your testimonial text and paste it on Trustpilot"
  },
  google: {
    name: 'Google Reviews',
    icon: '🔍',
    color: 'bg-blue-500',
    instructions: "Share your experience on Google Reviews"
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-700',
    instructions: "Share your story with your professional network"
  }
}

export function ShareStep({
  platform,
  progress,
  stepNumber,
  totalSteps,
  textToCopy,
  shareUrl,
  onComplete,
  onSkip
}: ShareStepProps) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const config = PLATFORM_CONFIG[platform]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    window.open(shareUrl, '_blank')
    setShared(true)
  }

  const handleConfirm = () => {
    onComplete()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto p-6"
    >
      {/* Progress */}
      <div className="mb-8">
        <ProgressBar value={progress} steps={MUCHLOVE_PROGRESS_STEPS} />
        <p className="text-center text-sm text-gray-500 mt-2">
          Step {stepNumber} of {totalSteps}
        </p>
      </div>

      {/* Platform header */}
      <div className="text-center mb-6">
        <span className="text-4xl">{config.icon}</span>
        <h2 className="text-2xl font-bold mt-2">Share on {config.name}</h2>
        <p className="text-gray-600 mt-1">{config.instructions}</p>
      </div>

      {/* Text to copy */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <p className="text-gray-700 text-sm whitespace-pre-wrap">{textToCopy}</p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          {copied ? 'Copied!' : 'Copy text'}
        </button>

        <button
          onClick={handleShare}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl ${config.color} hover:opacity-90 transition-opacity`}
        >
          <ExternalLink className="w-5 h-5" />
          Open {config.name}
        </button>

        {shared && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleConfirm}
            className="w-full px-4 py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
          >
            I've shared it! ✓
          </motion.button>
        )}

        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full text-gray-400 text-sm hover:text-gray-600"
          >
            Skip this step
          </button>
        )}
      </div>
    </motion.div>
  )
}
```

### 1.2 Export

Fichier: `src/components/share/index.ts`

```typescript
export { ShareStep } from './ShareStep'
```

---

## Phase 2: Deep Links

### 2.1 Utilitaire Share Links

Fichier: `src/lib/share-links.ts`

```typescript
/**
 * Generate Trustpilot review link
 */
export function getTrustpilotLink(companyDomain: string): string {
  return `https://www.trustpilot.com/evaluate/${companyDomain}`
}

/**
 * Generate Google Reviews link
 * Requires Google Place ID from company settings
 */
export function getGoogleReviewLink(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`
}

/**
 * Generate LinkedIn share link
 */
export function getLinkedInShareLink(url: string, text?: string): string {
  const params = new URLSearchParams({
    url,
    ...(text && { summary: text })
  })
  return `https://www.linkedin.com/sharing/share-offsite/?${params}`
}

/**
 * Generate all share links for a testimonial
 */
export function generateShareLinks(
  company: { trustpilot_url?: string; google_place_id?: string },
  youtubeUrl?: string
) {
  return {
    trustpilot: company.trustpilot_url
      ? getTrustpilotLink(new URL(company.trustpilot_url).hostname)
      : null,
    google: company.google_place_id
      ? getGoogleReviewLink(company.google_place_id)
      : null,
    linkedin: youtubeUrl
      ? getLinkedInShareLink(youtubeUrl)
      : null
  }
}
```

---

## Phase 3: AI LinkedIn Post

### 3.1 API Generate LinkedIn Post

Fichier: `src/app/api/generate-linkedin-post/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { testimonialId } = await request.json()

    const supabase = await createClient()

    // Get testimonial with contact and company info
    const { data: testimonial } = await supabase
      .from('testimonials')
      .select(`
        transcription,
        youtube_url,
        contacts (first_name, company_name),
        companies (name)
      `)
      .eq('id', testimonialId)
      .single()

    if (!testimonial?.transcription) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    const contact = testimonial.contacts as any
    const company = testimonial.companies as any

    const prompt = `You're a LinkedIn communication expert.

Context:
- ${contact.first_name} from ${contact.company_name} worked with ${company.name}
- Video testimonial transcription: "${testimonial.transcription}"

Generate a professional yet warm LinkedIn post (150-200 words) that:
1. Opens with an engaging hook
2. Shares the positive experience personally
3. Highlights 1-2 key points from the testimonial
4. Ends with a warm recommendation
5. Uses 2-3 relevant emojis (not too many)
6. Tone: Professional but human, not corporate

Include at the end: "Watch my full testimonial: ${testimonial.youtube_url || '[video link]'}"

Format: Direct text, ready to copy-paste. No title, no markdown.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 400
    })

    const linkedinPost = completion.choices[0].message.content?.trim()

    // Save to testimonial
    await supabase
      .from('testimonials')
      .update({ linkedin_post_text: linkedinPost })
      .eq('id', testimonialId)

    return NextResponse.json({
      success: true,
      post: linkedinPost
    })

  } catch (error) {
    console.error('LinkedIn post generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
```

---

## Phase 4: Share Pages

### 4.1 Page Trustpilot

Fichier: `src/app/t/[link]/share/trustpilot/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ShareStep } from '@/components/share'
import { getTrustpilotLink } from '@/lib/share-links'

export default async function TrustpilotSharePage({
  params
}: {
  params: { link: string }
}) {
  const supabase = await createClient()

  const { data: contact } = await supabase
    .from('contacts')
    .select(`
      id,
      testimonials (transcription),
      companies (name, trustpilot_url)
    `)
    .eq('unique_link', params.link)
    .single()

  if (!contact) redirect('/404')

  const testimonial = contact.testimonials as any
  const company = contact.companies as any

  if (!company.trustpilot_url) {
    redirect(`/t/${params.link}/share/google`)
  }

  return (
    <ShareStepClient
      contactId={contact.id}
      link={params.link}
      transcription={testimonial?.transcription || ''}
      shareUrl={getTrustpilotLink(company.trustpilot_url)}
    />
  )
}
```

### 4.2 Page Complete (Ambassador)

Fichier: `src/app/t/[link]/complete/page.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ambassadorCelebration } from '@/lib/confetti'

export default function CompletePage() {
  useEffect(() => {
    ambassadorCelebration()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="max-w-md text-center">
        <motion.div
          className="text-6xl mb-6"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          🏆
        </motion.div>

        <h1 className="text-3xl font-bold mb-4">
          You're officially an ambassador!
        </h1>

        <p className="text-gray-600 mb-8">
          You just helped in the biggest way possible. Your video is now live
          everywhere. That's the power of spreading love 💛
        </p>

        <div className="border-t pt-8">
          <p className="text-sm text-gray-500 mb-4">
            Want to start your own chain of smiles?
          </p>
          <a
            href="https://muchlove.io"
            className="inline-block px-6 py-3 bg-yellow-500 text-white rounded-full font-medium hover:bg-yellow-600"
          >
            Discover MuchLove →
          </a>
        </div>
      </div>
    </motion.div>
  )
}
```

---

## Phase 5: Tracking

### 5.1 API Track Share

Fichier: `src/app/api/track-share/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { contactId, platform } = await request.json()

    const supabase = await createClient()

    // Update testimonial share status
    const updateField = {
      trustpilot: 'shared_trustpilot',
      google: 'shared_google',
      linkedin: 'shared_linkedin'
    }[platform]

    if (!updateField) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    await supabase
      .from('testimonials')
      .update({ [updateField]: true })
      .eq('contact_id', contactId)

    // Update contact status
    const statusMap = {
      trustpilot: 'shared_1',
      google: 'shared_2',
      linkedin: 'shared_3'
    }

    await supabase
      .from('contacts')
      .update({
        status: statusMap[platform as keyof typeof statusMap],
        ...(platform === 'linkedin' && { completed_at: new Date().toISOString() })
      })
      .eq('id', contactId)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Track share error:', error)
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 })
  }
}
```

---

## Phase 6: Verification

### Checklist

- [ ] Composant ShareStep cree
- [ ] Deep links fonctionnent
- [ ] AI LinkedIn post generation OK
- [ ] Page Trustpilot
- [ ] Page Google
- [ ] Page LinkedIn
- [ ] Page Complete avec confetti
- [ ] Tracking DB fonctionne
- [ ] Status contact mis a jour

### Test Manuel

1. Completer un video recording
2. Naviguer vers /share/trustpilot
3. Copier texte, ouvrir Trustpilot
4. Confirmer partage
5. Verifier celebration + navigation Google
6. Repeter pour Google et LinkedIn
7. Verifier page Complete avec confetti intense
8. Verifier statut contact = shared_3

---

## Commit

```bash
git add src/components/share/ src/lib/share-links.ts src/app/api/generate-linkedin-post/ src/app/api/track-share/ src/app/t/*/share/
git commit -m "feat(sharing): implement multi-platform sharing flow"
```
