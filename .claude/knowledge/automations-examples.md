# Automations - Exemples de Code

## Automation 1: Viral Demo

### Page Demo (`app/demo/page.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { nanoid } from 'nanoid'
import { useMediaRecorder } from '@/hooks/useMediaRecorder'
import type { DemoSessionInsert } from '@/types/automations'

export default function DemoPage() {
  const [sessionId] = useState(() => nanoid())
  const { startRecording, stopRecording, status, videoUrl } = useMediaRecorder()

  async function handleComplete(transcription: string) {
    const session: DemoSessionInsert = {
      session_id: sessionId,
      video_url: videoUrl,
      transcription,
      duration_seconds: Math.round(videoBlob.size / 1000), // Approximation
      locale: navigator.language.split('-')[0],
      ip_hash: await hashIP(), // À implémenter
      user_agent: navigator.userAgent,
    }

    await fetch('/api/demo/upload', {
      method: 'POST',
      body: JSON.stringify(session),
    })
  }

  return (
    <div>
      <h1>Try MuchLove Demo 🎥</h1>
      {status === 'idle' && (
        <button onClick={startRecording}>Start Recording</button>
      )}
      {status === 'recording' && (
        <button onClick={stopRecording}>Stop Recording</button>
      )}
      {videoUrl && <ShareButtons sessionId={sessionId} />}
    </div>
  )
}
```

### API Upload Demo (`app/api/demo/upload/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database, DemoSessionInsert } from '@/types/database'

export async function POST(req: NextRequest) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const session: DemoSessionInsert = await req.json()

  // Upload vidéo au storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('demo-videos')
    .upload(`${session.session_id}/${nanoid()}.webm`, videoBlob)

  if (uploadError) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  // Créer la session
  const { data, error } = await supabase
    .from('demo_sessions')
    .insert({
      ...session,
      video_url: supabase.storage.from('demo-videos').getPublicUrl(uploadData.path).data.publicUrl,
    })
    .select()
    .single()

  return NextResponse.json({ success: true, session: data })
}
```

---

## Automation 2: Behavioral Email Sequences

### Worker Cron (`app/api/cron/email-sequences/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { EMAIL_SEQUENCE_STATUSES } from '@/types/automations'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function GET(req: NextRequest) {
  // Vérifier auth cron
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  // Trouver les séquences à envoyer
  const { data: sequences } = await supabase
    .from('email_sequences')
    .select('*, companies(*)')
    .eq('status', EMAIL_SEQUENCE_STATUSES.ACTIVE)
    .lte('next_send_at', new Date().toISOString())

  let sent = 0

  for (const seq of sequences || []) {
    try {
      // Envoyer l'email
      const { data: emailData } = await resend.emails.send({
        from: 'MuchLove <hello@muchlove.app>',
        to: seq.companies.email,
        subject: getSubjectForStep(seq.segment, seq.step),
        html: await renderTemplate(seq.segment, seq.step, seq.companies),
      })

      // Logger l'event
      await supabase.from('email_events').insert({
        sequence_id: seq.id,
        company_id: seq.company_id,
        email_type: `sequence_${seq.segment}_step${seq.step}`,
        resend_id: emailData?.id || null,
        recipient_email: seq.companies.email,
        status: 'sent',
      })

      // Update la séquence
      const nextStep = seq.step + 1
      await supabase
        .from('email_sequences')
        .update({
          step: nextStep,
          last_sent_at: new Date().toISOString(),
          next_send_at: getNextSendAt(nextStep),
          status: nextStep > 3 ? EMAIL_SEQUENCE_STATUSES.COMPLETED : EMAIL_SEQUENCE_STATUSES.ACTIVE,
        })
        .eq('id', seq.id)

      sent++
    } catch (error) {
      console.error(`Failed to send email for sequence ${seq.id}:`, error)
    }
  }

  return NextResponse.json({ sent })
}

function getNextSendAt(step: number): string | null {
  const days = { 2: 3, 3: 7 }[step]
  if (!days) return null
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}
```

### Détecter et créer une séquence

```typescript
// Détecter un frozen_starter (signup jamais utilisé)
async function detectFrozenStarters() {
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .lt('last_active_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .eq('videos_used', 0)

  for (const company of companies || []) {
    // Vérifier si une séquence n'existe pas déjà
    const { count } = await supabase
      .from('email_sequences')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)
      .eq('segment', EMAIL_SEGMENTS.FROZEN_STARTER)

    if (count === 0) {
      await supabase.from('email_sequences').insert({
        company_id: company.id,
        segment: EMAIL_SEGMENTS.FROZEN_STARTER,
        step: 1,
        status: EMAIL_SEQUENCE_STATUSES.ACTIVE,
        next_send_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // J+1
      })
    }
  }
}
```

---

## Automation 3: Embeddable Widget

### API Widget (`app/api/widget/[apiKey]/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function GET(
  req: NextRequest,
  { params }: { params: { apiKey: string } }
) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Vérifier l'API key
  const { data: config } = await supabase
    .from('widget_configs')
    .select('*, companies(*)')
    .eq('api_key', params.apiKey)
    .eq('enabled', true)
    .single()

  if (!config) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  // Vérifier le domaine (CORS)
  const origin = req.headers.get('origin')
  if (origin && !config.allowed_domains.includes(new URL(origin).hostname)) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 })
  }

  // Récupérer les testimonials complétés
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*, contacts(*)')
    .eq('company_id', config.company_id)
    .eq('processing_status', 'completed')
    .order('created_at', { ascending: false })
    .limit((config.theme as any).maxItems || 5)

  return NextResponse.json({
    testimonials,
    theme: config.theme,
    company: {
      name: config.companies.name,
      logo_url: config.companies.logo_url,
    },
  })
}
```

### Script Embed (`public/widget.js`)

```javascript
(function() {
  // Configuration
  const API_KEY = document.currentScript.getAttribute('data-api-key')
  const CONTAINER_ID = document.currentScript.getAttribute('data-container') || 'muchlove-widget'

  // Fetch testimonials
  fetch(`https://muchlove.app/api/widget/${API_KEY}`, {
    headers: { 'Origin': window.location.origin }
  })
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById(CONTAINER_ID)
      if (!container) return

      // Render widget
      container.innerHTML = renderWidget(data)

      // Apply theme
      applyTheme(container, data.theme)
    })

  function renderWidget(data) {
    const { testimonials, theme, company } = data

    if (theme.layout === 'carousel') {
      return `
        <div class="muchlove-carousel">
          ${testimonials.map(t => `
            <div class="muchlove-item">
              <video src="${t.processed_video_url}" controls></video>
              ${theme.showNames ? `<p>${t.contacts.first_name} from ${t.contacts.company_name}</p>` : ''}
              ${theme.showTranscription ? `<p>${t.transcription}</p>` : ''}
            </div>
          `).join('')}
          ${theme.poweredByVisible ? `<a href="https://muchlove.app">Powered by MuchLove 💛</a>` : ''}
        </div>
      `
    }

    // Grid layout...
  }

  function applyTheme(container, theme) {
    container.style.setProperty('--primary-color', theme.primaryColor)
    container.style.setProperty('--background-color', theme.backgroundColor)
    container.style.setProperty('--border-radius', theme.borderRadius)
  }
})()
```

### Usage HTML

```html
<!-- Client embeds this on their website -->
<div id="muchlove-widget"></div>
<script
  src="https://muchlove.app/widget.js"
  data-api-key="wgt_abc123..."
  data-container="muchlove-widget"
></script>
```

---

## Automation 4: LinkedIn Auto-Share

### OAuth Flow (`app/api/linkedin/auth/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const contactId = searchParams.get('state') // State = contactId

  if (!code || !contactId) {
    return NextResponse.redirect('/error?message=invalid_oauth')
  }

  // Exchange code for access token
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/linkedin/auth`,
    }),
  })

  const { access_token } = await tokenResponse.json()

  // Stocker le token (à sécuriser!)
  const supabase = getSupabaseAdmin()
  await supabase
    .from('contacts')
    .update({
      linkedin_consent: true,
      linkedin_consent_at: new Date().toISOString(),
      // linkedin_access_token: encryptToken(access_token), // À implémenter
    })
    .eq('id', contactId)

  return NextResponse.redirect('/success?message=linkedin_connected')
}
```

### Auto-Share (`lib/linkedin/auto-share.ts`)

```typescript
import type { Testimonial, Contact } from '@/types/database'

export async function autoShareToLinkedIn(
  testimonial: Testimonial,
  contact: Contact
) {
  // Vérifier le consentement
  if (!contact.linkedin_consent) {
    throw new Error('No LinkedIn consent')
  }

  // Récupérer le token (à décrypter)
  const accessToken = decryptToken(contact.linkedin_access_token)

  // Créer le post LinkedIn
  const postData = {
    author: `urn:li:person:${contact.linkedin_person_id}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: testimonial.linkedin_post_text || generateDefaultPost(testimonial),
        },
        shareMediaCategory: 'VIDEO',
        media: [
          {
            status: 'READY',
            media: testimonial.youtube_url || testimonial.processed_video_url,
          },
        ],
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  })

  if (!response.ok) {
    throw new Error('LinkedIn share failed')
  }

  // Update testimonial
  await supabase
    .from('testimonials')
    .update({ shared_linkedin: true })
    .eq('id', testimonial.id)

  return response.json()
}
```

---

## Automation 5: Smart Notifications

### Trigger Testimonial Received (`lib/notifications/testimonial-received.ts`)

```typescript
import { Resend } from 'resend'
import type { Testimonial, Company } from '@/types/database'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendTestimonialReceivedEmail(
  testimonial: Testimonial,
  company: Company
) {
  // Vérifier les préférences
  const prefs = company.email_preferences as EmailPreferences
  if (!prefs.marketing) return

  const { data } = await resend.emails.send({
    from: 'MuchLove <hello@muchlove.app>',
    to: company.email,
    subject: `🎉 You just received a new testimonial!`,
    html: `
      <h1>Great news, ${company.name}!</h1>
      <p>You just received a new video testimonial from ${testimonial.contact.first_name}.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/testimonials/${testimonial.id}">
        View testimonial →
      </a>
      <hr />
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/email/unsubscribe?token=${generateUnsubscribeToken(company.id, 'marketing')}">
        Unsubscribe
      </a>
    `,
  })

  // Logger l'event
  await supabase.from('email_events').insert({
    company_id: company.id,
    email_type: 'notification_testimonial_received',
    resend_id: data?.id || null,
    recipient_email: company.email,
    status: 'sent',
  })
}
```

### Webhook Resend (`app/api/webhooks/resend/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const webhook = await req.json()

  const supabase = getSupabaseAdmin()

  // Mapper l'event Resend vers notre status
  const statusMap = {
    'email.sent': 'sent',
    'email.delivered': 'delivered',
    'email.opened': 'opened',
    'email.clicked': 'clicked',
    'email.bounced': 'bounced',
    'email.complained': 'complained',
  }

  const status = statusMap[webhook.type as keyof typeof statusMap]
  if (!status) return NextResponse.json({ ok: true })

  // Update l'event
  await supabase
    .from('email_events')
    .update({ status })
    .eq('resend_id', webhook.data.email_id)

  return NextResponse.json({ ok: true })
}
```

---

## Helpers Communs

### Hash IP (RGPD-compliant)

```typescript
import { createHash } from 'crypto'

export function hashIP(ip: string): string {
  return createHash('sha256')
    .update(ip + process.env.IP_SALT!)
    .digest('hex')
}
```

### Generate Unsubscribe Token

```typescript
export function generateUnsubscribeToken(
  companyId: string,
  type: 'marketing' | 'sequences' | 'weekly_digest'
): string {
  const payload = `${companyId}:${type}`
  return Buffer.from(payload, 'utf-8').toString('base64')
}
```

### Email Templates

```typescript
// lib/email/templates.ts
export function renderTemplate(
  segment: EmailSegment,
  step: number,
  company: Company
): string {
  const templates = {
    frozen_starter: {
      1: `
        <h1>Hey ${company.name} 👋</h1>
        <p>We noticed you signed up but haven't recorded your first video yet.</p>
        <p>It only takes 3 minutes! Let us show you how:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Get started →</a>
      `,
      2: `
        <h1>Quick question, ${company.name}...</h1>
        <p>Is something blocking you from getting started?</p>
        <p>Reply to this email and we'll help you out 💛</p>
      `,
    },
    // ... autres segments
  }

  return templates[segment]?.[step] || ''
}
```

---

*Dernière MAJ: 2026-02-07*
