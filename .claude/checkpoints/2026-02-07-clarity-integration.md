# Checkpoint: clarity-integration

**Date**: 2026-02-07 10:10
**Session**: Integration Microsoft Clarity + discussion MCP Clarity pour audit UX automatise

## Objectif Principal
Integrer Microsoft Clarity sur MuchLove pour tracker le comportement utilisateur (heatmaps, session recordings, rage clicks) et preparer un workflow d'audit UX automatise via Claude Code.

## Progression
- [x] Discussion strategie Clarity + Claude Code (MCP vs Playwright)
- [x] Connexion au dashboard Clarity via Playwright (compte Google, projet MuchLove vdkjs9lifc)
- [x] Decouverte : Clarity a un serveur MCP officiel (@microsoft/clarity-mcp-server)
- [x] Installation package @microsoft/clarity dans MuchLove
- [x] Creation ClarityProvider component (src/components/providers/ClarityProvider.tsx)
- [x] Integration dans layout locale (src/app/[locale]/layout.tsx)
- [x] Ajout env var dans .env.example et .env.local
- [x] Commit + push (5be12d3 feat(analytics): integrate Microsoft Clarity tracking)
- [x] Ajout NEXT_PUBLIC_CLARITY_PROJECT_ID=vdkjs9lifc sur Vercel env vars
- [ ] Deploy Vercel (bloque par erreurs dashboard Vercel temporaires) <- ICI
- [ ] Verifier que Clarity recoit les donnees apres deploy
- [ ] Configurer le MCP Clarity dans Claude Code (.claude/settings)
- [ ] Creer le skill /ux-audit

## Fichiers Modifies
| Fichier | Action | Description |
|---------|--------|-------------|
| src/components/providers/ClarityProvider.tsx | cree | Composant client, init Clarity via useEffect |
| src/app/[locale]/layout.tsx | modifie | Import + ajout ClarityProvider dans body |
| .env.example | modifie | Ajout NEXT_PUBLIC_CLARITY_PROJECT_ID |
| .env.local | modifie | NEXT_PUBLIC_CLARITY_PROJECT_ID=vdkjs9lifc |
| package.json | modifie | Ajout dep @microsoft/clarity |
| package-lock.json | modifie | Lock file update |

## Fichiers non commites (en attente)
- .claude/PROGRESS.md (modifie)
- src/app/[locale]/layout.tsx (modifie par linter — icons metadata ajoutees)
- src/components/landing/HeroSection.tsx (modifie)
- src/app/[locale]/opengraph-image.tsx (nouveau)
- src/app/apple-icon.tsx (nouveau)
- src/app/icon.svg (nouveau)
- e2e/ fichiers doc (non commites)

## Decisions Techniques
1. **NPM package** au lieu de script tag : Plus propre pour Next.js, typage TS, controle lifecycle
2. **ClarityProvider comme composant client** : Clarity doit s'executer cote client, le layout reste Server Component
3. **Env var NEXT_PUBLIC_CLARITY_PROJECT_ID** : Permet de desactiver le tracking en ne definissant pas la variable, securite par defaut
4. **MCP Clarity plutot que scraping Playwright** : Microsoft fournit un serveur MCP officiel (@microsoft/clarity-mcp-server) — API structuree, plus fiable que scraper le dashboard

## Contexte Important
- Clarity project ID MuchLove : `vdkjs9lifc`
- Compte Clarity connecte via Google (Damien Visconte)
- Le tracking Clarity n'est PAS encore installe cote Clarity (page "Encore quelques etapes")
- Il se configurera automatiquement quand le site deploye enverra les premieres donnees
- Vercel dashboard avait des erreurs intermittentes ("Something went wrong", "Connection closed")
- L'auto-deploy GitHub → Vercel ne se declenchait pas malgre le push — webhook potentiellement desync
- Env var ajoutee avec succes via dashboard Vercel
- Commit vide pousse (29b8e25) pour tenter de re-declencher le webhook

## Pour Reprendre
1. Lire ce checkpoint
2. Verifier si Vercel a finalement deploye (https://vercel.com/dvinprogress-projects/muchlove/deployments)
3. Si pas deploye : redeploy manuel via dashboard Vercel
4. Une fois deploye : visiter app.muchlove.fr et verifier dans Clarity que les donnees arrivent
5. Configurer le MCP Clarity dans la config Claude Code
6. Creer le skill /ux-audit

## Commandes Utiles
```bash
# Verifier l'etat git
cd projects/muchlove && git status && git log --oneline -5

# Build local pour verifier
cd projects/muchlove && npm run build

# Tester en local avec Clarity actif
cd projects/muchlove && npm run dev

# Configurer MCP Clarity (a ajouter dans .claude/settings ou claude_desktop_config.json)
# "mcpServers": {
#   "@microsoft/clarity-mcp-server": {
#     "command": "npx",
#     "args": ["@microsoft/clarity-mcp-server", "--clarity_api_token=TOKEN_A_GENERER"]
#   }
# }
```

## Prochaines Etapes (apres deploy)
1. Generer un API token Clarity (Settings → API dans le dashboard Clarity)
2. Ajouter le MCP server Clarity a la config Claude Code
3. Creer le skill /ux-audit avec workflow : Clarity MCP → analyse → corrections
4. Tester le skill sur les premieres donnees
