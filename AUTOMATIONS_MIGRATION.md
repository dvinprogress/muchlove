# Migration 004: Automations de Croissance - Synthèse

## Résumé

Migration SQL et types TypeScript créés pour les 5 automations de croissance MuchLove.

## Fichiers créés

### 1. Migration SQL
- **Fichier**: `supabase/migrations/004_automations.sql` (243 lignes)
- **Contenu**:
  - 4 nouvelles tables (demo_sessions, email_sequences, email_events, widget_configs)
  - Modifications de 2 tables existantes (companies, contacts)
  - 1 nouveau storage bucket (demo-videos)
  - 2 fonctions (cleanup_expired_demo_sessions, auto_generate_widget_api_key)
  - RLS policies pour toutes les tables
  - Triggers update_updated_at
  - Indexes optimisés pour performance

### 2. Types TypeScript
- **Fichier**: `src/types/database.ts` (579 lignes)
- **Modifications**:
  - Ajout de 4 nouvelles tables dans `Database.public.Tables`
  - Ajout de 3 nouveaux enums (email_segment, email_event_status, email_sequence_status)
  - Modification des types `companies.Row` et `contacts.Row`
  - Helper types pour toutes les nouvelles tables

- **Fichier**: `src/types/automations.ts` (171 lignes)
- **Contenu**:
  - Re-exports des types database pour ergonomie
  - Interfaces helper (WidgetTheme, EmailPreferences, LinkedInConsent)
  - Constants (EMAIL_SEGMENTS, EMAIL_EVENT_STATUSES, EMAIL_SEQUENCE_STATUSES)
  - Fonctions utilitaires (isDemoSessionExpired, isEmailSequenceActive, etc.)

### 3. Documentation
- **Fichier**: `supabase/migrations/004_automations_README.md`
- **Contenu**: Guide d'application de la migration avec vérifications

- **Fichier**: `.claude/knowledge/automations-schema.md`
- **Contenu**: Guide de référence complet avec exemples de code

## Validation

### TypeScript
```bash
npm run type-check
```
**Résultat**: ✅ Pas d'erreurs TypeScript

### Build
```bash
npm run build
```
**Résultat**: ✅ Build réussi, 39 routes générées

## Prochaines étapes

### 1. Appliquer la migration sur Supabase

**Option A - CLI (recommandé)**:
```bash
cd projects/muchlove
supabase db push
```

**Option B - Dashboard**:
1. Aller sur Supabase Dashboard → SQL Editor
2. Copier le contenu de `004_automations.sql`
3. Exécuter le script

### 2. Vérifier l'application

Après application, vérifier que:
- [ ] Les 4 nouvelles tables existent (`demo_sessions`, `email_sequences`, `email_events`, `widget_configs`)
- [ ] Les colonnes ont été ajoutées à `companies` (`email_preferences`, `last_active_at`)
- [ ] Les colonnes ont été ajoutées à `contacts` (`linkedin_consent`, `linkedin_consent_at`)
- [ ] Le bucket `demo-videos` existe dans Storage
- [ ] Les RLS policies sont actives sur toutes les tables
- [ ] Les 2 fonctions sont créées et exécutables

### 3. Configurer les services externes

**Resend/SendGrid**:
- Créer un compte et obtenir l'API key
- Ajouter `RESEND_API_KEY` dans Vercel env vars
- Configurer les webhooks pour le tracking (opened, clicked, bounced)

**Vercel Cron Jobs**:
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-demos",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/email-sequences",
      "schedule": "0 * * * *"
    }
  ]
}
```

### 4. Implémenter les automations

**Automation 1: Viral Demo**
- [ ] Page `/demo` avec enregistrement vidéo
- [ ] API `/api/demo/upload` pour upload vidéo
- [ ] API `/api/demo/[sessionId]` pour récupérer session
- [ ] Tracking des partages sociaux

**Automation 2: Behavioral Email Sequences**
- [ ] Worker `/api/cron/email-sequences` (horaire)
- [ ] Templates email par segment (frozen_starter, rejected_requester, etc.)
- [ ] API `/api/webhooks/resend` pour tracking
- [ ] UI dashboard pour voir les séquences actives

**Automation 3: Embeddable Widget**
- [ ] API publique `/api/widget/[apiKey]` pour fetch testimonials
- [ ] Script embed `widget.js` (CDN)
- [ ] UI dashboard pour configurer le widget
- [ ] Preview du widget en temps réel

**Automation 4: LinkedIn Auto-Share**
- [ ] OAuth LinkedIn flow
- [ ] API `/api/linkedin/share` pour auto-post
- [ ] Checkbox consentement dans workflow testimonial
- [ ] UI pour gérer les connexions LinkedIn

**Automation 5: Smart Notifications**
- [ ] Emails transactionnels (testimonial received, shared, etc.)
- [ ] Page `/unsubscribe` avec gestion préférences
- [ ] Templates email multilingues (EN/FR/ES)

### 5. Tests

- [ ] Tests unitaires pour les helpers (`src/types/automations.ts`)
- [ ] Tests e2e pour le workflow demo
- [ ] Tests e2e pour le workflow widget
- [ ] Tests API pour les cron jobs

## Détails techniques

### Tables créées

| Table | Rows | Columns | RLS | Indexes |
|-------|------|---------|-----|---------|
| demo_sessions | - | 13 | ✅ Public read/write | 3 |
| email_sequences | - | 11 | ✅ User-scoped | 2 |
| email_events | - | 9 | ✅ User-scoped | 3 |
| widget_configs | - | 8 | ✅ User-scoped | 2 |

### Storage

| Bucket | Public | Size Limit | MIME Types | Policies |
|--------|--------|------------|------------|----------|
| demo-videos | No | 50 MB | video/mp4, video/webm, video/quicktime | 3 |

### Fonctions

| Fonction | Type | Usage |
|----------|------|-------|
| cleanup_expired_demo_sessions | RPC | Cron job quotidien |
| auto_generate_widget_api_key | Trigger | INSERT widget_configs |

### Enums

| Enum | Values | Usage |
|------|--------|-------|
| email_segment | frozen_starter, rejected_requester, collector_unused, free_maximizer | Segmentation comportementale |
| email_event_status | sent, delivered, opened, clicked, bounced, complained | Tracking delivrabilité |
| email_sequence_status | active, paused, completed, cancelled | Statut séquence |

## Notes de sécurité

- **RGPD**: IPs hashées (SHA256), jamais stockées en clair
- **API Keys**: Format `wgt_` + 48 chars hex, cryptographiquement sécures
- **RLS**: Toutes les tables ont RLS activé avec policies appropriées
- **Unsubscribe**: 1-click via token, conformité CAN-SPAM Act
- **Consentement**: LinkedIn consent explicite avant auto-share

## Performance

- **Indexes**: Tous les access patterns fréquents sont indexés
- **Cleanup**: Sessions demo auto-supprimées après 24h
- **Pagination**: Toutes les requêtes user-facing utilisent range()
- **Caching**: Widget API peut être cachée (60s TTL)

## Support

Pour toute question sur cette migration:
1. Lire `supabase/migrations/004_automations_README.md`
2. Consulter `.claude/knowledge/automations-schema.md`
3. Vérifier les types dans `src/types/automations.ts`

---

**Date**: 2026-02-07
**Version**: 0.1.0
**Status**: ✅ Ready to apply
