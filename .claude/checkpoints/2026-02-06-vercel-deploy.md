# Checkpoint: vercel-deploy

**Date**: 2026-02-06 17:30
**Session**: Configuration et deploiement Vercel pour muchlove

## Objectif Principal
Configurer Vercel pour le projet muchlove : import repo, env vars, deploiement, domaine custom.

## Progression
- [x] Creer vercel.json (region cdg1, headers securite, Permissions-Policy camera/micro)
- [x] Mettre a jour next.config.ts (images Supabase, serverExternalPackages HuggingFace)
- [x] Completer .env.example (SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_APP_URL)
- [x] Verifier build local (OK, toutes routes generees)
- [x] Se connecter a Vercel via GitHub OAuth
- [x] Importer repo dvinprogress/muchlove (branche master)
- [x] Configurer 4 variables d'environnement sur Vercel
- [x] Deployer (build ~50s, succes)
- [x] Ajouter domaine custom app.muchlove.fr (Production)
- [x] Verifier site live https://muchlove.vercel.app (landing page OK)
- [x] Mettre a jour PROGRESS.md

## Fichiers Modifies
| Fichier | Action | Description |
|---------|--------|-------------|
| vercel.json | cree | Config Vercel: region cdg1, headers securite, cache API no-store |
| next.config.ts | modifie | Ajout images remotePatterns Supabase + serverExternalPackages HuggingFace |
| .env.example | modifie | Ajout SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_APP_URL |
| .claude/PROGRESS.md | modifie | Vercel deploy DONE, CI/CD DONE, domaine custom ajoute |

## Decisions Techniques
1. **Region cdg1 (Paris)** : Proximite avec Supabase EU pour latence minimale
2. **Permissions-Policy camera/micro** : Necessaire pour l'enregistrement video dans le navigateur
3. **NEXT_PUBLIC_APP_URL = muchlove.vercel.app** : Temporaire, sera change en app.muchlove.fr quand le domaine sera achete
4. **serverExternalPackages HuggingFace** : Evite le bundling de @huggingface/transformers cote serveur (transcription)
5. **Legacy service_role key** : Utilisee dans les API routes (upload-video, transcribe) — code existant utilise l'ancien format JWT

## Contexte Important
- Vercel team: dvinprogress-projects (plan Hobby/Free)
- Deployment ID: dpl_9zTP1CSukNTVoywsaaUDYTDRT4by
- Domaine app.muchlove.fr ajoute mais DNS "Invalid Configuration" (normal, domaine pas achete)
- DNS CNAME necessaire: app → 86a8ec8f8d3539fa.vercel-dns-017.com
- CI/CD actif: chaque push sur master declenche un deploy automatique
- Service role key recuperee depuis Supabase Dashboard > Settings > API Keys > Legacy

## Env vars configurees sur Vercel
- NEXT_PUBLIC_SUPABASE_URL (importees depuis .env.local)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (importees depuis .env.local)
- SUPABASE_SERVICE_ROLE_KEY (copiee depuis Supabase Dashboard)
- NEXT_PUBLIC_APP_URL = https://muchlove.vercel.app

## Pour Reprendre
1. Lire ce checkpoint
2. Le site est live sur https://muchlove.vercel.app
3. Prochaines etapes selon PROGRESS.md:
   - Corriger bloquants securite video (#9) — auth API routes
   - Systeme emails (#15) — debloquer invitations contacts
   - Toast system — remplacer alert/confirm
   - SEO + pages legales landing (#16)
   - Acheter domaine muchlove.fr et configurer Cloudflare DNS

## Commandes Utiles
```bash
# Projet
cd c:\Users\damie\Documents\claude-workspace\projects\muchlove

# Build local
npm run build

# Dev
npm run dev

# Tests
npm run test:run

# Git
git push origin master  # Declenche auto-deploy Vercel
```
