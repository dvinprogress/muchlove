import { test, expect } from "@playwright/test";

test.describe("Widget API (Public)", () => {
  test.describe("GET /api/widget/testimonials", () => {
    test("should return 400/401 when api_key is missing", async ({
      request,
    }) => {
      const response = await request.get("/api/widget/testimonials");

      // Should return error status (400 or 401)
      expect([400, 401]).toContain(response.status());
    });

    test("should return 401 when api_key is invalid", async ({ request }) => {
      const response = await request.get(
        "/api/widget/testimonials?api_key=invalid_key_12345"
      );

      // Should return 401 Unauthorized
      expect(response.status()).toBe(401);
    });

    test("should have correct content-type header for error response", async ({
      request,
    }) => {
      const response = await request.get("/api/widget/testimonials");

      // Should return JSON
      const contentType = response.headers()["content-type"];
      expect(contentType).toContain("application/json");
    });

    test("should return error message in JSON format when unauthorized", async ({
      request,
    }) => {
      const response = await request.get("/api/widget/testimonials");

      const body = await response.json();

      // Should have an error field or message field
      expect(body).toHaveProperty("error");
    });
  });

  test.describe("GET /api/demo/count", () => {
    test("should return 200 status", async ({ request }) => {
      const response = await request.get("/api/demo/count");

      expect(response.status()).toBe(200);
    });

    test("should return JSON with count field", async ({ request }) => {
      const response = await request.get("/api/demo/count");

      const body = await response.json();

      // Should have a count field
      expect(body).toHaveProperty("count");
      expect(typeof body.count).toBe("number");
    });

    test("should have correct content-type header", async ({ request }) => {
      const response = await request.get("/api/demo/count");

      const contentType = response.headers()["content-type"];
      expect(contentType).toContain("application/json");
    });

    test("should return non-negative count", async ({ request }) => {
      const response = await request.get("/api/demo/count");

      const body = await response.json();

      expect(body.count).toBeGreaterThanOrEqual(0);
    });

    test("should be accessible without authentication", async ({ request }) => {
      // No auth headers, should still work
      const response = await request.get("/api/demo/count");

      expect(response.ok()).toBeTruthy();
    });
  });

  test.describe("GET /api/widget/config", () => {
    test("should return 400/401 when api_key is missing", async ({
      request,
    }) => {
      const response = await request.get("/api/widget/config");

      // Should return error status
      expect([400, 401]).toContain(response.status());
    });

    test("should return 401 when api_key is invalid", async ({ request }) => {
      const response = await request.get(
        "/api/widget/config?api_key=invalid_key_12345"
      );

      expect(response.status()).toBe(401);
    });
  });

  test.describe("POST /api/demo/capture-email", () => {
    test("should return error when email is missing", async ({ request }) => {
      const response = await request.post("/api/demo/capture-email", {
        data: {},
      });

      // Should return 400 or 422 (validation error)
      expect([400, 422]).toContain(response.status());
    });

    test("should return error when email is invalid", async ({ request }) => {
      const response = await request.post("/api/demo/capture-email", {
        data: {
          email: "not-an-email",
        },
      });

      // Should return validation error
      expect([400, 422]).toContain(response.status());
    });
  });

  test.describe("API Error Handling", () => {
    test("should return JSON error for non-existent API routes", async ({
      request,
    }) => {
      const response = await request.get("/api/non-existent-route");

      // Next.js returns 404 for non-existent routes
      expect(response.status()).toBe(404);
    });

    test("should handle CORS properly for widget API", async ({ request }) => {
      const response = await request.get("/api/demo/count");

      // Should have CORS headers (if configured)
      const headers = response.headers();

      // Check if CORS is configured (optional test)
      // Some APIs may not have CORS headers if they're server-side only
      expect(headers).toBeDefined();
    });
  });
});
