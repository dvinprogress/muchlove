# MuchLove - Progress Tracker

> Derniere MAJ: 2026-02-07 | Version: 0.1.0

## Statut Global
- **Phase**: mvp
- **Derniere action**: Audit end-to-end flow temoignage video — 5 bugs critiques corriges (boucle infinie, layout, auth API, MIME type, bucket storage). Flow complet fonctionne : page → camera → enregistrement → transcription Whisper → upload → succes.

## Infrastructure
| Element | Statut | Date | Notes |
|---------|--------|------|-------|
| Next.js 16 scaffold | DONE | 2026-02-02 | App Router, TypeScript strict |
| Tailwind CSS 4 | DONE | 2026-02-02 | PostCSS config |
| Framer Motion | DONE | 2026-02-02 | Animations UI |
| Supabase setup | DONE | 2026-02-02 | Auth + DB + Storage + RLS |
| Schema DB (migrations) | DONE | 2026-02-07 | 001: companies, contacts, testimonials, shares, videos | 002: auth_trigger | 003: stripe_integration | 004: automations (demo_sessions, email_sequences, email_events, widget_configs) |
| Auth trigger (auto company) | DONE | 2026-02-02 | 002_auth_trigger.sql |
| Vitest + Playwright | DONE | 2026-02-02 | Config prete, tests basiques |
| ESLint | DONE | 2026-02-02 | Next.js core-web-vitals |
| GitHub repo | DONE | 2026-02-06 | 2 commits, master branch, pushed |
| Vercel deploy | DONE | 2026-02-06 | Live: muchlove.app + muchlove.vercel.app, 4 env vars, region cdg1, headers securite |
| Domaine muchlove.app | DONE | 2026-02-06 | Achete sur Cloudflare ($14.20/an), expire Feb 2027 |
| Cloudflare DNS | DONE | 2026-02-06 | A: @ → 76.76.21.21, CNAME: www → cname.vercel-dns.com (DNS only) |
| CI/CD | DONE | 2026-02-06 | Auto-deploy via GitHub push → Vercel |

## Features
| # | Feature | Statut | Date | Fichiers cles | Notes audit |
|---|---------|--------|------|---------------|-------------|
| 1 | Auth email (magic link OTP) | DONE | 2026-02-02 | src/app/auth/actions.ts, src/app/login/page.tsx | |
| 2 | Auth Google OAuth | DONE | 2026-02-02 | src/app/auth/actions.ts, src/app/auth/callback/route.ts | |
| 3 | Auth LinkedIn OIDC | DONE | 2026-02-02 | src/app/auth/actions.ts | |
| 4 | Middleware auth (session) | DONE | 2026-02-02 | src/middleware.ts, src/lib/supabase/middleware.ts | |
| 5 | Supabase clients (browser + SSR) | DONE | 2026-02-02 | src/lib/supabase/client.ts, src/lib/supabase/server.ts | |
| 6 | Dashboard (plan + quota) | DONE | 2026-02-06 | src/app/dashboard/page.tsx, actions.ts, components/dashboard/ | Enrichi avec stats, funnel, activity |
| 7 | Types DB auto-generes | DONE | 2026-02-02 | src/types/database.ts | |
| 8 | Button component (Framer) | DONE | 2026-02-02 | src/components/ui/Button.tsx | |
| 9 | Interface enregistrement video | DONE | 2026-02-07 | src/components/video/, hooks/useMediaRecorder.ts, hooks/useWhisperTranscription.ts, app/[locale]/t/[link]/, api/upload-video/, lib/validation/ | Audit e2e 2026-02-07: 5 bugs fixes (boucle infinie useEffect, layout Fragment, auth session→contactId, MIME type codecs, bucket name). Transcription Whisper client-side. Flow complet OK. |
| 10 | Pipeline traitement video | DONE | 2026-02-07 | src/app/api/upload-video/route.ts, hooks/useWhisperTranscription.ts, lib/validation/ | Transcription Whisper client-side (zero API), upload → Storage → DB, contactId auth, validation Zod+MIME |
| 11 | Gestion contacts | DONE | 2026-02-06 | src/components/contacts/, app/dashboard/contacts/, actions.ts, CopyLinkButton.tsx, DeleteContactButton.tsx | Pagination 20/page, stats SQL optimisees, toast sonner, composants Client extraits |
| 12 | Workflow partage (social) | TODO | | Trustpilot, Google, LinkedIn | |
| 13 | Gamification (ambassadeur) | DONE | 2026-02-06 | src/components/gamification/, lib/utils/confetti.ts | ProgressBar, StatusBadge, CelebrationModal |
| 14 | Integration Stripe | DONE | 2026-02-07 | api/stripe/{checkout,portal,webhook}/, lib/stripe/{client,plans}.ts, components/billing/{BillingSection,UsageCard,Paywall,UpgradeModal}.tsx, hooks/{useSubscription,useCredits}.ts, dashboard/settings/ | Checkout Session, Customer Portal, Webhook (5 events + idempotence), Credits RPC atomiques, Paywall component, UpgradeModal Framer Motion, i18n billing EN/FR/ES |
| 15 | Schema DB automations | DONE | 2026-02-07 | supabase/migrations/004_automations.sql, src/types/database.ts | Tables: demo_sessions, email_sequences, email_events, widget_configs. Modifications: companies (email_preferences, last_active_at), contacts (linkedin_consent). Storage bucket demo-videos. RLS policies. Triggers. Fonctions: cleanup_expired_demo_sessions, auto_generate_widget_api_key |
| 16 | Infrastructure emails | DONE | 2026-02-07 | lib/email/resend.ts, lib/email/templates/BaseLayout.tsx, api/cron/orchestrator/route.ts, lib/cron/{demo-cleanup,email-sequences,segment-evaluation,weekly-digest}.ts, api/email/unsubscribe/route.ts, [locale]/unsubscribe/page.tsx, vercel.json, messages/{en,fr,es}.json | Resend client wrapper, BaseLayout responsive, Cron orchestrateur (toutes les heures), cleanup demos (logique complete), stubs sequences/segments/digest, API unsubscribe (token base64), page confirmation i18n, vercel cron config |
| 17 | Systeme emails (templates) | TODO | | Templates invitation, relance, digest, notifications | Phase 2b apres infra |
| 18 | Landing page marketing | DONE | 2026-02-06 | src/components/landing/, app/page.tsx, app/terms/, app/privacy/ | SEO 8+/10, metadata complete, pages legales, liens footer OK, bouton demo scroll |
| 19 | Internationalisation (i18n) | DONE | 2026-02-06 | src/i18n/, messages/{en,fr,es}.json, src/app/[locale]/, src/middleware.ts, src/components/ui/LanguageSwitcher.tsx | next-intl complet : routing [locale] as-needed (EN sans prefixe, /fr/, /es/), middleware i18n+Supabase, ~280 cles x 3 langues, LanguageSwitcher Framer Motion, SEO hreflang+alternates, generateMetadata multilingue, build OK |

## Bloquants qualite a corriger (issus de l'audit 2026-02-06)

### Video (#9) — Securite critique
- [x] Ajouter auth/authz sur /api/upload-video (n'importe qui peut uploader) — DONE 2026-02-06
- [x] Validation Zod sur inputs API (contactId, companyId) — DONE 2026-02-06
- [x] Remplacer `as any` par types generiques SupabaseClient<Database> — DONE 2026-02-06
- [x] Corriger state machine (phases uploading/complete mortes) — DONE 2026-02-06
- [x] Implementer vraie transcription — DONE 2026-02-07 — Whisper client-side via @huggingface/transformers, zero API
- [x] Fix boucle infinie useEffect dans VideoRecorder — DONE 2026-02-07 — Ref pattern pour cleanup
- [x] Fix layout Fragment vs wrapper div — DONE 2026-02-07 — Preview+controles empiles correctement
- [x] Fix auth API upload (session→contactId) — DONE 2026-02-07 — Contacts non authentifies autorisent l'upload
- [x] Fix MIME type codecs dans validation serveur — DONE 2026-02-07 — baseType = type.split(';')[0]
- [x] Fix nom bucket storage (raw-videos→videos) — DONE 2026-02-07 — Aligne sur migration 001
- [x] Aligner limites duree client/serveur (15s-120s) — DONE 2026-02-07

### Contacts (#11) — UX critique
- [x] Systeme de toast (remplacer alert/confirm par sonner ou shadcn/toast) — DONE 2026-02-06
- [x] Pagination (getContacts charge tout en memoire) — DONE 2026-02-06
- [x] Stats SQL GROUP BY au lieu d'agregation JS — DONE 2026-02-06
- [x] Extraire CopyLinkButton/DeleteButton en Client Components separes — DONE 2026-02-06

### Landing (#16) — SEO/Legal critique
- [x] Metadata SEO complete (OpenGraph, Twitter, robots, canonical) — layout.tsx
- [x] Remplacer mock data SocialProof par formulation conservatrice — SocialProof.tsx
- [x] Handler pour "Voir une demo" — scroll-to-section vers #how-it-works
- [x] Pages /terms et /privacy (obligation legale RGPD) — pages creees
- [x] Corriger liens morts footer — /terms et /privacy links OK

### Transversal
- [x] Infrastructure emails (Resend) — DONE 2026-02-07
- [ ] Templates emails (invitations, relances, digest) — requis pour invitations contacts (#17)
- [ ] Tests unitaires et e2e pour features critiques
- [ ] Images/assets optimises (hero, illustrations)

## Notes techniques migration 004
- **Storage bucket demo-videos**: 50MB limit, MIME types video/mp4, video/webm, video/quicktime
- **RLS policies**: demo_sessions accessible en public (INSERT/SELECT), email_sequences/events accessibles par company_id
- **Triggers**: update_updated_at sur email_sequences et widget_configs
- **Fonctions**: cleanup_expired_demo_sessions (pour Vercel Cron), auto_generate_widget_api_key (trigger INSERT)
- **Widget API key format**: `wgt_` + 48 caracteres hex (24 bytes random)
- **Email segments**: frozen_starter, rejected_requester, collector_unused, free_maximizer
- **Email event statuses**: sent, delivered, opened, clicked, bounced, complained
- **Email sequence statuses**: active, paused, completed, cancelled

## Services Externes Configures
| Service | Statut | Notes |
|---------|--------|-------|
| Supabase | CONFIGURED | Auth (Google + LinkedIn + Email), DB, Storage |
| Stripe | CODE_READY | Code complet, necessite: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRO/ENTERPRISE_PRICE_IDs dans Vercel env vars + produits Stripe Dashboard |
| Resend | CODE_READY | Client wrapper pret, necessite: RESEND_API_KEY, RESEND_FROM_EMAIL, CRON_SECRET dans Vercel env vars |
| Vercel | DEPLOYED | muchlove.app live, env vars configurees, NEXT_PUBLIC_APP_URL=https://muchlove.app, cron config vercel.json |
| Cloudflare | CONFIGURED | muchlove.app enregistre, DNS A+CNAME → Vercel, WHOIS redacte |

## Agents & Skills Projet
| Element | Statut | Notes |
|---------|--------|-------|
| Agent video-expert | DONE | .claude/agents/video-expert/ |
| Agent supabase-expert | DONE | .claude/agents/supabase-expert/ |
| Agent ux-copywriter | DONE | .claude/agents/ux-copywriter/ |
| 7 skills projet | DONE | .claude/skills/ |
| Knowledge base | DONE | decisions-log, ux-guidelines, video-patterns, supabase-schema |

## Prochaines Etapes (priorite)
1. **Configurer Resend** — Creer compte, obtenir API key, verifier domaine muchlove.app, ajouter env vars Vercel (RESEND_API_KEY, RESEND_FROM_EMAIL, CRON_SECRET)
2. **Appliquer migration 004 sur Supabase** — `supabase db push` ou via Dashboard SQL Editor
3. **Configurer Stripe Dashboard** — Creer produits/prix, ajouter env vars dans Vercel, configurer webhook endpoint
4. Templates emails (#17) — invitation contact, relance video, weekly digest, notifications
5. Implementation automations (#15):
   - Automation 1: Viral Demo (page /demo + API)
   - Automation 2: Behavioral Email Sequences (logique worker processEmailSequences)
   - Automation 3: Embeddable Widget (API publique + embed script)
   - Automation 4: LinkedIn Auto-Share (OAuth + API)
   - Automation 5: Smart Notifications (email triggers)
6. Workflow partage social (#12)
7. Tests unitaires et e2e pour features critiques
8. Images/assets optimises (hero, illustrations)
