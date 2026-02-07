# Configuration Email - MuchLove

> Documentation technique pour la configuration de l'infrastructure email Resend + Vercel Cron

## Infrastructure Deployee (2026-02-07)

### Fichiers crees
1. `src/lib/email/resend.ts` - Client Resend wrapper
2. `src/lib/email/templates/BaseLayout.tsx` - Layout email commun (React Email)
3. `src/app/api/cron/orchestrator/route.ts` - Cron orchestrateur unique
4. `src/lib/cron/demo-cleanup.ts` - Nettoyage demos expirees (logique complete)
5. `src/lib/cron/email-sequences.ts` - Sequences emails (stub Phase 2b)
6. `src/lib/cron/segment-evaluation.ts` - Evaluation segments (stub Phase 2b)
7. `src/lib/cron/weekly-digest.ts` - Digest hebdomadaire (stub Phase 2b)
8. `src/app/api/email/unsubscribe/route.ts` - API desabonnement
9. `src/app/[locale]/unsubscribe/page.tsx` - Page confirmation desabonnement
10. `vercel.json` - Configuration cron (toutes les heures)
11. `messages/{en,fr,es}.json` - Cles i18n email.unsubscribe

## Cron Orchestrateur

### Schedule Vercel
- **Frequence** : toutes les heures (`0 * * * *`)
- **Endpoint** : `/api/cron/orchestrator`
- **Auth** : Bearer token via `CRON_SECRET` env var

### Taches executees
| Tache | Frequence | Fonction | Statut |
|-------|-----------|----------|--------|
| Cleanup demos | Toutes les heures | `cleanupExpiredDemos()` | IMPLEMENTED |
| Email sequences | 9h, 12h, 15h, 18h UTC | `processEmailSequences()` | STUB (Phase 2b) |
| Segment evaluation | 10h UTC quotidien | `evaluateSegments()` | STUB (Phase 2b) |
| Weekly digest | Lundi 9h UTC | `sendWeeklyDigests()` | STUB (Phase 2b) |

### Logique cleanup demos
```typescript
// src/lib/cron/demo-cleanup.ts
// 1. Fetch demo_sessions expirees (expires_at < now)
// 2. Extraire les paths videos depuis les URLs
// 3. Supprimer les videos du storage bucket 'demo-videos'
// 4. Supprimer les sessions de la DB
// 5. Retourner { deleted: count }
```

## Resend Integration

### Client wrapper
```typescript
// src/lib/email/resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'MuchLove <love@muchlove.app>'

export async function sendEmail(params: {
  to: string
  subject: string
  react: React.ReactElement
  replyTo?: string
  tags?: { name: string; value: string }[]
})
```

### BaseLayout template
- Header : Logo "MuchLove 💛"
- Content slot : children (React nodes)
- Footer :
  - "Much love 💛"
  - Lien unsubscribe (si unsubscribeUrl fourni)
  - "© 2026 MuchLove. All rights reserved."
- Styles inline (pas de CSS externe, compatible Gmail/Outlook/Apple Mail)
- Couleurs marque : #FFBF00 (primary), #1a1a2e (text), #ffffff (bg)

### Preview text
Utilise `<Preview>` de @react-email/components pour l'aperçu inbox

## API Desabonnement

### Token format (MVP)
- Base64 simple : `{companyId}:{type}` (marketing|sequences|weekly_digest)
- Pas de HMAC pour MVP, a durcir en prod si besoin

### Flow
1. Email contient lien : `https://muchlove.app/api/email/unsubscribe?token={token}`
2. GET /api/email/unsubscribe :
   - Decode token
   - Update `companies.email_preferences[type] = false`
   - Redirect vers `/unsubscribe?success=true`
3. Page /[locale]/unsubscribe affiche confirmation i18n

### Helper generation token
```typescript
// src/app/api/email/unsubscribe/route.ts
export function generateUnsubscribeToken(
  companyId: string,
  type: 'marketing' | 'sequences' | 'weekly_digest'
): string
```

## Configuration Requise

### Variables Environnement Vercel
A ajouter dans Vercel Dashboard (Settings > Environment Variables) :

```bash
# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=MuchLove <love@muchlove.app>

# Cron Security
CRON_SECRET=<generate-random-secure-token>
```

### Generer CRON_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Domaine Resend
1. Verifier le domaine `muchlove.app` dans Resend Dashboard
2. Ajouter les DNS records fournis par Resend dans Cloudflare :
   - SPF (TXT)
   - DKIM (TXT)
   - DMARC (TXT)
3. Attendre verification (quelques heures max)

## Integration i18n

### Cles ajoutees (en, fr, es)
```json
"email": {
  "unsubscribe": {
    "title": "Unsubscribed",
    "success": "You've been successfully unsubscribed from these emails.",
    "error": "Something went wrong. Please try again.",
    "backToDashboard": "Back to dashboard",
    "resubscribe": "Changed your mind? You can manage email preferences in your dashboard settings."
  }
}
```

## Tests Manuels Requis

### 1. Test cron local
```bash
# Dans un terminal
curl -X GET http://localhost:3000/api/cron/orchestrator \
  -H "Authorization: Bearer <CRON_SECRET>"
```

### 2. Test unsubscribe
1. Generer un token :
   ```typescript
   const token = Buffer.from('COMPANY_UUID:marketing', 'utf-8').toString('base64')
   ```
2. Visiter : `http://localhost:3000/api/email/unsubscribe?token={token}`
3. Verifier redirection + mise a jour DB

### 3. Test email template
Creer un email de test avec BaseLayout et l'envoyer via Resend :
```typescript
import { BaseLayout } from '@/lib/email/templates/BaseLayout'
import { sendEmail } from '@/lib/email/resend'

await sendEmail({
  to: 'test@example.com',
  subject: 'Test MuchLove Email',
  react: (
    <BaseLayout preview="Test email" unsubscribeUrl="https://muchlove.app/unsubscribe?token=xxx">
      <h1>Hello!</h1>
      <p>This is a test email.</p>
    </BaseLayout>
  ),
})
```

## Prochaines Etapes (Phase 2b)

### Templates a creer
1. **Invitation contact** : "Hi {firstName}, {companyName} wants your feedback!"
2. **Relance video** : "Didn't finish your video? Here's your link again"
3. **Weekly digest** : Stats hebdo pour companies
4. **Notifications** : Nouveau temoignage recu, contact a partage sur LinkedIn, etc.

### Sequences a implementer
- `processEmailSequences()` :
  - Nurturing sequences (onboarding new users)
  - Relance contacts (n'a pas ouvert le lien apres 3 jours)
  - Upgrade prompts (free plan limite atteinte)
- `evaluateSegments()` :
  - Calculer engagement score
  - Identifier contacts chauds/froids
  - Tagger pour sequences ciblees
- `sendWeeklyDigests()` :
  - Recuperer stats semaine passee
  - Generer rapport personalise
  - Envoyer via Resend

## Notes Securite

### Cron protection
- CRON_SECRET obligatoire pour appeler /api/cron/orchestrator
- Vercel Cron utilise automatiquement le secret configure

### Unsubscribe token
- MVP : token base64 simple (pas de TTL)
- Production : envisager HMAC ou JWT signe avec secret
- Alternative : stocker tokens en DB avec expiration

### Email deliverability
- Toujours inclure lien unsubscribe (requis CAN-SPAM)
- Utiliser Resend tags pour tracking (`tags: [{ name: 'type', value: 'invitation' }]`)
- Monitorer bounces et complaints via Resend webhooks (Phase 2b)

## Ressources

- [Resend Docs](https://resend.com/docs)
- [React Email Docs](https://react.email/docs/introduction)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [MuchLove Brand Voice](.claude/rules/brand-voice.md)

---
*Derniere MAJ : 2026-02-07*
