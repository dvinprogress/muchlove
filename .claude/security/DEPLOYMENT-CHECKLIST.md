# Checklist de Déploiement - Security Fix: Unsubscribe Tokens

**Date**: 2026-02-07
**Vulnérabilité**: Tokens unsubscribe non signés (CRITICAL)
**Status**: Code prêt, en attente de déploiement

---

## Étapes de Déploiement

### 1. Configuration Local (.env.local)

```bash
# Générer un secret (choisir une méthode)
openssl rand -base64 32
# OU
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Ajouter dans `.env.local`:
```bash
UNSUBSCRIBE_TOKEN_SECRET=<votre-secret-genere>
```

**Important**: Ne JAMAIS committer ce secret dans git.

---

### 2. Configuration Production (Vercel)

1. Aller dans Vercel Dashboard > Project Settings > Environment Variables
2. Ajouter une nouvelle variable:
   - **Name**: `UNSUBSCRIBE_TOKEN_SECRET`
   - **Value**: (générer un nouveau secret, différent de dev)
   - **Environment**: Production, Preview, Development (selon besoins)
3. Sauvegarder

**⚠️ Utiliser un secret DIFFÉRENT pour production et dev**

---

### 3. Tests Locaux

```bash
# Définir le secret dans l'environnement
export UNSUBSCRIBE_TOKEN_SECRET="test-secret-key"

# OU pour Windows PowerShell
$env:UNSUBSCRIBE_TOKEN_SECRET="test-secret-key"

# Lancer les tests
npm run test src/types/__tests__/automations.test.ts

# Lancer le dev server
npm run dev
```

**Vérifications**:
- [ ] Dev server démarre sans erreur
- [ ] Tests unitaires passent (7/7)
- [ ] Génération de token fonctionne
- [ ] Vérification de token fonctionne

---

### 4. Tests API Route

Tester manuellement la route `/api/email/unsubscribe`:

```bash
# 1. Générer un token (depuis Node.js REPL ou test script)
node -e "
const {createHmac} = require('crypto');
const secret = 'test-secret-key';
const payload = 'f4bc12d3-4567-890a-bcde-1234567890ab:sequences';
const signature = createHmac('sha256', secret).update(payload).digest('hex');
const token = Buffer.from(payload, 'utf-8').toString('base64url') + '.' + signature;
console.log('Token:', token);
"

# 2. Tester la route (remplacer <TOKEN> par le token généré)
curl "http://localhost:3000/api/email/unsubscribe?token=<TOKEN>"
```

**Résultat attendu**: Redirection vers `/unsubscribe?success=true`

**Test token invalide**:
```bash
curl "http://localhost:3000/api/email/unsubscribe?token=invalid.deadbeef"
```

**Résultat attendu**: Redirection vers `/unsubscribe?error=invalid_token`

---

### 5. Déploiement Production

```bash
# Commit des changements
git add src/types/automations.ts
git add src/app/api/email/unsubscribe/route.ts
git add .env.example
git add src/types/__tests__/automations.test.ts
git add .claude/security/

git commit -m "fix(security): add HMAC signature to unsubscribe tokens

CRITICAL: Prevent token forgery attacks on unsubscribe functionality.

- Add HMAC-SHA256 signature to all unsubscribe tokens
- Use timing-safe comparison to prevent timing attacks
- Switch to base64url encoding (URL-safe)
- Add UNSUBSCRIBE_TOKEN_SECRET environment variable
- Remove local generateUnsubscribeToken() in route.ts (use canonical version)

Breaking change: Old tokens (generated before this fix) will no longer work.
This is intentional for security reasons.

Tests: Added 7 unit tests (security + functionality)
"

# Push vers remote
git push origin main
```

**Vercel déploiera automatiquement**

---

### 6. Post-Déploiement

**Immédiatement après déploiement**:
- [ ] Vérifier que le build Vercel est vert
- [ ] Tester la route `/api/email/unsubscribe` en production avec un token généré
- [ ] Vérifier les logs Vercel pour détecter des erreurs

**Dans les 24h**:
- [ ] Monitorer les logs d'erreur `invalid_token` (spike attendu les premiers jours)
- [ ] Vérifier que les nouveaux emails générés contiennent des tokens signés

**Dans la semaine**:
- [ ] Confirmer que les métriques d'unsubscribe sont stables
- [ ] Vérifier qu'aucun token forgé n'a été détecté

---

### 7. Rollback (si nécessaire)

**Si problème critique en production**:

1. **Rollback Vercel** (immédiat):
   - Vercel Dashboard > Deployments > Previous deployment > Promote to Production

2. **Rollback code** (si nécessaire):
```bash
git revert HEAD
git push origin main
```

3. **Supprimer la variable d'env**:
   - Vercel Dashboard > Environment Variables > Delete `UNSUBSCRIBE_TOKEN_SECRET`

---

## Vérifications de Sécurité

### Test 1: Token Valide Accepté
```bash
✅ Token généré avec le secret → accepté
✅ Redirection vers /unsubscribe?success=true
✅ Préférences email mises à jour en DB
```

### Test 2: Token Forgé Rejeté
```bash
✅ Token avec signature invalide → rejeté
✅ Redirection vers /unsubscribe?error=invalid_token
✅ Aucune modification en DB
```

### Test 3: Token Sans Signature Rejeté
```bash
✅ Token au format base64 simple (ancien format) → rejeté
✅ Redirection vers /unsubscribe?error=invalid_token
```

### Test 4: Token Expiré / Manipulation
```bash
✅ Token avec payload modifié → signature ne match plus → rejeté
✅ Token avec timestamp manipulé → signature ne match plus → rejeté
```

---

## Impact Utilisateurs

### Tokens Existants (Anciens Emails)
- ❌ Les liens d'unsubscribe dans les emails envoyés AVANT ce fix ne fonctionneront plus
- ⚠️ Les utilisateurs verront un message "Token invalide"
- ✅ Les nouveaux emails auront des liens valides

### Mitigation
- Afficher un message clair sur `/unsubscribe?error=invalid_token`:
  > "This unsubscribe link has expired. Please contact us directly to update your email preferences."

- Fournir un formulaire de contact ou un lien direct pour gérer les préférences

---

## Monitoring

**Métriques à surveiller** (Vercel Analytics / Logs):
- Nombre de requêtes `/api/email/unsubscribe` avec erreur `invalid_token`
- Taux de succès vs échecs (attendu: spike d'échecs les premiers jours, puis normalisation)
- Erreurs 500 (ne devrait pas augmenter)

**Alertes à configurer**:
- Si taux d'erreur `invalid_token` > 50% après 7 jours → investiguer
- Si erreurs 500 sur `/api/email/unsubscribe` → problème avec le secret ou la logique

---

## Contacts

- **Developer**: dvinprogress
- **Claude Code Orchestrateur**: Assistance technique
- **Documentation**: `.claude/security/SECURITY-FIX-unsubscribe-tokens.md`

---

**Dernière mise à jour**: 2026-02-07
