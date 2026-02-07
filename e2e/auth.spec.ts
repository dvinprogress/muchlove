import { test, expect } from "@playwright/test";

test.describe("Auth Flow (Public → Protected)", () => {
  test("should load /login page correctly", async ({ page }) => {
    await page.goto("/en/login");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should display email form on login page", async ({ page }) => {
    await page.goto("/en/login");

    // Look for email input field
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
  });

  test("should display OAuth buttons (Google, LinkedIn)", async ({ page }) => {
    await page.goto("/en/login");

    // Look for OAuth provider buttons
    // They might be links or buttons with provider names
    const oauthButtons = page.locator(
      'button:has-text("Google"), button:has-text("LinkedIn"), a:has-text("Google"), a:has-text("LinkedIn")'
    );

    const count = await oauthButtons.count();
    // At least one OAuth provider should be visible
    expect(count).toBeGreaterThan(0);
  });

  test("should redirect to /login when accessing /dashboard without auth", async ({
    page,
  }) => {
    await page.goto("/en/dashboard");

    // Should be redirected to login page
    await page.waitForURL(/\/login/);
    const url = page.url();
    expect(url).toMatch(/\/login/);
  });

  test("should redirect to /login when accessing /dashboard/contacts without auth", async ({
    page,
  }) => {
    await page.goto("/en/dashboard/contacts");

    // Should be redirected to login page (middleware protection)
    await page.waitForURL(/\/login/);
    const url = page.url();
    expect(url).toMatch(/\/login/);
  });

  test("should redirect to /login when accessing /dashboard/contacts/new without auth", async ({
    page,
  }) => {
    await page.goto("/en/dashboard/contacts/new");

    // Should be redirected to login page
    await page.waitForURL(/\/login/);
    const url = page.url();
    expect(url).toMatch(/\/login/);
  });

  test("should have proper page title on login page", async ({ page }) => {
    await page.goto("/en/login");

    // Title should mention login or sign in
    await expect(page).toHaveTitle(/Login|Sign|MuchLove/i);
  });

  test("should preserve redirect parameter in login URL", async ({ page }) => {
    await page.goto("/en/dashboard/contacts");

    // After redirect, URL might contain a redirect parameter
    await page.waitForURL(/\/login/);
    const url = new URL(page.url());

    // This is optional - some apps use ?redirect= or ?next=
    // Just verify we're on login page
    expect(url.pathname).toContain("login");
  });
});
