import { z } from "zod"

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const browserInfoSchema = z.object({
  userAgent: z.string(),
  language: z.string(),
  platform: z.string(),
  screenWidth: z.number(),
  screenHeight: z.number(),
  timezone: z.string().optional(),
})

export const feedbackSubmissionSchema = z.object({
  category: z.enum(["bug", "improvement", "feature"]),
  title: z
    .string()
    .min(5, "Le titre doit contenir au moins 5 caracteres")
    .max(200, "Le titre ne peut pas depasser 200 caracteres"),
  description: z
    .string()
    .min(20, "La description doit contenir au moins 20 caracteres")
    .max(5000, "La description ne peut pas depasser 5000 caracteres"),
  visitorEmail: z
    .string()
    .email("Email invalide")
    .optional()
    .or(z.literal("")),
  pageUrl: z.string().url().optional(),
  browserInfo: browserInfoSchema.optional(),
  screenshotIds: z.array(z.string().uuid()).max(5).optional(),
  turnstileToken: z.string().min(1, "Token Turnstile requis"),
  honeypot: z.string().max(0, "").optional(),
})

export type FeedbackSubmissionInput = z.infer<typeof feedbackSubmissionSchema>

export const feedbackInputSchema = feedbackSubmissionSchema.omit({
  turnstileToken: true,
  honeypot: true,
})

export type FeedbackInput = z.infer<typeof feedbackInputSchema>

// =============================================================================
// ADMIN SCHEMAS
// =============================================================================

export const feedbackUpdateSchema = z.object({
  status: z.enum(["new", "triaged", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  ai_suggested_category: z.enum(["bug", "improvement", "feature"]).optional(),
  ai_tags: z.array(z.string()).optional(),
  is_flagged: z.boolean().optional(),
  flag_reason: z.string().optional(),
})

export type FeedbackUpdate = z.infer<typeof feedbackUpdateSchema>

// =============================================================================
// QUERY SCHEMAS
// =============================================================================

export const feedbackQuerySchema = z.object({
  status: z.enum(["new", "triaged", "in_progress", "resolved", "closed"]).optional(),
  category: z.enum(["bug", "improvement", "feature"]).optional(),
  securityStatus: z.enum(["clean", "flagged", "blocked"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

export type FeedbackQuery = z.infer<typeof feedbackQuerySchema>

export const feedbackExportQuerySchema = z.object({
  format: z.enum(["json", "csv"]).default("json"),
  status: z.enum(["new", "triaged", "in_progress", "resolved", "closed"]).optional(),
  category: z.enum(["bug", "improvement", "feature"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
})

export type FeedbackExportQuery = z.infer<typeof feedbackExportQuerySchema>
