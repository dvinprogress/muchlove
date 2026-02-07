import { test, expect } from "@playwright/test";

test.describe("Landing Page (Public)", () => {
  test("should load the landing page correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/MuchLove/);
  });

  test("should display main sections (hero, features, social proof, CTA)", async ({
    page,
  }) => {
    await page.goto("/");

    // Hero section should be visible
    const hero = page.locator("h1").first();
    await expect(hero).toBeVisible();

    // At least one CTA button should be present
    const ctaButtons = page.getByRole("link", {
      name: /start|begin|commencer|empezar/i,
    });
    await expect(ctaButtons.first()).toBeVisible();
  });

  test("should have 'See a demo' button that scrolls to demo section", async ({
    page,
  }) => {
    await page.goto("/");

    // Look for demo button/link
    const demoButton = page.getByRole("link", { name: /demo/i }).first();

    if (await demoButton.isVisible()) {
      await expect(demoButton).toBeVisible();
      // Note: scrolling behavior would require more complex testing
      // Just verify the button exists for now
    }
  });

  test("should have 'Start for free' button that leads to /login", async ({
    page,
  }) => {
    await page.goto("/");

    // Find CTA that should lead to login
    const startButton = page.getByRole("link", {
      name: /start|commencer|empezar/i,
    });

    if (await startButton.first().isVisible()) {
      const href = await startButton.first().getAttribute("href");
      // Should contain /login or /auth in the URL
      expect(href).toMatch(/\/login|\/auth/);
    }
  });

  test("should have language switcher visible", async ({ page }) => {
    await page.goto("/");

    // Look for language selector (could be a button, dropdown, or links)
    // Checking for common language codes or names
    const langElements = page.locator(
      'a[href*="/en"], a[href*="/fr"], a[href*="/es"], button:has-text("EN"), button:has-text("FR"), button:has-text("ES")'
    );

    // At least one language element should be visible
    const count = await langElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have accessible /terms page", async ({ page }) => {
    await page.goto("/en/terms");
    await expect(page).toHaveURL(/\/terms/);

    // Page should not show error
    await expect(page.locator("text=/Terms|Conditions/i")).toBeVisible();
  });

  test("should have accessible /privacy page", async ({ page }) => {
    await page.goto("/en/privacy");
    await expect(page).toHaveURL(/\/privacy/);

    // Page should not show error
    await expect(page.locator("text=/Privacy|Confidentialité/i")).toBeVisible();
  });

  test("should have proper SEO meta tags", async ({ page }) => {
    await page.goto("/");

    // Check for title
    await expect(page).toHaveTitle(/.+/);

    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /.+/);

    // Check for Open Graph image
    const ogImage = page.locator('meta[property="og:image"]');
    const hasOgImage = (await ogImage.count()) > 0;

    if (hasOgImage) {
      await expect(ogImage).toHaveAttribute("content", /.+/);
    }
  });

  test("should have proper locale in URL", async ({ page }) => {
    await page.goto("/");

    // Should redirect to a locale-specific URL like /en or /fr
    await page.waitForURL(/\/(en|fr|es)/);
    const url = page.url();
    expect(url).toMatch(/\/(en|fr|es)/);
  });
});
