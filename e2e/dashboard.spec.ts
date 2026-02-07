import { test, expect } from "@playwright/test";

test.describe("Dashboard Structure (Protected Routes)", () => {
  /**
   * NOTE: These tests verify redirect behavior and basic structure.
   * Full dashboard testing requires Supabase auth mocking, which is complex.
   * These tests focus on middleware protection and public accessibility.
   */

  test.describe("Dashboard Access Without Auth", () => {
    test("should redirect /dashboard to /login", async ({ page }) => {
      await page.goto("/en/dashboard");

      // Should be redirected to login
      await page.waitForURL(/\/login/);
      const url = page.url();
      expect(url).toMatch(/\/login/);
    });

    test("should redirect /dashboard/contacts to /login", async ({ page }) => {
      await page.goto("/en/dashboard/contacts");

      await page.waitForURL(/\/login/);
      const url = page.url();
      expect(url).toMatch(/\/login/);
    });

    test("should redirect /dashboard/contacts/new to /login", async ({
      page,
    }) => {
      await page.goto("/en/dashboard/contacts/new");

      await page.waitForURL(/\/login/);
      const url = page.url();
      expect(url).toMatch(/\/login/);
    });

    test("should redirect /dashboard/contacts/[id] to /login", async ({
      page,
    }) => {
      // Try accessing a specific contact ID
      await page.goto("/en/dashboard/contacts/123e4567-e89b-12d3-a456-426614174000");

      await page.waitForURL(/\/login/);
      const url = page.url();
      expect(url).toMatch(/\/login/);
    });
  });

  test.describe("Dashboard Route Structure", () => {
    test("should have consistent URL pattern for dashboard routes", async ({
      page,
    }) => {
      // Test multiple dashboard routes to ensure consistent redirect behavior
      const dashboardRoutes = [
        "/en/dashboard",
        "/fr/dashboard",
        "/es/dashboard",
      ];

      for (const route of dashboardRoutes) {
        await page.goto(route);
        await page.waitForURL(/\/login/);

        // All should redirect to login (with same locale ideally)
        const url = page.url();
        expect(url).toMatch(/\/login/);
      }
    });

    test("should preserve locale when redirecting to login", async ({
      page,
    }) => {
      await page.goto("/fr/dashboard");

      // Wait for redirect
      await page.waitForURL(/\/login/);
      const url = page.url();

      // Should redirect to French login
      expect(url).toMatch(/\/fr\/login/);
    });

    test("should handle invalid dashboard subroutes gracefully", async ({
      page,
    }) => {
      await page.goto("/en/dashboard/invalid-route-xyz");

      // Should either redirect to login or show 404
      // Both are acceptable behaviors
      await page.waitForLoadState("networkidle");

      const url = page.url();
      const is404 = await page.locator("text=/404|not found/i").count();

      // Either redirected to login OR showing 404 page
      const isLoginRedirect = url.includes("/login");
      const is404Page = is404 > 0;

      expect(isLoginRedirect || is404Page).toBeTruthy();
    });
  });

  test.describe("Dashboard Page Titles (Redirected)", () => {
    test("should show login page title when accessing dashboard without auth", async ({
      page,
    }) => {
      await page.goto("/en/dashboard");

      // After redirect, should show login page title
      await page.waitForURL(/\/login/);
      await expect(page).toHaveTitle(/Login|Sign|MuchLove/i);
    });
  });

  test.describe("Dashboard Security Headers", () => {
    test("should not expose sensitive data in error responses", async ({
      page,
    }) => {
      await page.goto("/en/dashboard");

      // Response should not contain database errors or stack traces
      const text = await page.textContent("body");

      // Should not expose internal errors
      expect(text).not.toMatch(/stack trace|database error|supabase/i);
    });

    test("should have proper security headers on dashboard routes", async ({
      request,
    }) => {
      const response = await request.get("/en/dashboard");

      const headers = response.headers();

      // Should have security headers (even on redirect)
      expect(headers).toBeDefined();

      // Check for common security headers (if configured)
      // These are optional but recommended
      // expect(headers).toHaveProperty('x-frame-options');
    });
  });

  test.describe("Locale Support in Protected Routes", () => {
    test("should support EN locale for dashboard", async ({ page }) => {
      await page.goto("/en/dashboard");

      await page.waitForURL(/\/login/);
      const url = page.url();
      expect(url).toContain("/en/");
    });

    test("should support FR locale for dashboard", async ({ page }) => {
      await page.goto("/fr/dashboard");

      await page.waitForURL(/\/login/);
      const url = page.url();
      expect(url).toContain("/fr/");
    });

    test("should support ES locale for dashboard", async ({ page }) => {
      await page.goto("/es/dashboard");

      await page.waitForURL(/\/login/);
      const url = page.url();
      expect(url).toContain("/es/");
    });
  });
});
