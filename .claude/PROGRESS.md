# MuchLove - Progress Tracker

> Derniere MAJ: 2026-02-13 | Version: 0.1.24

## Statut Global
- **Phase**: mvp
- **Derniere action**: Sprint corrections 28 feedbacks client termine. P0 (flow transcription→avis→partage, detection partage), P1 (7 bugs), P2 (format carre, bouton record, espacement, cartes prompts, encouragements, footer, miniatures), P3 (boutons post-creation, edition contact, phone/reward). 27/28 feedbacks corriges. TypeScript + Build OK.

## Infrastructure
| Element | Statut | Date | Notes |
|---------|--------|------|-------|
| Next.js 16 scaffold | DONE | 2026-02-02 | App Router, TypeScript strict |
| Tailwind CSS 4 | DONE | 2026-02-02 | PostCSS config |
| Framer Motion | DONE | 2026-02-02 | Animations UI |
| Supabase setup | DONE | 2026-02-02 | Auth + DB + Storage + RLS |
| Schema DB (migrations) | DONE | 2026-02-13 | 001: companies, contacts, testimonials, shares, videos | 002: auth_trigger | 003: stripe_integration | 004: automations (demo_sessions, email_sequences, email_events, widget_configs) | 005: feedback (feedbacks, feedback_screenshots, feedback_admin_notes, user_feedback_tasks, feedback_rate_limits + storage bucket + RLS + triggers + cleanup function) | 006: RLS hardening | 007: free_plan_20_videos | 008: onboarding (companies.onboarding_completed_at + industry, index partiel, bucket company-logos + RLS) | 009: contact_phone_reward (contacts.phone + reward TEXT) |
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
| 24 | Free plan 5→20 videos | DONE | 2026-02-09 | lib/stripe/plans.ts, api/stripe/webhook/route.ts, email/templates/FreeMaximizerEmail.tsx, dashboard/{page,settings}, cron/segment-evaluation.ts, messages/{en,fr,es}.json, migrations/007 | videosLimit 5→20 dans plans.ts (source verite), fallbacks dashboard, webhook downgrade, email template, i18n 3 langues, commentaire cron, migration SQL (ALTER DEFAULT + UPDATE existants) |
| 25 | Audit visuel responsive | DONE | 2026-02-09 | components/landing/{LandingNavbar,HeroSection,Footer,Pricing,HowItWorks}.tsx, components/ui/LanguageSwitcher.tsx, app/[locale]/{login/page,demo/DemoFlow}.tsx | Audit Playwright mobile (390x844) + desktop (1440x900) + tablette (768x1024). 10 fixes : nav mobile (LanguageSwitcher compact, login hidden, CTA reduit), login whitespace (mt-20 supprime), hero CTA responsive (px-6/py-3 mobile), demo titre responsive (text-3xl mobile), footer LanguageSwitcher, pricing gap mobile, hero buttons layout desktop (sm:flex-row supprime), LanguageSwitcher Globe icon (fix emoji Windows), HowItWorks grid orphan tablette (sm:grid-cols-2 md:grid-cols-3). Build OK 0 erreur. |
| 26 | ProgressBar UX refonte | DONE | 2026-02-09 | components/gamification/ProgressBar.tsx, messages/{fr,en,es}.json | Refonte complete : 3 etapes claires (Video/Partager/Ambassadeur) au lieu de 5 dots techniques (Start/Video/Trustpilot/Google/Ambassador). Icones Lucide (Video, Share2, Trophy). Mapping STATUS_TO_STEP 1-3 et STATUS_TO_PROGRESS 33-100%. Design compact : cercles w-10 h-10, icones w-5 h-5, texte xs. Couleurs : completed=bg-green-500, active=bg-rose-500 ring-4 ring-rose-200, pending=bg-gray-200. Ligne progression rose animee. Traductions i18n 3 langues (step1/step2/step3 remplacent anciennes cles). TypeScript OK. |
| 27 | Bugs critiques video temoignage | DONE | 2026-02-09 | hooks/useVideoRecorderLogic.ts, components/video/{VideoPreview,RecordingControls}.tsx, messages/{fr,en,es}.json | Bug 1 fix : Transcription Whisper non-bloquante (try-catch isole, upload continue avec transcription=null si echec). Bug 2 fix : VideoPreview.srcObject=null au cleanup stream (browser utilise blob URL src). Bug 3 fix : RecordingControls i18n complet (recording/attempts/retake/validate), traductions FR/EN/ES alignees spec. TypeScript OK. |
| 28 | Import CSV + Envoi Email + Actions groupees | DONE | 2026-02-09 | app/[locale]/dashboard/contacts/actions.ts, components/contacts/{CSVImportModal,SendEmailButton,BulkActionsBar,ContactsList}.tsx, messages/{fr,en,es}.json | 3 server actions : importContactsCSV (batch insert max 200, Zod, nanoid), sendInvitationEmail (Resend + InvitationEmail template + HMAC unsubscribe + status→invited), sendBulkInvitationEmails (max 50, try/catch individuel). CSVImportModal : drag-drop, detection separateur auto (`,`/`;`), guillemets, preview 5 lignes, validation headers+email. SendEmailButton : icone Mail, disabled si deja invite. BulkActionsBar : barre sticky bottom slate-900, envoyer invitations + supprimer batch. ContactsList : checkboxes + select all, bouton Import CSV toolbar, integration SendEmail/BulkActions/CSVImport. i18n complet contacts.import/email/bulk (FR/EN/ES ~30 cles). TypeScript + Build OK. |
| 29 | Fix sidebar widget i18n | DONE | 2026-02-09 | components/dashboard/Sidebar.tsx, messages/{fr,en,es}.json | Cle widget.sidebar inexistante → changee en widget, ajout dashboard.sidebar.widget dans 3 langues |
| 30 | Fix filtre statuts i18n contacts | DONE | 2026-02-09 | components/contacts/ContactsList.tsx | status.replace('_',' ') → tStatus(status) avec contacts.status.* existant |
| 31 | Refonte landing page SEO | DONE | 2026-02-09 | components/landing/{LandingNavbar,HeroSection,LogoCloud,ProblemSection,FeaturesGrid,HowItWorks,StatsSection,TestimonialsSection,UseCasesSection,WidgetShowcase,ComparisonTable,Pricing,FAQSection,CTASection,Footer}.tsx, app/[locale]/page.tsx, app/[locale]/layout.tsx, messages/{en,fr,es}.json | Refonte complete 5→15 sections. Nouvelles sections: LogoCloud, ProblemSection, FeaturesGrid (6 features), StatsSection (4 metrics), TestimonialsSection (3 temoignages), UseCasesSection (4 industries), WidgetShowcase (mockup + code snippet), ComparisonTable (vs avis ecrits), FAQSection (8 Q&A accordion), CTASection (gradient rose). Sections reecrites: HeroSection (badge, H1 gradient, mockup video CSS), LandingNavbar (nav anchor links + hamburger mobile), HowItWorks (4 etapes connectees), Pricing (toggle annuel/mensuel, 3 tiers), Footer (4 colonnes). SEO: schema.org JSON-LD (Organization + SoftwareApplication + FAQPage), metadata enrichies par locale (titre ~60 chars, description ~155 chars, keywords 11), OpenGraph images, hreflang. Contenu i18n EN/FR/ES enrichi (~400 cles landing). SocialProof.tsx supprime (remplace par StatsSection). TypeScript + Build OK 0 erreur. |
| 32 | Onboarding post-inscription | DONE | 2026-02-09 | app/[locale]/dashboard/onboarding/{page,OnboardingFlow,actions}.tsx, onboarding/components/{Step1BusinessInfo,Step2SharingLinks,Step3FirstContact,InfoTooltip,LogoUploader,ProgressIndicator}.tsx, middleware.ts, supabase/migrations/008_onboarding.sql, types/database.ts, messages/{en,fr,es}.json | Flow 3 etapes skippables : Step1 (nom entreprise + logo upload + secteur), Step2 (URL Trustpilot + Google Place ID avec tooltips aide ℹ️ et liens directs), Step3 (premier contact + envoi invitation email). Celebration confetti ambassadorCelebration(). Migration 008 : colonnes onboarding_completed_at + industry, bucket company-logos (2MB, RLS 4 policies). 5 Server Actions Zod. Middleware redirect auto si onboarding incomplet (evite /dashboard/onboarding loop). ProgressIndicator 3 cercles animes. InfoTooltip panneau expandable bleu. LogoUploader drag-drop. i18n EN/FR/ES (~40 cles onboarding.*). TypeScript + Build OK 55 pages. |
| 33 | Fix LanguageSwitcher emoji→SVG | DONE | 2026-02-09 | components/ui/LanguageSwitcher.tsx | Remplacement emoji drapeaux (non supportes Windows) par SVG inline : UK (Union Jack), FR (tricolore), ES (bandes). Zero dependance, cross-platform. |
| 34 | Refactoring upload video (limite 4.5MB) | DONE | 2026-02-11 | hooks/useVideoRecorderLogic.ts, api/upload-video/route.ts, components/video/VideoRecorder.tsx, lib/validation/video-api.ts | Probleme: videos WebM 15-120s depassent limite 4.5MB serverless Vercel. Solution: Upload direct Supabase Storage client-side (phase 2) puis POST API JSON metadata (phase 3). Nouveau schema uploadVideoMetadataSchema (contactId, filePath, duration, transcription). UploadConfig refactore (contactId + companyId requis, buildFormData optionnel pour demo). API route ne recoit plus FormData, juste JSON. Backward compatible avec DemoVideoRecorder (mode legacy FormData detecte). TypeScript + Build OK 55 pages. |
| 35 | Section Profil entreprise dans settings | DONE | 2026-02-11 | components/settings/CompanyProfileSection.tsx, app/[locale]/dashboard/settings/page.tsx, messages/{fr,en,es}.json, onboarding/actions.ts | Formulaire editable dans dashboard settings : nom entreprise, secteur, logo (drag-drop), URL Trustpilot, Google Place ID avec InfoTooltips. Reutilisation server actions onboarding (updateBusinessInfo, uploadCompanyLogo, updateSharingLinks). Reutilisation composants LogoUploader + InfoTooltip. Toast sonner feedback. Revalidation pages apres modif. i18n FR/EN/ES (cles settings.profile.*). TypeScript OK. |
| 36a | Fix bugs P1 (issues #2,#4,#5,#6,#11,#12,#26,#28) | DONE | 2026-02-13 | onboarding/actions.ts, settings, VideoPreview, LanguageSwitcher, CSVImportModal, video types+validation, messages/{fr,en,es}.json | Bug #4: industry ''→null. Bug #5: bucket OK. Bug #6: quota 5→20. Bug #11: bord rouge p-1. Bug #12: duree 120→60s. Bug #2/#26: CSV count interpolation. Bug #28: LanguageSwitcher direction up. TypeScript + Build OK. |
| 36b | Format video carre + bouton record + espacement (#7,#8,#13) | DONE | 2026-02-13 | components/video/VideoPreview.tsx, RecordingControls.tsx, app/[locale]/t/[link]/TestimonialRecordingPage.tsx, VideoRecorder.tsx | VideoPreview: aspect-video→aspect-square (1:1). RecordingControls: bouton responsive w-20 h-20 md:w-16 md:h-16. TestimonialRecordingPage: space-y-3→space-y-4 md:space-y-6, p-4→p-4 md:p-8, footer pt-4→pt-6. VideoRecorder: space-y-4 md:space-y-6. TypeScript OK. |
| 36c | Cartes prompts zoom (#9) | DONE | 2026-02-13 | components/video/ScriptGuide.tsx | Cartes: w-[280px]→w-[320px] md:w-[360px], p-3→p-4, text-xs→text-sm titre, text-sm→text-sm md:text-base script. Zoom clic: expandedCard state, motion.div scale:1.05 spring animation, shadow-sm→shadow-sm hover:shadow-md. TypeScript OK. |
| 36d | Footer MuchLove cliquable (#20) | DONE | 2026-02-13 | app/[locale]/t/[link]/TestimonialRecordingPage.tsx | Footer p texte→a lien muchlove.io target=_blank, hover:text-rose-500, SVG coeur rose. |
| 37 | Micro-récompenses parcours témoin | DONE | 2026-02-13 | components/video/RecordingControls.tsx, messages/{fr,en,es}.json | 2 messages encouragement: "C'est parti ! Appuyez et parlez naturellement" (phase previewing, slate-500 sous bouton record), "Bravo, c'est dans la boîte ! 🎬" (phase recorded, emerald-600 font-medium avec animation Framer Motion y:10→0). i18n FR/EN/ES complet (encouragementReady + encouragementRecorded). TypeScript + Build OK 55 pages. |
| 38 | Génération miniatures vidéo | DONE | 2026-02-13 | lib/video/thumbnail.ts, hooks/useVideoRecorderLogic.ts | Extraction frame vidéo via Canvas API client-side (zéro dépendance). Format 720x720 JPEG qualité 0.85. Upload bucket thumbnails Supabase path {company_id}/{testimonial_id}/thumb.jpg. URL publique stockée testimonials.thumbnail_url. Miroir horizontal (front camera). Non-bloquant (best-effort, console.warn si échec). TypeScript + Build OK 55 pages. |
| 39 | Boutons action post-création contact | DONE | 2026-02-13 | components/contacts/AddContactForm.tsx, messages/{fr,en,es}.json | Écran succès après création contact (icône Check emerald). 3 boutons d'action: "Envoyer l'invitation par email" (appelle sendInvitationEmail + toast), "Copier le lien d'enregistrement" (clipboard API + toast + feedback visuel 3s), "Fermer" (reset états + fermeture modal). État createdContact stocke {id, unique_link}. Affichage conditionnel formulaire vs succès. i18n FR/EN/ES complet (successMessage, sendEmail, copyLink, linkCopied, emailSent, close). TypeScript + Build OK 55 pages. |
| 40 | Fiche contact éditable (crayon vs poubelle) | DONE | 2026-02-13 | components/contacts/EditContactSheet.tsx, ContactsList.tsx, app/[locale]/dashboard/contacts/actions.ts, messages/{fr,en,es}.json | Remplacement icône poubelle (Trash2) par crayon (Pencil) dans liste contacts (desktop + mobile). Clic crayon ouvre EditContactSheet : panneau latéral droit (Framer Motion slide-in x:100%→0), édition inline first_name/email/company_name, bouton Save (updateContact server action + Zod validation), section info read-only (status, created_at, unique_link), bouton Delete avec confirmation deux étapes (modal rouge interne). Server action updateContact() avec validation Zod + revalidatePath. i18n FR/EN/ES complet (contacts.edit.* : title, status, save, saving, success, error, createdAt, link, deleteConfirm, confirmDelete). TypeScript + Build OK 55 pages. |
| 41 | Champs phone et reward contacts | DONE | 2026-02-13 | migrations/009_contact_phone_reward.sql, types/database.ts, app/[locale]/dashboard/contacts/actions.ts, components/contacts/AddContactForm.tsx, messages/{fr,en,es}.json | Migration SQL 009 ajoute contacts.phone TEXT + reward TEXT (optionnels). Types DB mis à jour (Row/Insert/Update). Server actions : createContact + updateContact + importContactsCSV acceptent phone/reward (Zod max 20/200, nullable). AddContactForm UI : 2 champs optionnels après entreprise (type tel + text), labels + placeholders + suggestions récompense. i18n FR/EN/ES complet (contacts.form.optional + phone.{label,placeholder} + reward.{label,placeholder,suggestions}). TypeScript + Build OK 55 pages. **IMPORTANT** : Migration 009 à appliquer manuellement sur Supabase. |

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
- [x] Upload bloque par transcription Whisper — DONE 2026-02-09 — Transcription non-bloquante
- [x] Video enregistree ne joue pas en phase validation — DONE 2026-02-09 — srcObject cleanup
- [x] Traductions RecordingControls hardcodees anglais — DONE 2026-02-09 — i18n video.controls FR/EN/ES
- [x] Upload video bloque par limite 4.5MB Vercel — DONE 2026-02-11 — Upload direct Supabase Storage client-side

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
| Supabase | CONFIGURED | Auth (Google + LinkedIn + Email), DB, Storage. Migrations 001-006 appliquees (SQL Editor). Migration 007 a appliquer (free plan 20 videos). |
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
