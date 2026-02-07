# Security Fix: HMAC-Signed Unsubscribe Tokens

**Date**: 2026-02-07
**Severity**: CRITICAL
**Status**: Fixed

## Vulnerability Description

Les tokens de désabonnement (unsubscribe) n'étaient pas signés cryptographiquement. N'importe qui pouvant deviner ou énumérer un `companyId` valide pouvait forger un token base64 et désabonner n'importe quelle company des emails.

### Ancien Format (VULNÉRABLE)
```
Token = base64(companyId:type)
```

### Nouveau Format (SÉCURISÉ)
```
Token = base64url(companyId:type) + '.' + HMAC-SHA256(companyId:type, SECRET)
```

## Fichiers Modifiés

1. **`src/types/automations.ts`** (lignes 165-176)
   - Ajout de l'import `createHmac` depuis `crypto`
   - Modification de `generateUnsubscribeToken()` pour inclure signature HMAC
   - Utilisation de `base64url` au lieu de `base64` (safe pour URLs)

2. **`src/app/api/email/unsubscribe/route.ts`** (lignes 1-100)
   - Ajout des imports `createHmac` et `timingSafeEqual` depuis `crypto`
   - Modification de `decodeUnsubscribeToken()` pour vérifier la signature HMAC
   - Utilisation de `timingSafeEqual()` pour éviter les timing attacks
   - Suppression de la fonction locale `generateUnsubscribeToken()` (version canonique dans `automations.ts`)

3. **`.env.example`**
   - Ajout de la variable `UNSUBSCRIBE_TOKEN_SECRET`

## Configuration Requise

### Variable d'Environnement

Ajouter dans `.env.local` (dev) et Vercel (production) :

```bash
UNSUBSCRIBE_TOKEN_SECRET=<secret-key-here>
```

### Génération du Secret

**Avec OpenSSL (recommandé):**
```bash
openssl rand -base64 32
```

**Avec Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Déploiement Production

1. Générer un secret fort (32+ bytes)
2. L'ajouter dans Vercel: `Settings > Environment Variables`
3. Le secret DOIT être différent entre dev et production
4. Ne JAMAIS committer le secret dans git

## Détails Techniques

### HMAC-SHA256
- Algorithme: SHA-256
- Clé: `UNSUBSCRIBE_TOKEN_SECRET` (env var)
- Input: `${companyId}:${type}` (payload brut)
- Output: hex string (64 caractères)

### Format Token
```
base64url(payload) + '.' + signature_hex
```

Exemple:
```
ZjRiYzEyZDMtNDU2Ny04OTBhLWJjZGUtMTIzNDU2Nzg5MGFiOnNlcXVlbmNlcw.3f8a9b2c1d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e
```

### Timing-Safe Comparison
Utilisation de `timingSafeEqual()` pour comparer les signatures et éviter les timing attacks qui pourraient révéler des informations sur le secret.

## Tests de Validation

### Test 1: Token Valide
```typescript
const token = generateUnsubscribeToken('f4bc12d3-4567-890a-bcde-1234567890ab', 'sequences')
const decoded = decodeUnsubscribeToken(token)
expect(decoded).toEqual({
  companyId: 'f4bc12d3-4567-890a-bcde-1234567890ab',
  type: 'sequences'
})
```

### Test 2: Token Forgé (doit échouer)
```typescript
const forgedPayload = Buffer.from('f4bc12d3-4567-890a-bcde-1234567890ab:marketing', 'utf-8').toString('base64url')
const forgedSignature = 'deadbeef'.repeat(8) // signature invalide
const forgedToken = `${forgedPayload}.${forgedSignature}`
const decoded = decodeUnsubscribeToken(forgedToken)
expect(decoded).toBeNull()
```

### Test 3: Token Sans Signature (doit échouer)
```typescript
const unsignedToken = Buffer.from('f4bc12d3-4567-890a-bcde-1234567890ab:weekly_digest', 'utf-8').toString('base64')
const decoded = decodeUnsubscribeToken(unsignedToken)
expect(decoded).toBeNull()
```

## Compatibilité

### Tokens Existants (Ancien Format)
Les tokens générés AVANT ce fix ne fonctionneront plus. C'est intentionnel pour des raisons de sécurité.

**Impact:**
- Les liens d'unsubscribe dans les emails déjà envoyés deviendront invalides
- Les utilisateurs devront utiliser les nouveaux liens générés après le déploiement
- Alternative: ajouter un fallback temporaire dans `decodeUnsubscribeToken()` pour accepter l'ancien format pendant 30 jours (NON RECOMMANDÉ)

### Rétrocompatibilité (SI NÉCESSAIRE)
Si vous devez absolument supporter les anciens tokens pendant une période de transition, ajouter ce code dans `decodeUnsubscribeToken()`:

```typescript
function decodeUnsubscribeToken(token: string) {
  // Try new format first
  const newFormatResult = decodeWithHMAC(token)
  if (newFormatResult) return newFormatResult

  // Fallback to old format (TEMPORARY - remove after 30 days)
  if (process.env.ALLOW_LEGACY_TOKENS === 'true') {
    return decodeLegacyToken(token)
  }

  return null
}
```

**⚠️ NON RECOMMANDÉ: cela réintroduit la vulnérabilité**

## Checklist de Déploiement

- [ ] Secret généré (32+ bytes)
- [ ] Secret ajouté dans Vercel env vars
- [ ] Code déployé en production
- [ ] Tests validés (tokens valides acceptés, tokens forgés rejetés)
- [ ] Anciens tokens invalides (comportement attendu)
- [ ] Monitoring des erreurs `invalid_token` (spike attendu les premiers jours)

## Migration des Tokens Existants

**Aucune migration nécessaire.** Les nouveaux tokens seront générés automatiquement lors des prochains envois d'emails.

## Références

- [HMAC (RFC 2104)](https://www.rfc-editor.org/rfc/rfc2104)
- [Timing Attacks](https://codahale.com/a-lesson-in-timing-attacks/)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)

---

**Auteur**: Claude Code Orchestrateur
**Validé par**: dvinprogress
