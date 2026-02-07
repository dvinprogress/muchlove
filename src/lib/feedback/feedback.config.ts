import { createFeedbackConfig } from "./lib/config"

export const feedbackConfig = createFeedbackConfig({
  branding: {
    name: "MuchLove",
    primaryColor: "violet",
    accentColor: "purple",
    gradientFrom: "from-violet-500",
    gradientTo: "to-purple-500",
  },
  security: {
    turnstile: {
      siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
      secretKey: process.env.TURNSTILE_SECRET_KEY || "",
      mode: "invisible" as const,
    },
    rateLimit: {
      windowMs: 60_000,
      maxRequests: 3,
      blockDurationMs: 300_000,
    },
    spam: {
      maxUrls: 2,
      maxRepetition: 10,
      minContentLength: 10,
    },
    injection: {
      blockOnDetection: true,
      scoreThreshold: 0.7,
    },
  },
  processing: {
    bugAutoTag: true,
    featureToUserTasks: true,
  },
})
