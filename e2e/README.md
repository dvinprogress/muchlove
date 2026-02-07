# Tests End-to-End - MuchLove

Tests Playwright pour les flows critiques de l'application MuchLove.

## Structure

```
e2e/
├── landing.spec.ts      # Landing page (hero, SEO, navigation, locale)
├── auth.spec.ts         # Auth flow (login, redirections middleware)
├── demo.spec.ts         # Demo mode (public, sans auth)
├── widget-api.spec.ts   # Widget API publique (endpoints, validation)
└── dashboard.spec.ts    # Dashboard (redirections, protection routes)
```

## Commandes

```bash
# Lancer tous les tests (démarre automatiquement le serveur Next.js)
npm run e2e

# Lancer les tests en mode UI (interface visuelle)
npm run e2e:ui

# Lancer un fichier spécifique
npx playwright test e2e/landing.spec.ts

# Lancer en mode debug
npx playwright test --debug

# Générer un rapport HTML
npx playwright show-report
```

## Configuration

- **Base URL**: `http://localhost:3000` (configuré dans `playwright.config.ts`)
- **Browser**: Chromium uniquement (optimisé pour la vitesse)
- **Retries**: 1 retry en local, 2 en CI
- **Auto-start**: Le serveur Next.js démarre automatiquement via `npm run dev`

## Flows Testés

### 1. Landing Page (Public)
- Chargement page d'accueil
- Sections principales visibles (hero, features, CTA)
- Navigation vers /login et /demo
- Language switcher (EN/FR/ES)
- Pages légales (/terms, /privacy)
- Meta SEO (title, description, og:image)
- Redirection vers locale

### 2. Auth Flow
- Page /login accessible
- Formulaire email visible
- Boutons OAuth (Google, LinkedIn)
- Middleware protection : /dashboard → /login
- Préservation de la locale dans les redirections

### 3. Demo Flow
- Page /demo accessible sans auth
- Interface d'enregistrement visible
- Compteur de démos (DemoCounter)
- Watermark DEMO présent
- Pas de redirection vers /login

### 4. Widget API
- `GET /api/widget/testimonials` : 401 sans api_key
- `GET /api/demo/count` : retourne JSON avec count
- `POST /api/demo/capture-email` : validation email
- Headers Content-Type corrects

### 5. Dashboard Structure
- Redirections vers /login sans auth
- Préservation de la locale
- Gestion des routes invalides
- Headers de sécurité

## Limitations Actuelles

### Auth Mocking
Les tests dashboard sont limités aux redirections car mocker Supabase auth est complexe.

**Pour tester les flows authentifiés** :
1. Option 1 : Utiliser Supabase Test Helpers (à configurer)
2. Option 2 : Créer un compte de test et utiliser les credentials
3. Option 3 : Mocker les cookies/session manuellement

### Tests à Ajouter (Futur)

Avec auth mocking :
- [ ] Dashboard home : widgets, stats, onboarding
- [ ] Contacts list : tableau, pagination, filtres
- [ ] Contact creation : formulaire, validation
- [ ] Contact detail : affichage, édition, suppression
- [ ] Video recording flow complet
- [ ] Upload flow avec progress
- [ ] Widget configuration et preview

Sans auth :
- [x] Landing page et navigation
- [x] Demo mode basique
- [x] API publique (widget, demo counter)
- [x] Middleware redirections

## Débogage

### Erreurs Communes

**Port 3000 déjà utilisé** :
```bash
# Arrêter le serveur existant ou changer le port dans playwright.config.ts
```

**Tests qui timeout** :
```bash
# Augmenter le timeout dans le test
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 secondes
  // ...
});
```

**Sélecteurs qui ne trouvent pas les éléments** :
```bash
# Lancer en mode debug pour inspecter la page
npx playwright test --debug e2e/landing.spec.ts
```

### Mode Headless vs Headed

Par défaut, les tests s'exécutent en mode headless (pas de fenêtre visible).

Pour voir le navigateur :
```bash
npx playwright test --headed
```

Pour ralentir l'exécution :
```bash
npx playwright test --headed --slow-mo=1000
```

## CI/CD

En environnement CI, la config utilise :
- 2 retries (vs 1 en local)
- 1 worker (parallélisme désactivé)
- `forbidOnly: true` (empêche `.only()`)

Exemple GitHub Actions :
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run e2e
  env:
    CI: true
```

## Ressources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
