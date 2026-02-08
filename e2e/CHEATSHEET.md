# Playwright E2E - Cheatsheet

Commandes rapides pour les tests E2E MuchLove.

---

## Execution

### Basique

```bash
# Tous les tests
npm run e2e

# Tests en parallele (plus rapide)
npm run e2e -- --workers=4

# Fichier specifique
npx playwright test e2e/landing.spec.ts

# Test specifique (par nom)
npx playwright test -g "should load the landing page"
```

---

### Modes d'Execution

```bash
# Mode UI (interface visuelle recommandee)
npm run e2e:ui

# Mode headed (voir le navigateur)
npx playwright test --headed

# Mode debug (pause et inspect)
npx playwright test --debug

# Slow motion (ralentir pour voir)
npx playwright test --headed --slow-mo=1000
```

---

### Filtres

```bash
# Tous les tests landing
npx playwright test landing

# Tous les tests auth
npx playwright test auth

# Exclude un fichier
npx playwright test --grep-invert "dashboard"

# Tests qui matchent un pattern
npx playwright test --grep "should redirect"
```

---

## Rapports

```bash
# Generer rapport HTML
npx playwright test --reporter=html

# Afficher le dernier rapport
npx playwright show-report

# Rapport JSON (pour CI)
npx playwright test --reporter=json

# Rapport avec traces
npx playwright test --trace on
```

---

## Debugging

```bash
# Inspector Playwright
npx playwright test --debug

# Ouvrir le dernier trace
npx playwright show-trace trace.zip

# Generer trace uniquement sur echec
npx playwright test --trace on-first-retry

# Screenshot sur echec (deja active par defaut)
npx playwright test --screenshot only-on-failure
```

---

## Codegen (Generer du Code)

```bash
# Ouvrir codegen pour enregistrer des actions
npx playwright codegen http://localhost:3000

# Codegen avec device emulation
npx playwright codegen --device="iPhone 13" http://localhost:3000

# Codegen avec auth (cookies existants)
npx playwright codegen --load-storage=auth.json http://localhost:3000
```

---

## Configuration

```bash
# Lister les projets disponibles
npx playwright test --list

# Tester sur un projet specifique
npx playwright test --project=chromium

# Mettre a jour les snapshots
npx playwright test --update-snapshots

# Installer les browsers
npx playwright install
```

---

## CI/CD

```bash
# Mode CI (2 retries, 1 worker)
CI=true npm run e2e

# Ne pas lancer le serveur (deja running)
npx playwright test --no-server

# Timeout custom
npx playwright test --timeout=60000
```

---

## Utilitaires

```bash
# Compter les tests
grep -r "test(" e2e/*.spec.ts | wc -l

# Voir les lignes de code
find e2e -name "*.spec.ts" -exec wc -l {} + | tail -1

# Verifier TypeScript
npx tsc --noEmit e2e/*.spec.ts --skipLibCheck

# Lancer le helper script
./e2e/run-tests.sh --ui
./e2e/run-tests.sh --debug
./e2e/run-tests.sh --headed
```

---

## Patterns de Test Courants

### Navigation

```typescript
await page.goto("/en/dashboard");
await page.waitForURL(/\/login/);
```

### Selecteurs

```typescript
// Par role (recommande)
await page.getByRole("button", { name: "Submit" });
await page.getByRole("link", { name: /start|commencer/i });

// Par texte
await page.getByText("Welcome");
await page.locator("text=/Welcome|Bienvenue/i");

// Par test ID
await page.getByTestId("submit-button");

// Par locator
await page.locator('button[type="submit"]');
```

### Assertions

```typescript
// URL
await expect(page).toHaveURL(/\/login/);

// Title
await expect(page).toHaveTitle(/MuchLove/);

// Element visible
await expect(page.getByRole("button")).toBeVisible();

// Texte
await expect(page.locator("h1")).toContainText("Welcome");

// Attribut
await expect(link).toHaveAttribute("href", "/login");

// Count
const buttons = page.getByRole("button");
expect(await buttons.count()).toBeGreaterThan(0);
```

### API Testing

```typescript
// GET request
const response = await request.get("/api/demo/count");
expect(response.status()).toBe(200);

// POST request
const response = await request.post("/api/demo/capture-email", {
  data: { email: "test@example.com" },
});

// JSON response
const body = await response.json();
expect(body).toHaveProperty("count");

// Headers
const contentType = response.headers()["content-type"];
expect(contentType).toContain("application/json");
```

---

## Variables d'Environnement

```bash
# Base URL custom
BASE_URL=http://localhost:4000 npm run e2e

# Headless off
HEADLESS=false npm run e2e

# Browser specifique
BROWSER=firefox npm run e2e

# CI mode
CI=true npm run e2e
```

---

## Troubleshooting

### Port deja utilise

```bash
# Arreter le serveur Next.js
lsof -ti:3000 | xargs kill -9

# Ou utiliser un port different
PORT=3001 npm run dev
# Puis mettre a jour playwright.config.ts
```

### Tests qui timeout

```typescript
// Augmenter le timeout pour un test specifique
test("slow test", async ({ page }) => {
  test.setTimeout(60000); // 60s
  // ...
});
```

### Selecteurs qui ne trouvent pas

```bash
# Mode debug pour inspecter
npx playwright test --debug e2e/landing.spec.ts

# Voir les selecteurs disponibles
npx playwright codegen http://localhost:3000
```

### Flaky tests (faux negatifs)

```typescript
// Attendre un etat stable
await page.waitForLoadState("networkidle");

// Retry automatique (deja configure a 1)
// Voir playwright.config.ts : retries: 1
```

---

## Scripts Helper

```bash
# Mode UI
./e2e/run-tests.sh --ui

# Mode debug
./e2e/run-tests.sh --debug

# Mode headed
./e2e/run-tests.sh --headed

# Fichier specifique
./e2e/run-tests.sh --file=e2e/landing.spec.ts
```

---

## Ressources

- [Playwright Docs](https://playwright.dev)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [API Testing](https://playwright.dev/docs/api-testing)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

**Derniere MAJ** : 2026-02-07
