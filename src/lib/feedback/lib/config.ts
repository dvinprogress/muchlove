import type { FeedbackConfig } from "../types"

export const DEFAULT_FEEDBACK_CONFIG: FeedbackConfig = {
  branding: {
    name: "Feedback",
    primaryColor: "orange",
    accentColor: "amber",
    gradientFrom: "from-orange-500",
    gradientTo: "to-amber-500",
  },

  security: {
    turnstile: {
      siteKey: "",
      secretKey: "",
      mode: "invisible",
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
      blockOnDetection: false,
      scoreThreshold: 0.7,
    },
  },

  storage: {
    bucket: "feedback-screenshots",
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 5,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  },

  processing: {
    bugAutoTag: true,
    featureToUserTasks: true,
  },

  api: {
    feedbackEndpoint: "/api/feedback",
    uploadEndpoint: "/api/feedback/upload",
    adminEndpoint: "/api/feedback/admin",
  },
}

export function createFeedbackConfig(
  overrides: Partial<FeedbackConfig> & { security: { turnstile: { siteKey: string; secretKey: string } } }
): FeedbackConfig {
  return {
    ...DEFAULT_FEEDBACK_CONFIG,
    ...overrides,
    branding: {
      ...DEFAULT_FEEDBACK_CONFIG.branding,
      ...overrides.branding,
    },
    security: {
      ...DEFAULT_FEEDBACK_CONFIG.security,
      ...overrides.security,
      turnstile: {
        ...DEFAULT_FEEDBACK_CONFIG.security.turnstile,
        ...overrides.security.turnstile,
      },
      rateLimit: {
        ...DEFAULT_FEEDBACK_CONFIG.security.rateLimit,
        ...overrides.security?.rateLimit,
      },
      spam: {
        ...DEFAULT_FEEDBACK_CONFIG.security.spam,
        ...overrides.security?.spam,
      },
      injection: {
        ...DEFAULT_FEEDBACK_CONFIG.security.injection,
        ...overrides.security?.injection,
      },
    },
    storage: {
      ...DEFAULT_FEEDBACK_CONFIG.storage,
      ...overrides.storage,
    },
    processing: {
      ...DEFAULT_FEEDBACK_CONFIG.processing,
      ...overrides.processing,
    },
    api: {
      ...DEFAULT_FEEDBACK_CONFIG.api,
      ...overrides.api,
    },
  }
}

export const CATEGORY_CONFIG = {
  bug: {
    label: "Signaler un bug",
    description: "Un probleme technique ou visuel",
    icon: "Bug",
    color: "red",
  },
  improvement: {
    label: "Proposer une amelioration",
    description: "Ameliorer une fonctionnalite existante",
    icon: "Sparkles",
    color: "blue",
  },
  feature: {
    label: "Demander une fonctionnalite",
    description: "Suggerer un nouveau module ou service",
    icon: "Lightbulb",
    color: "amber",
  },
} as const

export const STATUS_CONFIG = {
  new: { label: "Nouveau", color: "gray" },
  triaged: { label: "Trie", color: "blue" },
  in_progress: { label: "En cours", color: "amber" },
  resolved: { label: "Resolu", color: "green" },
  closed: { label: "Ferme", color: "gray" },
} as const

export const PRIORITY_CONFIG = {
  low: { label: "Basse", color: "gray" },
  medium: { label: "Moyenne", color: "blue" },
  high: { label: "Haute", color: "amber" },
  critical: { label: "Critique", color: "red" },
} as const
