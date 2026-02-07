# Checklist Application Migration 004: Automations

## Phase 1: Application Migration SQL ✅ READY

### 1.1 Appliquer la migration
- [ ] Via CLI: `supabase db push`
- [ ] OU via Dashboard: Copier/coller `004_automations.sql` dans SQL Editor

### 1.2 Vérifier les tables
```sql
-- Vérifier que les 4 tables existent
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('demo_sessions', 'email_sequences', 'email_events', 'widget_configs');
```

### 1.3 Vérifier les colonnes ajoutées
```sql
-- Companies
SELECT column_name FROM information_schema.columns
WHERE table_name = 'companies'
AND column_name IN ('email_preferences', 'last_active_at');

-- Contacts
SELECT column_name FROM information_schema.columns
WHERE table_name = 'contacts'
AND column_name IN ('linkedin_consent', 'linkedin_consent_at');
```

### 1.4 Vérifier les fonctions
```sql
-- Lister les fonctions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('cleanup_expired_demo_sessions', 'auto_generate_widget_api_key');
```

### 1.5 Vérifier le storage
- [ ] Aller dans Storage → Buckets
- [ ] Vérifier que `demo-videos` existe
- [ ] Vérifier les policies (3 policies attendues)

## Phase 2: Configuration Services Externes

### 2.1 Resend/SendGrid
- [ ] Créer un compte Resend (https://resend.com)
- [ ] Obtenir l'API key
- [ ] Ajouter `RESEND_API_KEY` dans Vercel env vars
- [ ] Configurer le domaine d'envoi (hello@muchlove.app)
- [ ] Configurer le webhook endpoint: `https://muchlove.app/api/webhooks/resend`
- [ ] Tester l'envoi d'un email

### 2.2 Vercel Cron Jobs
- [ ] Créer `vercel.json` à la racine du projet:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-demos",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/email-sequences",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/detect-segments",
      "schedule": "0 8 * * *"
    }
  ]
}
```
- [ ] Générer `CRON_SECRET` et l'ajouter dans Vercel env vars
- [ ] Déployer sur Vercel
- [ ] Vérifier dans Vercel Dashboard → Cron Jobs que les jobs sont listés

### 2.3 LinkedIn OAuth (optionnel pour MVP)
- [ ] Créer une app LinkedIn (https://www.linkedin.com/developers)
- [ ] Obtenir Client ID et Client Secret
- [ ] Ajouter `LINKEDIN_CLIENT_ID` et `LINKEDIN_CLIENT_SECRET` dans Vercel env vars
- [ ] Configurer redirect URL: `https://muchlove.app/api/linkedin/auth`

## Phase 3: Implémenter les API Routes

### 3.1 Automation 1: Viral Demo
- [ ] Créer `app/demo/page.tsx` (page publique)
- [ ] Créer `app/api/demo/upload/route.ts`
- [ ] Créer `app/api/demo/[sessionId]/route.ts`
- [ ] Créer `app/api/cron/cleanup-demos/route.ts`
- [ ] Tester le workflow complet

### 3.2 Automation 2: Email Sequences
- [ ] Créer `app/api/cron/email-sequences/route.ts`
- [ ] Créer `app/api/cron/detect-segments/route.ts`
- [ ] Créer templates email dans `lib/email/templates.ts`
- [ ] Créer `app/api/webhooks/resend/route.ts`
- [ ] Tester l'envoi d'une séquence

### 3.3 Automation 3: Widget
- [ ] Créer `app/api/widget/[apiKey]/route.ts`
- [ ] Créer `public/widget.js` (script embed)
- [ ] Créer `app/dashboard/widget/page.tsx` (config UI)
- [ ] Tester l'embed sur un site externe

### 3.4 Automation 4: LinkedIn Auto-Share
- [ ] Créer `app/api/linkedin/auth/route.ts`
- [ ] Créer `lib/linkedin/auto-share.ts`
- [ ] Ajouter checkbox consentement dans workflow testimonial
- [ ] Tester le partage LinkedIn

### 3.5 Automation 5: Smart Notifications
- [ ] Créer `lib/notifications/testimonial-received.ts`
- [ ] Créer `lib/notifications/testimonial-shared.ts`
- [ ] Créer `lib/notifications/weekly-digest.ts`
- [ ] Intégrer les triggers dans les actions existantes

## Phase 4: Interface Utilisateur

### 4.1 Page Demo Publique
- [ ] Design page `/demo` avec brand voice MuchLove
- [ ] Interface enregistrement vidéo
- [ ] Boutons de partage social
- [ ] Call-to-action signup

### 4.2 Dashboard Automations
- [ ] Créer `app/dashboard/automations/page.tsx`
- [ ] Section Email Sequences (liste, statuts, pause/resume)
- [ ] Section Widget (config, preview, code embed)
- [ ] Section LinkedIn (connect, auto-share toggle)
- [ ] Section Email Preferences

### 4.3 Page Unsubscribe
- [ ] Créer `app/[locale]/unsubscribe/page.tsx`
- [ ] Formulaire de gestion préférences
- [ ] Confirmation unsubscribe
- [ ] i18n EN/FR/ES

## Phase 5: Tests

### 5.1 Tests Unitaires
- [ ] Tests helpers `src/types/automations.ts`
- [ ] Tests fonctions `lib/email/templates.ts`
- [ ] Tests RPC functions Supabase

### 5.2 Tests E2E
- [ ] Workflow demo complet (record → upload → share)
- [ ] Workflow widget (config → embed → display)
- [ ] Workflow email sequence (trigger → send → track)

### 5.3 Tests Manuels
- [ ] Tester cleanup cron (vérifier suppression après 24h)
- [ ] Tester email sequence cron (vérifier envoi horaire)
- [ ] Tester webhook Resend (vérifier tracking opened/clicked)
- [ ] Tester widget sur différents domaines
- [ ] Tester unsubscribe 1-click

## Phase 6: Documentation

### 6.1 Documentation Utilisateur
- [ ] Guide "Comment créer une démo virale"
- [ ] Guide "Comment intégrer le widget"
- [ ] Guide "Comment gérer les emails"
- [ ] FAQ automations

### 6.2 Documentation Technique
- [ ] ✅ Schema reference (`automations-schema.md`)
- [ ] ✅ Code examples (`automations-examples.md`)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Widget integration guide

## Phase 7: Monitoring & Analytics

### 7.1 Logging
- [ ] Logger tous les envois email (email_events)
- [ ] Logger toutes les erreurs cron jobs
- [ ] Logger les tentatives d'abus (rate limiting)

### 7.2 Dashboard Analytics
- [ ] Taux de conversion demo → signup
- [ ] Taux d'ouverture/clic emails par segment
- [ ] Performances widget (impressions, clics)
- [ ] ROI automations (testimonials générés)

### 7.3 Alertes
- [ ] Alerte si cron job échoue
- [ ] Alerte si taux bounce email > 5%
- [ ] Alerte si widget API down

## Phase 8: Optimisations

### 8.1 Performance
- [ ] Caching widget API (60s TTL)
- [ ] Lazy loading vidéos widget
- [ ] Compression vidéos demo
- [ ] CDN pour `widget.js`

### 8.2 Sécurité
- [ ] Rate limiting API widget (100 req/min par IP)
- [ ] CAPTCHA sur page demo (anti-abuse)
- [ ] Rotation API keys widget
- [ ] Audit logs accès admin

### 8.3 SEO
- [ ] Métadonnées page `/demo`
- [ ] Schema.org markup pour testimonials widget
- [ ] Sitemap updates

## Phase 9: Déploiement Production

### 9.1 Pre-deploy
- [ ] ✅ TypeScript check passe
- [ ] ✅ Build réussit
- [ ] Tests E2E passent
- [ ] Review code complet

### 9.2 Deploy
- [ ] Merge PR vers `main`
- [ ] Vercel auto-deploy déclenché
- [ ] Migration SQL appliquée sur production
- [ ] Env vars configurées

### 9.3 Post-deploy
- [ ] Smoke tests sur production
- [ ] Monitoring actif pendant 24h
- [ ] Backup DB avant migration
- [ ] Rollback plan prêt

## Phase 10: Communication

### 10.1 Annonce Interne
- [ ] Documentation partagée avec l'équipe
- [ ] Formation sur les nouvelles features
- [ ] Procédures support client

### 10.2 Annonce Externe
- [ ] Blog post "5 New Growth Automations"
- [ ] Email aux utilisateurs existants
- [ ] Social media announcement
- [ ] Update landing page

---

## Statut Actuel

| Phase | Statut | Date |
|-------|--------|------|
| 1. Migration SQL | ✅ READY | 2026-02-07 |
| 2. Config Services | ⏸️ TODO | - |
| 3. API Routes | ⏸️ TODO | - |
| 4. UI | ⏸️ TODO | - |
| 5. Tests | ⏸️ TODO | - |
| 6. Documentation | 🟡 PARTIAL | 2026-02-07 |
| 7. Monitoring | ⏸️ TODO | - |
| 8. Optimisations | ⏸️ TODO | - |
| 9. Deploy Prod | ⏸️ TODO | - |
| 10. Communication | ⏸️ TODO | - |

---

## Fichiers de Référence

- **Migration SQL**: `supabase/migrations/004_automations.sql`
- **Types TypeScript**: `src/types/automations.ts`
- **Schema Reference**: `.claude/knowledge/automations-schema.md`
- **Code Examples**: `.claude/knowledge/automations-examples.md`
- **README Migration**: `supabase/migrations/004_automations_README.md`
- **Synthèse**: `AUTOMATIONS_MIGRATION.md`

---

**Date**: 2026-02-07
**Version**: 0.1.0
**Responsable**: dvinprogress
