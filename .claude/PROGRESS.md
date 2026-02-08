# MuchLove - Progress Tracker

> Derniere MAJ: 2026-02-07 | Version: 0.1.7

## Statut Global
- **Phase**: mvp
- **Derniere action**: Services production configures (Stripe, Resend, Cloudflare DNS). 16 env vars Vercel. Redeploy OK. Tests E2E passes.

## Infrastructure
| Element | Statut | Date | Notes |
|---------|--------|------|-------|
| Next.js 16 scaffold | DONE | 2026-02-02 | App Router, TypeScript strict |
| Tailwind CSS 4 | DONE | 2026-02-02 | PostCSS config |
| Framer Motion | DONE | 2026-02-02 | Animations UI |
| Supabase setup | DONE | 2026-02-02 | Auth + DB + Storage + RLS |
| Schema DB (migrations) | DONE | 2026-02-07 | 001: companies, contacts, testimonials, shares, videos | 002: auth_trigger | 003: stripe_integration | 004: automations (demo_sessions, email_sequences, email_events, widget_configs) | 005: feedback (feedbacks, feedback_screenshots, feedback_admin_notes, user_feedback_tasks, feedback_rate_limits + storage bucket + RLS + triggers + cleanup function) |
| Auth trigger (auto company) | DONE | 2026-02-02 | 002_auth_trigger.sql |
| Vitest + Playwright | DONE | 2026-02-02 | Config prete, tests basiques |
| ESLint | DONE | 2026-02-02 | Next.js core-web-vitals |
| GitHub repo | DONE | 2026-02-06 | 2 commits, master branch, pushed |
| Vercel deploy | DONE | 2026-02-07 | Live: muchlove.app + muchlove.vercel.app, 5 env vars (+ NEXT_PUBLIC_CLARITY_PROJECT_ID), region cdg1, headers securite, Vercel CLI auth OK |
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
| 12 | Workflow partage (social) | DONE | 2026-02-07 | src/lib/linkedin/post-generator.ts, components/sharing/{LinkedInShareButton,LinkedInConsentCheckbox,SharingFlow}.tsx, app/[locale]/t/[link]/actions.ts, messages/{en,fr,es}.json | LinkedIn Viral Loop simplifie : generation texte post (3 locales EN/FR/ES), bouton partage pre-rempli (copy to clipboard + LinkedIn share-offsite), checkbox consentement RGPD, SharingFlow orchestrateur (Trustpilot + Google + LinkedIn), Server Action updateShareStatus (progression shared_1 → shared_2 → shared_3 ambassador), integration TestimonialRecordingPage (apres video → sharing flow), CelebrationModal ambassadeur. PAS d'OAuth posting (risque ToS), juste pre-fill + ouverture lien. i18n complet sharing.* (~30 cles x 3 langues). |
| 13 | Gamification (ambassadeur) | DONE | 2026-02-06 | src/components/gamification/, lib/utils/confetti.ts | ProgressBar, StatusBadge, CelebrationModal |
| 14 | Integration Stripe | DONE | 2026-02-07 | api/stripe/{checkout,portal,webhook}/, lib/stripe/{client,plans}.ts, components/billing/{BillingSection,UsageCard,Paywall,UpgradeModal}.tsx, hooks/{useSubscription,useCredits}.ts, dashboard/settings/ | Checkout Session, Customer Portal, Webhook (5 events + idempotence), Credits RPC atomiques, Paywall component, UpgradeModal Framer Motion, i18n billing EN/FR/ES |
| 15 | Schema DB automations | DONE | 2026-02-07 | supabase/migrations/004_automations.sql, src/types/database.ts | Tables: demo_sessions, email_sequences, email_events, widget_configs. Modifications: companies (email_preferences, last_active_at), contacts (linkedin_consent). Storage bucket demo-videos. RLS policies. Triggers. Fonctions: cleanup_expired_demo_sessions, auto_generate_widget_api_key |
| 16 | Infrastructure emails | DONE | 2026-02-07 | lib/email/resend.ts, lib/email/templates/BaseLayout.tsx, api/cron/orchestrator/route.ts, lib/cron/{demo-cleanup,email-sequences,segment-evaluation,weekly-digest}.ts, api/email/unsubscribe/route.ts, [locale]/unsubscribe/page.tsx, vercel.json, messages/{en,fr,es}.json | Resend client wrapper, BaseLayout responsive, Cron orchestrateur (toutes les heures), cleanup demos (logique complete), stubs sequences/segments/digest, API unsubscribe (token base64), page confirmation i18n, vercel cron config |
| 17 | Systeme emails (templates) | DONE | 2026-02-07 | lib/email/templates/{FrozenStarterEmail,RejectedRequesterEmail,CollectorUnusedEmail,FreeMaximizerEmail,WeeklyDigest}.tsx, lib/cron/{email-sequences,segment-evaluation,weekly-digest}.ts, lib/email/digest/{stats-aggregator,recommendation-engine}.ts, api/webhooks/resend/route.ts, api/upload-video/route.ts (trigger FREE_MAXIMIZER), messages/{en,fr,es}.json (emailSequences), EMAIL_SEQUENCES_IMPLEMENTATION.md | Email Sequences Comportementales (4 segments : frozen_starter signup>24h 0 contacts, rejected_requester invites sans videos 48h, collector_unused videos non partagees 3j, free_maximizer limite atteinte) + Weekly Digest. 4 templates React Email (FrozenStarter 2 steps J+1/J+3, RejectedRequester 1 step tips boost reponse, CollectorUnused 1 step 4 usages, FreeMaximizer 1 step upgrade code MOMENTUM 20%). Logique segment-evaluation (cree sequences anti-duplicate), email-sequences (envoie queue + checkIfStillInSegment + next_send_at + idempotence), webhook Resend (tracking delivered/opened/clicked/bounced/complained + auto-cancel). Trigger immediat FREE_MAXIMIZER dans upload-video (videos_used >= videos_limit). i18n emailSequences EN/FR/ES. Architecture cron orchestrateur → evaluateSegments + processEmailSequences → Resend → Webhook → email_events. Contraintes : max 3 emails/sequence, 48h espacement, inline CSS, unsubscribe obligatoire. BLOQUANT BUILD : database.ts manque tables migration 004 (pas appliquee Supabase). Doc complete EMAIL_SEQUENCES_IMPLEMENTATION.md. |
| 18 | Landing page marketing | DONE | 2026-02-06 | src/components/landing/, app/page.tsx, app/terms/, app/privacy/ | SEO 8+/10, metadata complete, pages legales, liens footer OK, bouton demo scroll |
| 19 | Internationalisation (i18n) | DONE | 2026-02-06 | src/i18n/, messages/{en,fr,es}.json, src/app/[locale]/, src/middleware.ts, src/components/ui/LanguageSwitcher.tsx | next-intl complet : routing [locale] as-needed (EN sans prefixe, /fr/, /es/), middleware i18n+Supabase, ~280 cles x 3 langues, LanguageSwitcher Framer Motion, SEO hreflang+alternates, generateMetadata multilingue, build OK |
| 20 | Viral Demo Flow | DONE | 2026-02-07 | src/app/[locale]/demo/, components/demo/{DemoEmailCapture,DemoSharePanel,DemoCounter}.tsx, components/video/DemoVideoRecorder.tsx, api/demo/{upload-video,capture-email,count}/route.ts, components/landing/HeroSection.tsx, messages/{en,fr,es}.json | Flow complet : Intro → Recording (DemoVideoRecorder fork VideoRecorder) → Celebration → EmailCapture (honeypot RGPD) → SharePanel (LinkedIn + Twitter). DemoCounter social proof (fetch /api/demo/count). 3 API routes : upload-video (rate limit 3/IP/24h, bucket demo-videos), capture-email (update session), count (cache 5min). Bouton demo landing (amber). i18n EN/FR/ES (~340 cles). Watermark DEMO. Redirection /login?email= apres capture. Build OK. |
| 21 | Systeme Feedback | DONE | 2026-02-07 | src/lib/feedback/{types,lib,components,api}/, feedback.config.ts, src/app/api/feedback/{route,upload,admin}/, src/components/feedback/FeedbackProvider.tsx, supabase/migrations/005_feedback.sql | Package complet integre : FeedbackWidget (floating button violet/purple), FeedbackModal (3 categories: bug/improvement/feature), FeedbackForm (title + description + email + screenshots), CategorySelector, ScreenshotUploader (drag&drop + paste + compression). Securite 8 layers : Turnstile anti-bot, rate limit IP (3 req/min), Zod validation, anti-spam (URLs, repetition, keywords), anti-injection (prompt/XSS/SQL), sanitization HTML, Supabase RLS, processing pipeline (auto-tags bugs, user tasks features). 3 API routes : POST /api/feedback (submit), POST /api/feedback/upload (screenshots), GET+PATCH /api/feedback/admin (admin only). Migration 005 : 5 tables (feedbacks + screenshots + admin_notes + user_tasks + rate_limits) + storage bucket + RLS policies + triggers. FeedbackProvider integre layout racine (visible partout). Config MuchLove : violet/purple branding, Turnstile (NEXT_PUBLIC_TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY requis). TypeCheck + Build OK. |
| 23 | Microsoft Clarity Analytics | DONE | 2026-02-07 | src/components/providers/ClarityProvider.tsx, src/app/[locale]/layout.tsx | Package @microsoft/clarity, ClarityProvider useEffect init, env var NEXT_PUBLIC_CLARITY_PROJECT_ID, heatmaps + session recordings + rage clicks |
| 22 | Widget Embeddable | DONE | 2026-02-07 | src/app/api/widget/{testimonials,config}/, src/widget/{index,styles,render}.ts, src/app/[locale]/dashboard/widget/, src/components/widget/{WidgetConfigurator,WidgetSnippet}.tsx, scripts/build-widget.ts, public/widget/muchlove-widget.js | API publique GET /api/widget/testimonials avec validation api_key, CORS dynamique (allowed_domains + wildcard support), signed URLs 1h, cache 5min. API authentifiee GET/PUT /api/widget/config (CRUD config). Widget standalone vanilla JS (9.71 KB bundled) : Shadow DOM isolation, carousel responsive (1 card mobile, 2 tablets, 3 desktop), play video overlay, IntersectionObserver lazy-load, navigation dots + arrows. Configurateur dashboard : WidgetConfigurator (theme colors, layout, maxItems, showNames, showTranscription, poweredByVisible [Pro only], allowedDomains), WidgetSnippet (code HTML copiable), enable/disable toggle, Server Actions (enableWidget, disableWidget, updateWidgetConfig). Esbuild integration : build script npm run build:widget (pre-build hook), bundle < 20kb OK. i18n EN/FR/ES complet (~40 cles widget.*). Sidebar mis a jour (icone Code2). Pret pour production. |

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
- [x] Template Weekly Digest email — DONE 2026-02-07
- [x] database.ts types migration 004+005 — DONE 2026-02-07 — Ajout manuel tables + Relationships[] (requis par @supabase/postgrest-js)
- [x] Build TypeScript + Next.js — DONE 2026-02-07 — 0 erreur tsc, 54 pages compilees
- [x] Audit performance : dynamic imports VideoRecorder/CelebrationModal/SharingFlow — DONE 2026-02-07
- [x] Audit performance : confetti lazy loaded (canvas-confetti) — DONE 2026-02-07
- [x] Audit performance : fonts display:swap — DONE 2026-02-07
- [x] Audit performance : dashboard parallel fetch (company + stats) — DONE 2026-02-07
- [x] Audit performance : FeedbackProvider deplace root → dashboard layout — DONE 2026-02-07
- [x] Audit performance : stripe+resend serverExternalPackages — DONE 2026-02-07
- [x] Audit securite : CRON_SECRET fallback supprime (fail hard) — DONE 2026-02-07
- [x] Audit securite : RESEND_FROM_EMAIL fallback supprime (fail hard) — DONE 2026-02-07
- [x] Audit qualite : barrel export useWhisperTranscription ajoute — DONE 2026-02-07
- [x] Audit qualite : useConfetti void pour async confetti — DONE 2026-02-07
- [x] Audit securite : webhook Resend signature Svix — DONE 2026-02-07 — npm svix, Webhook.verify(), RESEND_WEBHOOK_SECRET fail-fast, 401 si invalide
- [x] Audit securite : token unsubscribe signe HMAC — DONE 2026-02-07 — HMAC-SHA256, timingSafeEqual, base64url, UNSUBSCRIBE_TOKEN_SECRET env var
- [x] Audit securite : RLS policies hardening — DONE 2026-02-07 — Migration 006: supprime service_role dead policies, ajoute UPDATE email_sequences, decompose widget_configs ALL en SELECT+UPDATE
- [x] Supprimer dead code api/transcribe — DONE 2026-02-07
- [x] Fix ESLint config — DONE 2026-02-07 — Flat config sans FlatCompat, 0 erreurs 19 warnings
- [x] Audit qualite : refactorer VideoRecorder duplication (280 lignes x2) — DONE 2026-02-07 — Hook useVideoRecorderLogic partage (hooks/useVideoRecorderLogic.ts), logique commune extraite, Props interfaces conservees, backward compatible
- [x] Audit qualite : @ts-ignore elimines — DONE 2026-02-07 — 0 @ts-ignore restant (resolus par corrections database.ts Relationships[] + FK definitions)
- [x] Templates emails invitations — DONE 2026-02-07 — InvitationEmail.tsx + ReminderEmail.tsx (React Email, BaseLayout, CTA rose #f43f5e)
- [x] Tests e2e Playwright — DONE 2026-02-07 — 53 tests (landing 9, auth 8, demo 8, widget-api 20, dashboard 8), config playwright.config.ts, 0 erreur TS
- [x] Hero Section illustration visuelle — DONE 2026-02-07 — Layout split responsive (text left, mockup video right), play button overlay, floating decorations (Heart/Star), gradient rose/purple, animations Framer Motion

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
| Supabase | CONFIGURED | Auth (Google + LinkedIn + Email), DB, Storage. Migrations 001-006 appliquees (SQL Editor). |
| Stripe | CONFIGURED | Account acct_1SyBKnAcl1xwxhHz (mode test). 2 produits (Pro + Enterprise), 4 prix, webhook 6 events. Env vars Vercel OK. |
| Resend | CONFIGURED | Domaine muchlove.app verified (DKIM + SPF). API key + webhook (11 events). Env vars Vercel OK. |
| Vercel | DEPLOYED | muchlove.app live, 16 env vars production, region cdg1, headers securite, cron config vercel.json |
| Clarity | LIVE | Tracking actif sur muchlove.app, project ID vdkjs9lifc, package @microsoft/clarity, ClarityProvider component |
| Cloudflare | CONFIGURED | muchlove.app, DNS A+CNAME → Vercel + 3 records Resend (DKIM TXT, SPF MX, SPF TXT), WHOIS redacte |

## Agents & Skills Projet
| Element | Statut | Notes |
|---------|--------|-------|
| Agent video-expert | DONE | .claude/agents/video-expert/ |
| Agent supabase-expert | DONE | .claude/agents/supabase-expert/ |
| Agent ux-copywriter | DONE | .claude/agents/ux-copywriter/ |
| 7 skills projet | DONE | .claude/skills/ |
| Knowledge base | DONE | decisions-log, ux-guidelines, video-patterns, supabase-schema |

## Prochaines Etapes (priorite)
1. ~~Appliquer migrations 004 + 005 + 006 sur Supabase~~ — DONE 2026-02-07 (via SQL Editor)
2. ~~Configurer Resend~~ — DONE 2026-02-07 (compte, API key, webhook, domaine verified, DNS Cloudflare, env vars Vercel)
3. ~~Configurer Stripe Dashboard~~ — DONE 2026-02-07 (compte, 2 produits, 4 prix, webhook, env vars Vercel)
4. ~~Tester Viral Demo Flow~~ — DONE 2026-02-07 (UI OK FR/ES, API count 200, capture-email Zod OK, upload-video 500 sans FormData = bug mineur, camera non testable en auto)
5. **Tester Email Sequences** — Trigger manuel cron orchestrator, verifier creation sequences, envoi emails (voir EMAIL_SEQUENCES_IMPLEMENTATION.md)
6. **Tester Widget Embeddable** — Creer config via dashboard, copier snippet, tester integration externe
7. ~~Templates emails (invitations contact initiale, relance video)~~ — DONE v0.1.7 (InvitationEmail + ReminderEmail)
8. ~~Tests unitaires et e2e pour features critiques~~ — DONE v0.1.7 (11 Vitest + 53 Playwright)
9. ~~Images/assets optimises (hero, illustrations)~~ — DONE v0.1.7 (favicon, OG image, apple icon, hero mockup)
10. Push + deploy via GitHub → Vercel
