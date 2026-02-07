# Migration 004: Automations de Croissance

## Vue d'ensemble

Cette migration crée le schema de base de données pour les 5 automations de croissance MuchLove:

1. **Viral Demo**: Permet aux visiteurs de tester le produit sans signup
2. **Behavioral Email Sequences**: Nurturing automatique par segment comportemental
3. **Embeddable Widget**: Widget de testimonials à intégrer sur sites clients
4. **LinkedIn Auto-Share**: Partage automatique des testimonials sur LinkedIn
5. **Smart Notifications**: Emails transactionnels intelligents

## Tables créées

### `demo_sessions`
- Sessions de demo virale avec expiration automatique (24h)
- Tracking des partages et conversions
- RLS: public peut INSERT/SELECT, service-role peut DELETE

### `email_sequences`
- Séquences d'emails comportementales par segment
- Statuts: active, paused, completed, cancelled
- Segments: frozen_starter, rejected_requester, collector_unused, free_maximizer
- RLS: users voient leurs propres séquences

### `email_events`
- Tracking de tous les emails envoyés (séquences + notifications)
- Statuts: sent, delivered, opened, clicked, bounced, complained
- RLS: users voient leurs propres events

### `widget_configs`
- Configuration du widget embeddable par company
- Génération automatique d'API key (`wgt_` + 48 chars hex)
- Personnalisation du theme (couleurs, layout, options)
- RLS: users gèrent leur propre widget

## Modifications de tables existantes

### `companies`
- `email_preferences` (JSONB): opt-in/out emails (marketing, sequences, weekly_digest)
- `last_active_at` (TIMESTAMPTZ): dernière activité pour re-engagement

### `contacts`
- `linkedin_consent` (BOOLEAN): consentement explicite pour auto-share LinkedIn
- `linkedin_consent_at` (TIMESTAMPTZ): timestamp du consentement

## Storage

- **Bucket `demo-videos`**: 50MB limit, MIME types video/mp4, video/webm, video/quicktime
- Policies: public peut upload/view, service-role peut delete

## Fonctions

### `cleanup_expired_demo_sessions()`
- Supprime les sessions demo expirées
- À appeler via Vercel Cron job quotidien
- Returns: nombre de sessions supprimées

### `auto_generate_widget_api_key()`
- Trigger sur INSERT widget_configs
- Génère automatiquement une API key si non fournie
- Format: `wgt_` + encode(gen_random_bytes(24), 'hex')

## Application

### Option 1: Via Supabase CLI (recommandé)
```bash
cd projects/muchlove
supabase db push
```

### Option 2: Via Dashboard
1. Aller sur Supabase Dashboard → SQL Editor
2. Copier le contenu de `004_automations.sql`
3. Exécuter le script

## Vérification

Après application, vérifier que:
- Les 4 nouvelles tables existent
- Les 2 colonnes ont été ajoutées à `companies` et `contacts`
- Le bucket `demo-videos` existe dans Storage
- Les RLS policies sont actives
- Les 2 fonctions sont créées

## Prochaines étapes

1. Configurer Resend/SendGrid pour l'envoi d'emails
2. Créer les API Routes pour les automations
3. Implémenter les workers/cron jobs
4. Créer l'interface UI pour gérer les automations

## Notes

- **RGPD**: Les IP sont hashées (SHA256), jamais stockées en clair
- **Sécurité**: Les API keys widget sont générées de façon cryptographiquement sécure
- **Performance**: Indexes optimisés pour les requêtes fréquentes (expires_at, status, company_id)
- **Cleanup**: Les sessions demo sont auto-supprimées après 24h via cron job
