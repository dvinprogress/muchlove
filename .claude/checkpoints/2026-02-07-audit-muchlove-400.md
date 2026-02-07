# Checkpoint: audit-muchlove-400

**Date**: 2026-02-07
**Session**: Audit end-to-end du flow temoignage client + corrections bugs

## Objectif Principal
Tester et corriger le flow complet d'enregistrement de temoignage video sur https://muchlove.app/fr/t/-r9B6CP-LFJy

## Progression
- [x] Audit etape 1 : Chargement page temoignage → OK
- [x] Audit etape 2 : Autorisation camera + preview → OK
- [x] Audit etape 3 : Enregistrement video (countdown, REC, timer, barre) → OK
- [x] Audit etape 4 : Review (lecteur video, boutons Retake/Validate) → OK
- [x] Fix boucle infinie useEffect dans VideoRecorder (commit 064dcec)
- [x] Fix layout casse Fragment vs wrapper div (commit 17c9889)
- [x] Fix API upload 401 → auth session remplacee par contactId (commit c060cf7)
- [ ] **Diagnostiquer erreur 400 sur POST /api/upload-video** ← ICI
- [ ] Rapport d'audit final + corrections restantes

## Fichiers Modifies (cette session)
| Fichier | Action | Description |
|---------|--------|-------------|
| src/hooks/useMediaRecorder.ts | modifie | Ref pattern pour cleanup, suppression boucle infinie |
| src/components/video/VideoRecorder.tsx | modifie | Wrapper divs, integration Whisper, suppression useEffects problematiques |
| src/components/video/PermissionRequest.tsx | modifie | Simplifie a onRequestPermission prop |
| src/app/api/upload-video/route.ts | modifie | Auth session → contactId + status whitelist |
| src/hooks/useWhisperTranscription.ts | cree | Transcription client-side Whisper via @huggingface/transformers |
| src/lib/validation/video-api.ts | modifie | Ajout champ transcription optionnel |
| messages/{en,fr,es}.json | modifie | Cles traduction transcription |

## Commits effectues
1. `064dcec` - fix(video): resolve infinite loop in testimonial recording page
2. `17c9889` - fix(video): replace Fragment with wrapper div to fix layout
3. `c060cf7` - fix(api): allow unauthenticated contacts to upload testimonial videos

## Decisions Techniques
1. **Ref pattern pour cleanup**: useCallback avec [] deps + refs synchronises, au lieu de deps sur [stream, videoUrl] qui causaient la boucle
2. **Wrapper div vs Fragment**: `<div className="w-full max-w-lg mx-auto">` au lieu de `<>` dans un contexte flex
3. **Auth contactId**: Suppression de getUser() session auth, remplacement par verification contactId + status whitelist ['created', 'invited', 'link_opened', 'video_completed']
4. **Whisper client-side**: Transcription dans le navigateur avec @huggingface/transformers, WebGPU + fallback CPU

## Probleme en cours : Erreur 400 sur Upload

### Contexte
Apres avoir fixe le 401, l'upload retourne maintenant 400. Le flow complet fonctionne jusqu'a la validation.

### Hypotheses (par probabilite)
1. **MIME type vide en Playwright headless** : MediaRecorder produit blob avec type="" → echec validation ALLOWED_MIME_TYPES
2. **Middleware i18n intercepte /api/** : Si le matcher next-intl n'exclut pas /api/
3. **Duration = 0** : Timer pas incremente assez vite en headless
4. **Probleme Playwright-only** : Pas de vrai codec video en headless

### Prochaine action
Capturer le body exact de la reponse 400 pour identifier precisement quelle validation echoue. Verifier aussi le middleware.

## Pour Reprendre
1. Lire ce checkpoint
2. Verifier le middleware (`src/middleware.ts`) pour exclusion /api/
3. Re-tester le flow avec capture du response body du 400
4. Fixer selon le diagnostic
5. Finaliser le rapport d'audit

## Commandes Utiles
```bash
# Verifier le deploiement
cd /c/Users/damie/Documents/claude-workspace/projects/muchlove
git log --oneline -5

# Lien de test
# https://muchlove.app/fr/t/-r9B6CP-LFJy

# Build local
npm run build
```

## Fichiers cles a lire
- `src/app/api/upload-video/route.ts` - API d'upload
- `src/lib/validation/video-api.ts` - Schema Zod + constantes validation
- `src/middleware.ts` - Middleware i18n/auth
- `src/components/video/VideoRecorder.tsx` - Composant principal flow video
- `src/hooks/useMediaRecorder.ts` - Hook enregistrement video
