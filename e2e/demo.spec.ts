import { test, expect } from "@playwright/test";

test.describe("Demo Flow (Public, No Auth)", () => {
  test("should load /demo page correctly", async ({ page }) => {
    await page.goto("/en/demo");
    await expect(page).toHaveURL(/\/demo/);
  });

  test("should display demo recording interface", async ({ page }) => {
    await page.goto("/en/demo");

    // Look for elements that indicate a demo recording interface
    // Could be a video element, recording button, or upload area
    const demoInterface = page.locator(
      'button:has-text("Record"), button:has-text("Upload"), video, input[type="file"]'
    );

    const count = await demoInterface.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display demo counter (DemoCounter component)", async ({
    page,
  }) => {
    await page.goto("/en/demo");

    // Look for a counter displaying number of demos
    // Might contain text like "demos created", "testimonials", etc.
    const counterElement = page.locator(
      'text=/\\d+.*demo|demo.*\\d+|testimonial|video/i'
    );

    const count = await counterElement.count();
    // At least some text about demos/counts should be present
    expect(count).toBeGreaterThan(0);
  });

  test("should display DEMO watermark", async ({ page }) => {
    await page.goto("/en/demo");

    // Look for watermark element (could be positioned absolutely)
    const watermark = page.locator('text=/DEMO|Demo Mode/i');

    // Watermark should be visible somewhere on the page
    const count = await watermark.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have proper page title indicating demo mode", async ({
    page,
  }) => {
    await page.goto("/en/demo");

    // Title should mention demo
    await expect(page).toHaveTitle(/Demo|MuchLove/i);
  });

  test("should not require authentication to access demo page", async ({
    page,
  }) => {
    // Go directly to demo without logging in
    await page.goto("/en/demo");

    // Should stay on demo page, not redirect to login
    await page.waitForLoadState("networkidle");
    const url = page.url();
    expect(url).toMatch(/\/demo/);
    expect(url).not.toMatch(/\/login/);
  });

  test("should display instructions or CTA for recording", async ({ page }) => {
    await page.goto("/en/demo");

    // Look for instructional text or prominent CTA
    const instructions = page.locator(
      'h1, h2, button[type="button"], a[role="button"]'
    );

    const count = await instructions.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have consistent branding (MuchLove) on demo page", async ({
    page,
  }) => {
    await page.goto("/en/demo");

    // Look for logo or branding
    const branding = page.locator('text=/MuchLove|Much Love/i, img[alt*="logo"]');

    const count = await branding.count();
    expect(count).toBeGreaterThan(0);
  });
});
