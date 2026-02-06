# Checkpoint: cloudflare-muchlove-app

**Date**: 2026-02-06 18:00
**Session**: Achat domaine muchlove.app + config Cloudflare DNS + Vercel

## Objectif Principal
Configurer le domaine custom pour muchlove : achat domaine, DNS Cloudflare, ajout sur Vercel, mise a jour env vars.

## Progression
- [x] Commit fichiers Vercel (vercel.json, next.config.ts, .env.example) + push master (39c181e)
- [x] Acheter domaine muchlove.app sur Cloudflare ($14.20/an)
- [x] Configurer DNS Cloudflare (A + CNAME vers Vercel)
- [x] Ajouter muchlove.app sur Vercel (Production)
- [x] Mettre a jour NEXT_PUBLIC_APP_URL sur Vercel (https://muchlove.app)
- [x] Redeploy Vercel avec nouvelle env var
- [x] Mettre a jour PROGRESS.md et .env.example

## Fichiers Modifies
| Fichier | Action | Description |
|---------|--------|-------------|
| .claude/PROGRESS.md | modifie | Cloudflare DONE, domaine muchlove.app, DNS records |
| .env.example | modifie | NEXT_PUBLIC_APP_URL change en https://muchlove.app |

## Decisions Techniques
1. **muchlove.app au lieu de muchlove.fr** : Cloudflare ne supporte pas le TLD .fr. muchlove.app est ideal pour un SaaS, HTTPS force nativement, $14.20/an
2. **DNS only (pas de proxy Cloudflare)** : Pour laisser Vercel gerer le SSL et eviter les complications de certificat. Proxy activable plus tard avec SSL Full (Strict)
3. **Domaine racine (pas www)** : Pour un SaaS, muchlove.app est plus clean que www.muchlove.app. Decoche la recommandation Vercel de redirect root → www
4. **A record + CNAME** : A: @ → 76.76.21.21 (Vercel IP) pour apex domain. CNAME: www → cname.vercel-dns.com pour le sous-domaine www

## Contexte Important
- Domaine achete via Cloudflare Registrar (compte visconte.damien@gmail.com)
- Creation Date: 2026-02-06T16:52:59Z, expire Feb 06, 2027
- WHOIS redacte par Cloudflare (vie privee)
- Auto-renew desactive (a activer si souhaite)
- Registrant: Damien Visconte, 1 impasse de la fabrique, Sanssac l'eglise, France
- SSL en cours de generation sur Vercel au moment du checkpoint
- app.muchlove.fr toujours present sur Vercel (Invalid Configuration) — a supprimer
- Vercel team: dvinprogress-projects (Hobby/Free)
- Commit 39c181e pousse, auto-deploy declenche + redeploy manuel pour env var

## DNS Records Cloudflare (muchlove.app)
| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| A | @ (muchlove.app) | 76.76.21.21 | DNS only | Auto |
| CNAME | www | cname.vercel-dns.com | DNS only | Auto |

## Env vars Vercel (4 total)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL = https://muchlove.app (mis a jour)

## Pour Reprendre
1. Lire ce checkpoint
2. Verifier que https://muchlove.app est accessible (SSL OK)
3. Supprimer app.muchlove.fr de Vercel (obsolete)
4. Optionnel : activer proxy Cloudflare + SSL Full (Strict) pour WAF/DDoS
5. Prochaines etapes selon PROGRESS.md:
   - Corriger bloquants securite video (#9)
   - Systeme emails (#15)
   - Toast system
   - SEO + pages legales (#16)

## Commandes Utiles
```bash
# Projet
cd c:\Users\damie\Documents\claude-workspace\projects\muchlove

# Build local
npm run build

# Dev
npm run dev

# Git
git push origin master  # Declenche auto-deploy Vercel

# Verifier DNS
nslookup muchlove.app
nslookup www.muchlove.app
```
