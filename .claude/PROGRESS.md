# MuchLove - Progress Tracker

> Derniere MAJ: 2026-02-07 | Version: 0.1.0

## Statut Global
- **Phase**: mvp
- **Derniere action**: Integration Stripe validee — Checkout, Portal, Webhook, Credits, Paywall, i18n billing complet. Fix 'use server' sur route handlers + TypeScript errors webhook. Build OK.

## Infrastructure
| Element | Statut | Date | Notes |
|---------|--------|------|-------|
| Next.js 16 scaffold | DONE | 2026-02-02 | App Router, TypeScript strict |
| Tailwind CSS 4 | DONE | 2026-02-02 | PostCSS config |
| Framer Motion | DONE | 2026-02-02 | Animations UI |
| Supabase setup | DONE | 2026-02-02 | Auth + DB + Storage + RLS |
| Schema DB (migrations) | DONE | 2026-02-02 | companies, contacts, testimonials, shares, videos |
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
| 9 | Interface enregistrement video | DONE | 2026-02-06 | src/components/video/, hooks/useMediaRecorder.ts, app/t/[link]/, api/upload-video/, lib/validation/ | Auth+Zod sur API, state machine corrigee, types generiques. Transcription: fallback only |
| 10 | Pipeline traitement video | DONE | 2026-02-06 | src/app/api/transcribe/route.ts, api/upload-video/route.ts, lib/validation/ | Auth+Zod, transcription Whisper fallback only, pas de queue/retry |
| 11 | Gestion contacts | DONE | 2026-02-06 | src/components/contacts/, app/dashboard/contacts/, actions.ts, CopyLinkButton.tsx, DeleteContactButton.tsx | Pagination 20/page, stats SQL optimisees, toast sonner, composants Client extraits |
| 12 | Workflow partage (social) | TODO | | Trustpilot, Google, LinkedIn | |
| 13 | Gamification (ambassadeur) | DONE | 2026-02-06 | src/components/gamification/, lib/utils/confetti.ts | ProgressBar, StatusBadge, CelebrationModal |
| 14 | Integration Stripe | DONE | 2026-02-07 | api/stripe/{checkout,portal,webhook}/, lib/stripe/{client,plans}.ts, components/billing/{BillingSection,UsageCard,Paywall,UpgradeModal}.tsx, hooks/{useSubscription,useCredits}.ts, dashboard/settings/ | Checkout Session, Customer Portal, Webhook (5 events + idempotence), Credits RPC atomiques, Paywall component, UpgradeModal Framer Motion, i18n billing EN/FR/ES |
| 15 | Systeme emails | TODO | | Invitations, notifications | Bloquant pour feature #11 (invitations) |
| 16 | Landing page marketing | DONE | 2026-02-06 | src/components/landing/, app/page.tsx, app/terms/, app/privacy/ | SEO 8+/10, metadata complete, pages legales, liens footer OK, bouton demo scroll |
| 17 | Internationalisation (i18n) | DONE | 2026-02-06 | src/i18n/, messages/{en,fr,es}.json, src/app/[locale]/, src/middleware.ts, src/components/ui/LanguageSwitcher.tsx | next-intl complet : routing [locale] as-needed (EN sans prefixe, /fr/, /es/), middleware i18n+Supabase, ~280 cles x 3 langues, LanguageSwitcher Framer Motion, SEO hreflang+alternates, generateMetadata multilingue, build OK |

## Bloquants qualite a corriger (issus de l'audit 2026-02-06)

### Video (#9) — Securite critique
- [x] Ajouter auth/authz sur /api/upload-video (n'importe qui peut uploader) — DONE 2026-02-06
- [x] Validation Zod sur inputs API (contactId, companyId) — DONE 2026-02-06
- [x] Remplacer `as any` par types generiques SupabaseClient<Database> — DONE 2026-02-06
- [x] Corriger state machine (phases uploading/complete mortes) — DONE 2026-02-06
- [x] Implementer vraie transcription — DONE 2026-02-07 — Whisper client-side via @huggingface/transformers, zero API

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
- [ ] Systeme emails (Resend/SendGrid) — requis pour invitations contacts (#15)
- [ ] Tests unitaires et e2e pour features critiques
- [ ] Images/assets optimises (hero, illustrations)

## Services Externes Configures
| Service | Statut | Notes |
|---------|--------|-------|
| Supabase | CONFIGURED | Auth (Google + LinkedIn + Email), DB, Storage |
| Stripe | CODE_READY | Code complet, necessite: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRO/ENTERPRISE_PRICE_IDs dans Vercel env vars + produits Stripe Dashboard |
| Vercel | DEPLOYED | muchlove.app live, env vars configurees, NEXT_PUBLIC_APP_URL=https://muchlove.app |
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
1. **Configurer Stripe Dashboard** — Creer produits/prix, ajouter env vars dans Vercel, configurer webhook endpoint
2. Systeme emails (#15) — debloquer invitations contacts
3. Workflow partage social (#12)
4. Tests unitaires et e2e pour features critiques
5. Images/assets optimises (hero, illustrations)
