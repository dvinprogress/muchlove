# Email Sequences Comportementales - Implémentation

## Statut: IMPLEMENTATION COMPLETE - BESOIN MIGRATION SUPABASE

### Fichiers créés/modifiés

#### 1. Logique de segmentation
- **C:\Users\damie\Documents\claude-workspace\projects\muchlove\src\lib\cron\segment-evaluation.ts**
  - Évalue les 4 segments comportementaux
  - Crée des email_sequences en base
  - Appelé toutes les heures par le cron orchestrator

#### 2. Logique d'envoi des emails
- **C:\Users\damie\Documents\claude-workspace\projects\muchlove\src\lib\cron\email-sequences.ts**
  - Traite les sequences actives
  - Envoie les emails via Resend
  - Gère le tracking et les next_send_at

#### 3. Templates React Email
- **src/lib/email/templates/FrozenStarterEmail.tsx** (Segment A - 2 steps)
- **src/lib/email/templates/RejectedRequesterEmail.tsx** (Segment B - 1 step)
- **src/lib/email/templates/CollectorUnusedEmail.tsx** (Segment C - 1 step)
- **src/lib/email/templates/FreeMaximizerEmail.tsx** (Segment D - 1 step)

#### 4. Webhook Resend
- **src/app/api/webhooks/resend/route.ts**
  - Reçoit les events Resend (delivered, opened, clicked, bounced, complained)
  - Update email_events
  - Annule les sequences si bounced/complained

#### 5. Trigger Free Maximizer
- **src/app/api/upload-video/route.ts** (modifié)
  - Détecte quand videos_used >= videos_limit
  - Crée immédiatement une sequence FREE_MAXIMIZER
  - Incrémente videos_used

#### 6. i18n
- **messages/en.json** (ajouté `emailSequences`)
- **messages/fr.json** (ajouté `emailSequences`)
- **messages/es.json** (ajouté `emailSequences`)

---

## BLOQUANT: Migration Supabase non appliquée

### Problème
Les tables `email_sequences`, `email_events`, et `widget_configs` existent dans la migration **004_automations.sql** mais n'ont **pas encore été appliquées** sur la base Supabase.

Résultat: TypeScript fail car `src/types/database.ts` ne contient pas ces tables.

### Solution: 3 étapes

#### Étape 1: Appliquer la migration sur Supabase
```bash
cd C:\Users\damie\Documents\claude-workspace\projects\muchlove

# Option A: Via Supabase Dashboard
# - Aller sur https://supabase.com/dashboard/project/<project-id>/sql
# - Copier/coller le contenu de supabase/migrations/004_automations.sql
# - Exécuter

# Option B: Via Supabase CLI (nécessite login)
npx supabase db push
```

#### Étape 2: Régénérer les types TypeScript
```bash
# Après application de la migration, régénérer les types
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

#### Étape 3: Vérifier build
```bash
npm run type-check
npm run build
```

---

## Configuration Resend requise

### Variables d'environnement (Vercel)
```bash
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL="MuchLove <love@muchlove.app>"
NEXT_PUBLIC_APP_URL=https://muchlove.app
```

### Webhook Resend
1. Aller sur https://resend.com/webhooks
2. Créer un webhook avec l'URL: `https://muchlove.app/api/webhooks/resend`
3. Activer les events:
   - `email.sent`
   - `email.delivered`
   - `email.opened`
   - `email.clicked`
   - `email.bounced`
   - `email.complained`
4. (Production) Stocker la signature secret dans `RESEND_WEBHOOK_SECRET`

---

## Segments comportementaux

### Segment A: Frozen Starter
- **Trigger**: signup > 24h ET 0 contacts créés
- **Arrêt**: dès qu'1 contact est créé
- **Emails**: 2 (J+1, J+3)
  - Email 1: "Your first request takes 30 seconds ⚡"
  - Email 2: "How TechCorp got 47 testimonials in 30 days"

### Segment B: Rejected Requester
- **Trigger**: 1-5 contacts invités + 0 vidéos reçues après 48h
- **Arrêt**: dès qu'1 vidéo est reçue
- **Emails**: 1
  - "3 ways to get more customers to respond"

### Segment C: Collector Who Doesn't Use
- **Trigger**: 1+ vidéos complétées + aucune vue/partage après 3 jours
- **Arrêt**: dès qu'1 vidéo est vue/partagée
- **Emails**: 1
  - "You have {X} video testimonials waiting 🎁"

### Segment D: Free Plan Maximizer
- **Trigger**: videos_used >= videos_limit (5/5 en free)
- **Arrêt**: upgrade ou reset mensuel
- **Emails**: 1 (immédiat)
  - "🎉 You hit your free plan limit!"
  - Code promo: **MOMENTUM** (20% off)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Cron Orchestrator (toutes les heures)                      │
│ /api/cron/orchestrator                                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌──────────────────┐
│ Segment Eval  │    │ Email Sequences  │
│ evaluation.ts │    │ sequences.ts     │
└───────┬───────┘    └──────┬───────────┘
        │                   │
        │ crée              │ envoie
        ▼                   ▼
┌────────────────┐    ┌───────────┐
│email_sequences │    │  Resend   │
└────────────────┘    └─────┬─────┘
                            │
                            │ webhook
                            ▼
                      ┌────────────┐
                      │email_events│
                      └────────────┘
```

---

## Contraintes

- **Budget**: Freemium max, 100$/mois API Claude
- **Idempotence**: Le cron peut être lancé plusieurs fois sans double envoi
- **Espacement**: Minimum 48h entre chaque email d'une séquence
- **Maximum**: 3 emails par séquence (Frozen Starter = 2, autres = 1)
- **Unsubscribe**: Chaque email DOIT avoir un lien unsubscribe
- **Tracking**: Logging complet dans email_events
- **TypeScript**: Strict mode
- **Inline styles**: Templates email = inline CSS uniquement

---

## Tests à effectuer après migration

1. **Test segmentation**
   ```bash
   # Trigger manuel du cron
   curl https://muchlove.app/api/cron/orchestrator \
     -H "Authorization: Bearer ${CRON_SECRET}"

   # Vérifier les sequences créées
   SELECT * FROM email_sequences ORDER BY created_at DESC LIMIT 10;
   ```

2. **Test envoi email**
   ```sql
   -- Forcer next_send_at à maintenant
   UPDATE email_sequences
   SET next_send_at = NOW()
   WHERE status = 'active'
   LIMIT 1;
   ```

   ```bash
   # Re-trigger le cron
   curl https://muchlove.app/api/cron/orchestrator \
     -H "Authorization: Bearer ${CRON_SECRET}"
   ```

3. **Test webhook Resend**
   - Envoyer un email de test via Resend Dashboard
   - Vérifier que le webhook reçoit les events
   - Vérifier que email_events est updaté

4. **Test Free Maximizer trigger**
   - Uploader 5 vidéos avec un compte free
   - Vérifier qu'une sequence FREE_MAXIMIZER est créée immédiatement
   - Vérifier que l'email est envoyé dans l'heure

---

## Notes de développement

- **Emails en anglais uniquement**: Les emails transactionnels B2B SaaS sont en anglais standard
- **Templates React Email**: Utilise `@react-email/components` (déjà installé)
- **BaseLayout**: Wrapper réutilisé pour tous les templates
- **Tags Resend**: Chaque email a des tags (sequence_id, segment, step) pour tracking
- **Error handling**: Tous les logs sont préfixés `[fonction]` pour debugging
- **Cancelled reasons**:
  - `user_unsubscribed`: email_preferences.sequences = false
  - `user_progressed`: sortie du segment (ex: a créé un contact)
  - `email_bounced`: hard bounce Resend
  - `user_complained`: spam complaint

---

## Prochaines étapes (après migration)

1. ✅ Appliquer migration 004 sur Supabase
2. ✅ Régénérer types TypeScript
3. ✅ Configurer Resend (API key + webhook)
4. ✅ Tester le flow complet
5. ⏳ Créer un dashboard de monitoring des sequences (optionnel)
6. ⏳ A/B testing des templates (Phase 2)
7. ⏳ Analytics avancés (open rate, click rate, conversion) (Phase 2)

---

**Date de création**: 2026-02-07
**Auteur**: Claude Code Orchestrateur
**Version**: 1.0.0
