# Checkpoint: muchlove-auth-setup

**Date**: 2026-02-06
**Session**: Setup initial MuchLove + Supabase + Auth Google/Magic Link

## Objectif Principal
Configurer le projet MuchLove (SaaS B2B de collecte de temoignages video) depuis zero : infrastructure, base de donnees, et authentification.

## Progression
- [x] Setup Next.js 16 + React 19 + TypeScript + Tailwind 4 + Framer Motion
- [x] Configuration .env.local avec credentials Supabase
- [x] Schema DB : tables companies, contacts, testimonials + RLS + indexes + triggers
- [x] Storage buckets : videos, thumbnails, logos
- [x] Types TypeScript complets (database.ts avec Row/Insert/Update + enums + helpers)
- [x] Auth : server actions (Google OAuth, LinkedIn OIDC, email magic link, signOut)
- [x] Auth : callback route (/auth/callback)
- [x] Auth : middleware protection routes (/dashboard protege, /login redirect si connecte)
- [x] Auth : page login avec 3 methodes (Google, LinkedIn, magic link)
- [x] Auth : dashboard minimal avec stats company
- [x] Auth : trigger SQL auto-creation company au signup
- [x] Auth : Google OAuth configure et TESTE (fonctionne)
- [x] Fix : redirect() dans server actions (pas de try/catch autour de redirect)
- [ ] Commit git (bloque : git user.email/name pas configure)
- [ ] LinkedIn OAuth (provider pas encore configure dans Supabase)
- [ ] Dashboard enrichi (gestion contacts, envoi invitations)
- [ ] Composant enregistrement video
- [ ] Pipeline video (upload, transcription, YouTube)
- [ ] Flux de partage (Trustpilot, Google Reviews, LinkedIn)
- [ ] Gamification (progression, badges, confettis)

## Fichiers Modifies
| Fichier | Action | Description |
|---------|--------|-------------|
| .env.local | cree | Credentials Supabase (URL + anon key) |
| .env.example | existant | Template des env vars |
| src/types/database.ts | modifie | Types complets DB (companies, contacts, testimonials) + enums + helpers |
| src/lib/supabase/middleware.ts | modifie | Ajout protection routes + redirects auth |
| src/lib/supabase/client.ts | modifie | Client browser Supabase |
| src/lib/supabase/server.ts | modifie | Client server Supabase |
| src/app/auth/actions.ts | cree | Server actions: signInWithEmail, signInWithGoogle, signInWithLinkedinOidc, signOut |
| src/app/auth/callback/route.ts | cree | GET handler OAuth callback (echange code -> session) |
| src/app/login/page.tsx | cree | Page login: Google, LinkedIn, magic link (Suspense pour useSearchParams) |
| src/app/dashboard/page.tsx | cree | Dashboard: stats company, plan, videos, deconnexion |
| supabase/migrations/001_initial_schema.sql | cree | Tables + RLS + indexes + triggers + storage buckets |
| supabase/migrations/002_auth_trigger.sql | cree | Trigger auto-creation company au signup |
| scripts/test-supabase.mjs | cree | Script de test connexion Supabase |
| .gitignore | modifie | Ajout "nul" (artefact Windows) |

## Decisions Techniques
1. **Auth sans try/catch sur redirect()**: Next.js lance NEXT_REDIRECT comme exception, le catch l'interceptait et cassait le flow OAuth
2. **Suspense wrapper pour useSearchParams**: Next.js 16 exige un Suspense boundary pour useSearchParams dans les pages statiques
3. **company.id = auth.uid()**: La company utilise le meme UUID que l'auth user, simplifie les policies RLS
4. **SECURITY DEFINER sur trigger**: Le trigger handle_new_user bypass RLS pour creer la company
5. **Magic link (OTP)**: Methode email par defaut, pas de mot de passe a gerer
6. **linkedin_oidc**: Provider LinkedIn dans Supabase s'appelle linkedin_oidc (pas linkedin)

## Contexte Important
- Supabase project: adtcwtfgbnrcbubmawts (region EU)
- Google OAuth configure dans Google Cloud Console + Supabase Dashboard
- LinkedIn OAuth: code pret mais provider pas encore active dans Supabase
- Le middleware Next.js 16 affiche un warning "deprecated, use proxy" - ignorable
- Le fichier "nul" est un artefact Windows cree par `2>nul` dans bash - supprime et gitignore
- Serveur dev tourne sur port 3001 (3000 occupe)
- Git identity pas configuree (bloque le commit)

## Supabase Dashboard
- Tables creees: companies, contacts, testimonials
- RLS active sur les 3 tables
- Trigger on_auth_user_created actif
- Google provider active
- Redirect URL configuree: http://localhost:3001/auth/callback

## Pour Reprendre
1. Lire ce checkpoint
2. Configurer git user: `git config user.email "email" && git config user.name "nom"`
3. Commit: tout est staged, lancer le commit
4. Continuer avec LinkedIn OAuth ou dashboard enrichi

## Commandes Utiles
```bash
# Naviguer au projet
cd "C:\Users\damie\Documents\claude-workspace\projects\muchlove"

# Lancer le serveur dev
node_modules/.bin/next dev --port 3001

# Verifier TypeScript
npx tsc --noEmit

# Build
npm run build

# Test connexion Supabase
node scripts/test-supabase.mjs

# Configurer git (NECESSAIRE avant commit)
git config user.email "ton@email.com"
git config user.name "dvinprogress"

# Commit (tout est deja staged)
git commit -m "feat: initial setup with Supabase auth"
```
