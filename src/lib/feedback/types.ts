// =============================================================================
// CONFIGURATION
// =============================================================================

export interface FeedbackConfig {
  branding: {
    name: string
    primaryColor: string
    accentColor: string
    gradientFrom: string
    gradientTo: string
  }

  security: {
    turnstile: {
      siteKey: string
      secretKey: string
      mode: "invisible" | "managed"
    }
    rateLimit: {
      windowMs: number
      maxRequests: number
      blockDurationMs: number
    }
    spam: {
      maxUrls: number
      maxRepetition: number
      minContentLength: number
    }
    injection: {
      blockOnDetection: boolean
      scoreThreshold: number
    }
  }

  storage: {
    bucket: string
    maxFileSize: number
    maxFiles: number
    allowedMimeTypes: string[]
  }

  processing: {
    bugAutoTag: boolean
    featureToUserTasks: boolean
    webhookUrl?: string
  }

  api: {
    feedbackEndpoint: string
    uploadEndpoint: string
    adminEndpoint: string
  }
}

// =============================================================================
// SECURITY
// =============================================================================

export interface SecurityCheckResult {
  passed: boolean
  score: number
  flags: SecurityFlag[]
  blockedReason?: string
}

export interface SecurityFlag {
  type: "bot" | "spam" | "injection" | "rate_limit"
  severity: "low" | "medium" | "high" | "critical"
  pattern?: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface RateLimitEntry {
  ipHash: string
  count: number
  firstRequestAt: number
  blockedUntil?: number
}

export interface InjectionPattern {
  regex: RegExp
  weight: number
  description: string
  category: "prompt_manipulation" | "script_injection" | "sql_injection" | "data_exfiltration"
}

// =============================================================================
// DOMAIN
// =============================================================================

export type FeedbackCategory = "bug" | "improvement" | "feature"

export type FeedbackStatus = "new" | "triaged" | "in_progress" | "resolved" | "closed"

export type FeedbackPriority = "low" | "medium" | "high" | "critical"

export type SecurityStatus = "clean" | "flagged" | "blocked"

export interface FeedbackSubmission {
  category: FeedbackCategory
  title: string
  description: string
  visitorEmail?: string
  pageUrl: string
  browserInfo: BrowserInfo
  screenshotIds?: string[]
  turnstileToken: string
  honeypot?: string
}

export interface BrowserInfo {
  userAgent: string
  language: string
  platform: string
  screenWidth: number
  screenHeight: number
  timezone?: string
}

export interface FeedbackRecord {
  id: string
  user_id: string | null
  category: FeedbackCategory
  status: FeedbackStatus
  priority: FeedbackPriority
  title: string
  description: string
  visitor_email: string | null
  page_url: string | null
  user_agent: string | null
  browser_info: Record<string, unknown>
  ip_hash: string
  security_status: SecurityStatus
  security_score: number
  security_flags: SecurityFlag[]
  auto_tags: string[]
  turnstile_validated: boolean
  is_flagged: boolean
  flag_reason: string | null
  created_at: string
  updated_at: string
}

export interface FeedbackScreenshot {
  id: string
  feedback_id: string
  storage_path: string
  original_filename: string | null
  file_size: number | null
  mime_type: string | null
  width: number | null
  height: number | null
  display_order: number
  created_at: string
}

export interface FeedbackWithScreenshots extends FeedbackRecord {
  screenshots: FeedbackScreenshot[]
}

export interface UserFeedbackTask {
  id: string
  feedback_id: string
  title: string
  description: string
  status: "pending" | "reviewed" | "accepted" | "rejected" | "done"
  priority: FeedbackPriority
  created_at: string
  updated_at: string
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface FeedbackWidgetProps {
  position?: "bottom-right" | "bottom-left"
  config: FeedbackConfig
}

export interface CompressedFile {
  file: File
  data: string
  name: string
  type: string
  size: number
  compressedSize: number
  width: number
  height: number
  preview: string
}
