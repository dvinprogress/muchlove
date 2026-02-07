# Checkpoint: clarity-integration

**Date**: 2026-02-07 12:45
**Session**: Integration Microsoft Clarity — TERMINEE

## Statut: DONE

Clarity est **live** sur muchlove.app. Le tracking fonctionne (tag charge, script init, donnees envoyees a y.clarity.ms/collect).

## Ce qui a ete fait
- [x] Integration Microsoft Clarity (ClarityProvider, package @microsoft/clarity)
- [x] Env var NEXT_PUBLIC_CLARITY_PROJECT_ID=vdkjs9lifc sur Vercel
- [x] Reconnexion Git Vercel (webhook etait manquant — disconnect/reconnect)
- [x] Auth Vercel CLI (vercel login via OAuth device flow)
- [x] Deploy production via dashboard Vercel (redeploy sans cache)
- [x] Verification Clarity actif : tag vdkjs9lifc charge, script clarity.js 0.8.53, 4x POST y.clarity.ms/collect 204
- [x] Fix cron vercel.json : 0 * * * * (horaire) → 0 8 * * * (journalier) pour plan Hobby
- [x] Commit + push (d9688f8)

## Problemes resolus
1. **Webhook GitHub manquant** : `gh api repos/dvinprogress/muchlove/hooks` retournait `[]`. Resolu par disconnect/reconnect Git dans Vercel settings.
2. **Env var perdue** : NEXT_PUBLIC_CLARITY_PROJECT_ID disparue apres disconnect Git. Re-ajoutee manuellement.
3. **Cron incompatible Hobby** : `0 * * * *` bloquait le deploy CLI. Corrige en `0 8 * * *`.
4. **Vercel CLI non auth** : Login via OAuth device flow + autorisation Playwright.

## Prochaines etapes (non faites)
1. Generer un API token Clarity (Settings → API dans le dashboard Clarity)
2. Configurer le MCP Clarity dans Claude Code (.claude/settings)
3. Creer le skill /ux-audit

## Commits
- d5cdba7 chore: trigger deploy after Vercel Git reconnection
- d9688f8 fix(deploy): change cron to daily for Hobby plan compatibility
