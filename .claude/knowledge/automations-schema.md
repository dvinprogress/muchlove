# Schema Automations - Guide de Référence

## Vue d'ensemble

Les 5 automations de croissance MuchLove reposent sur un schema DB optimisé pour la performance et la sécurité.

## Tables

### 1. demo_sessions (Automation 1: Viral Demo)

```typescript
interface DemoSession {
  id: string
  session_id: string              // UUID ou nanoid unique
  email: string | null            // Email optionnel du visiteur
  video_url: string | null        // URL du video de demo
  transcription: string | null    // Transcription automatique
  duration_seconds: number | null
  ip_hash: string | null          // SHA256 de l'IP (RGPD-compliant)
  user_agent: string | null
  locale: string                  // en, fr, es
  shared_on: Json                 // Array des plateformes ["twitter", "linkedin"]
  converted_to_signup: boolean    // A abouti à un signup?
  created_at: string
  expires_at: string              // Auto-suppression après 24h
}
```

**Index:**
- `expires_at` (cleanup cron)
- `created_at` (analytics)
- `converted_to_signup` (funnel tracking)

**RLS:**
- Public: INSERT, SELECT
- Service role: DELETE (cleanup)

**Usage:**
```typescript
import { DemoSession, isDemoSessionExpired } from '@/types/automations'

// Créer une session
const session: DemoSessionInsert = {
  session_id: nanoid(),
  locale: 'en',
  ip_hash: await hashIP(ip),
  user_agent: req.headers['user-agent'],
}

// Vérifier expiration
if (isDemoSessionExpired(session)) {
  // Session expirée
}
```

---

### 2. email_sequences (Automation 2: Behavioral Emails)

```typescript
interface EmailSequence {
  id: string
  company_id: string
  segment: EmailSegment           // frozen_starter | rejected_requester | collector_unused | free_maximizer
  step: number                    // 1, 2, 3... (J+1, J+3, J+7)
  status: EmailSequenceStatus     // active | paused | completed | cancelled
  started_at: string
  last_sent_at: string | null
  next_send_at: string | null
  cancelled_reason: string | null
  created_at: string
  updated_at: string
}
```

**Index:**
- `(status, next_send_at)` WHERE status = 'active' (worker queries)
- `(company_id, segment)` (user queries)

**RLS:**
- Users: SELECT WHERE company_id = auth.uid()
- Service role: ALL

**Usage:**
```typescript
import { EMAIL_SEGMENTS, EMAIL_SEQUENCE_STATUSES } from '@/types/automations'

// Créer une séquence
const sequence: EmailSequenceInsert = {
  company_id: user.id,
  segment: EMAIL_SEGMENTS.FROZEN_STARTER,
  step: 1,
  status: EMAIL_SEQUENCE_STATUSES.ACTIVE,
  next_send_at: addDays(new Date(), 1).toISOString(),
}

// Worker: trouver les séquences à envoyer
const { data } = await supabase
  .from('email_sequences')
  .select('*')
  .eq('status', 'active')
  .lte('next_send_at', new Date().toISOString())
```

---

### 3. email_events (Automation 2+5: Email Tracking)

```typescript
interface EmailEvent {
  id: string
  sequence_id: string | null      // NULL si notification ponctuelle
  company_id: string | null
  email_type: string              // sequence_frozen_starter_step1, notification_testimonial_received
  resend_id: string | null        // ID Resend pour webhooks
  recipient_email: string
  status: EmailEventStatus        // sent | delivered | opened | clicked | bounced | complained
  metadata: Json                  // {cta_clicked: 'upgrade', link: 'https://...'}
  sent_at: string
}
```

**Index:**
- `(company_id, sent_at)` (analytics)
- `(resend_id)` WHERE resend_id IS NOT NULL (webhooks)
- `(status, sent_at)` (delivrabilité)

**RLS:**
- Users: SELECT WHERE company_id = auth.uid()
- Service role: ALL

**Usage:**
```typescript
import { EMAIL_EVENT_STATUSES, isEmailOpened } from '@/types/automations'

// Logger un envoi
const event: EmailEventInsert = {
  sequence_id: sequence.id,
  company_id: user.id,
  email_type: 'sequence_frozen_starter_step1',
  resend_id: resendResponse.id,
  recipient_email: user.email,
  status: EMAIL_EVENT_STATUSES.SENT,
  metadata: { template_id: 'abc123' },
}

// Webhook Resend: update status
await supabase
  .from('email_events')
  .update({ status: EMAIL_EVENT_STATUSES.OPENED })
  .eq('resend_id', webhookData.id)

// Analytics: taux d'ouverture
if (isEmailOpened(event)) {
  // Email ouvert
}
```

---

### 4. widget_configs (Automation 3: Embeddable Widget)

```typescript
interface WidgetConfig {
  id: string
  company_id: string
  enabled: boolean
  theme: WidgetTheme              // Personnalisation visuelle
  allowed_domains: string[]       // CORS whitelist
  api_key: string                 // wgt_abc123... (auto-généré)
  created_at: string
  updated_at: string
}

interface WidgetTheme {
  primaryColor: string            // #FFBF00
  backgroundColor: string         // #ffffff
  borderRadius: string            // 12px
  layout: 'carousel' | 'grid' | 'list'
  maxItems: number                // 5
  showNames: boolean              // true
  showTranscription: boolean      // true
  poweredByVisible: boolean       // true (requis plan free/starter)
}
```

**Index:**
- `api_key` (API requests)
- `enabled` WHERE enabled = true (active widgets)

**RLS:**
- Users: ALL WHERE company_id = auth.uid()

**Trigger:**
- `auto_generate_widget_api_key()` ON INSERT

**Usage:**
```typescript
import { WidgetConfigInsert } from '@/types/automations'

// Créer un widget (API key auto-générée)
const config: WidgetConfigInsert = {
  company_id: user.id,
  enabled: true,
  theme: {
    primaryColor: '#FFBF00',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    layout: 'carousel',
    maxItems: 5,
    showNames: true,
    showTranscription: true,
    poweredByVisible: user.plan === 'free',
  },
  allowed_domains: ['example.com', 'www.example.com'],
  api_key: '', // Auto-généré par trigger
}

// API publique: vérifier API key
const { data: config } = await supabase
  .from('widget_configs')
  .select('*')
  .eq('api_key', req.query.api_key)
  .eq('enabled', true)
  .single()
```

---

### 5. Modifications companies

```typescript
interface Company {
  // ... champs existants
  email_preferences: EmailPreferences
  last_active_at: string
}

interface EmailPreferences {
  marketing: boolean
  sequences: boolean
  weekly_digest: boolean
}
```

**Usage:**
```typescript
// Update email preferences
const prefs: EmailPreferences = {
  marketing: true,
  sequences: true,
  weekly_digest: false,
}

await supabase
  .from('companies')
  .update({ email_preferences: prefs as Json })
  .eq('id', user.id)

// Tracking activité (middleware)
await supabase
  .from('companies')
  .update({ last_active_at: new Date().toISOString() })
  .eq('id', user.id)
```

---

### 6. Modifications contacts

```typescript
interface Contact {
  // ... champs existants
  linkedin_consent: boolean
  linkedin_consent_at: string | null
}
```

**Usage:**
```typescript
// Obtenir consentement LinkedIn
await supabase
  .from('contacts')
  .update({
    linkedin_consent: true,
    linkedin_consent_at: new Date().toISOString(),
  })
  .eq('id', contact.id)

// Auto-share si consentement
const { data: contact } = await supabase
  .from('contacts')
  .select('linkedin_consent')
  .eq('id', contactId)
  .single()

if (contact.linkedin_consent) {
  // Partager sur LinkedIn
}
```

---

## Storage

### Bucket: demo-videos

```typescript
const { data, error } = await supabase.storage
  .from('demo-videos')
  .upload(`${sessionId}/${nanoid()}.webm`, file, {
    contentType: 'video/webm',
    upsert: false,
  })

// URL publique
const { data: { publicUrl } } = supabase.storage
  .from('demo-videos')
  .getPublicUrl(data.path)
```

**Limites:**
- 50 MB par fichier
- MIME types: video/mp4, video/webm, video/quicktime
- Auto-suppression après 24h (via cleanup_expired_demo_sessions)

---

## Fonctions

### cleanup_expired_demo_sessions()

```sql
-- À appeler via Vercel Cron job (quotidien)
SELECT cleanup_expired_demo_sessions();
-- Returns: nombre de sessions supprimées
```

**Implementation:**
```typescript
// Route: /api/cron/cleanup-demos
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc('cleanup_expired_demo_sessions')

  return NextResponse.json({ deleted: data || 0 })
}
```

### auto_generate_widget_api_key()

Trigger automatique sur INSERT widget_configs.
Format: `wgt_` + 48 caractères hex (24 bytes random).

---

## Patterns communs

### Worker Email Sequences

```typescript
// Trouver les séquences à envoyer
const { data: sequences } = await supabase
  .from('email_sequences')
  .select('*, companies(*)')
  .eq('status', 'active')
  .lte('next_send_at', new Date().toISOString())

for (const seq of sequences) {
  // Envoyer email
  const resendResponse = await resend.emails.send({
    to: seq.companies.email,
    subject: getSubjectForStep(seq.segment, seq.step),
    html: renderTemplate(seq.segment, seq.step, seq.companies),
  })

  // Logger event
  await supabase.from('email_events').insert({
    sequence_id: seq.id,
    company_id: seq.company_id,
    email_type: `sequence_${seq.segment}_step${seq.step}`,
    resend_id: resendResponse.id,
    recipient_email: seq.companies.email,
    status: 'sent',
  })

  // Update séquence
  await supabase
    .from('email_sequences')
    .update({
      step: seq.step + 1,
      last_sent_at: new Date().toISOString(),
      next_send_at: getNextSendAt(seq.step + 1),
      status: seq.step + 1 > 3 ? 'completed' : 'active',
    })
    .eq('id', seq.id)
}
```

### Analytics Dashboard

```typescript
// Taux de conversion demo → signup
const { count: totalDemos } = await supabase
  .from('demo_sessions')
  .select('*', { count: 'exact', head: true })

const { count: convertedDemos } = await supabase
  .from('demo_sessions')
  .select('*', { count: 'exact', head: true })
  .eq('converted_to_signup', true)

const conversionRate = (convertedDemos / totalDemos) * 100

// Taux d'ouverture emails
const { count: sentEmails } = await supabase
  .from('email_events')
  .select('*', { count: 'exact', head: true })
  .eq('company_id', user.id)

const { count: openedEmails } = await supabase
  .from('email_events')
  .select('*', { count: 'exact', head: true })
  .eq('company_id', user.id)
  .in('status', ['opened', 'clicked'])

const openRate = (openedEmails / sentEmails) * 100
```

---

## Sécurité

### RLS Policies

Toutes les tables ont RLS activé:
- **demo_sessions**: public read/write, service-role delete
- **email_sequences**: user read own, service-role all
- **email_events**: user read own, service-role all
- **widget_configs**: user manage own

### API Keys

Widget API keys:
- Format: `wgt_` + 48 chars hex (cryptographiquement sécure)
- Public (pas besoin de secret) mais rate-limited
- CORS whitelist via `allowed_domains`

### RGPD

- IPs hashées (SHA256), jamais stockées en clair
- Sessions demo auto-supprimées après 24h
- Unsubscribe 1-click via token
- Consentement LinkedIn explicite

---

## Performance

### Indexes optimisés

Tous les access patterns fréquents ont des index:
- Worker queries: `(status, next_send_at)`
- User queries: `(company_id, segment)`
- Analytics: `(company_id, sent_at)`
- Webhooks: `(resend_id)`
- Cleanup: `(expires_at)`

### Pagination

```typescript
// Email events avec pagination
const { data, count } = await supabase
  .from('email_events')
  .select('*', { count: 'exact' })
  .eq('company_id', user.id)
  .order('sent_at', { ascending: false })
  .range(page * pageSize, (page + 1) * pageSize - 1)
```

---

*Dernière MAJ: 2026-02-07*
