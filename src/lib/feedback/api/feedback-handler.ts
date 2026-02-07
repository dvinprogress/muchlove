import type { FeedbackConfig, SecurityFlag, SecurityStatus } from "../types"
import { feedbackSubmissionSchema } from "../lib/schemas"
import { checkAntiBot } from "../lib/security/anti-bot"
import { checkRateLimit, getClientIp, hashIp } from "../lib/security/rate-limiter"
import { checkAntiSpam } from "../lib/security/anti-spam"
import { checkAntiInjection } from "../lib/security/anti-injection"
import { sanitizeFeedback } from "../lib/security/sanitize"
import { runProcessingPipeline } from "../lib/processing/pipeline"

/**
 * Factory pour le handler POST /api/feedback
 *
 * Orchestre les 8 layers de securite :
 * 1. Anti-Bot (Turnstile + Honeypot)
 * 2. Rate Limiting
 * 3. Validation Zod
 * 4. Anti-Spam
 * 5. Anti-Injection
 * 6. Sanitization
 * 7. Storage Supabase
 * 8. Processing Pipeline (fire-and-forget)
 *
 * @param config - Configuration du module feedback
 * @param supabaseFactory - Factory pour creer un client Supabase
 * @returns Handler compatible Next.js Route Handler
 */
export function createFeedbackHandler(
  config: FeedbackConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseFactory: () => Promise<any>
) {
  return async (request: Request): Promise<Response> => {
    try {
      const body = await request.json()
      const ip = getClientIp(request)
      const ipHash = await hashIp(ip)

      // ========================================================================
      // LAYER 1: Anti-Bot (Turnstile + Honeypot)
      // ========================================================================
      const botCheck = await checkAntiBot(
        { turnstileToken: body.turnstileToken || "", honeypot: body.honeypot },
        config
      )
      if (!botCheck.passed) {
        return Response.json({ error: "Verification anti-bot echouee" }, { status: 403 })
      }

      // ========================================================================
      // LAYER 2: Rate Limiting
      // ========================================================================
      const rateCheck = await checkRateLimit(ipHash, config)
      if (!rateCheck.passed) {
        return Response.json(
          { error: "Trop de requetes. Reessayez plus tard." },
          { status: 429, headers: { "Retry-After": String(config.security.rateLimit.blockDurationMs / 1000) } }
        )
      }

      // ========================================================================
      // LAYER 3: Validation Zod
      // ========================================================================
      const validation = feedbackSubmissionSchema.safeParse(body)
      if (!validation.success) {
        return Response.json(
          { error: "Donnees invalides", details: validation.error.flatten() },
          { status: 400 }
        )
      }

      // ========================================================================
      // LAYER 4: Anti-Spam
      // ========================================================================
      const spamCheck = checkAntiSpam(validation.data, config)

      // ========================================================================
      // LAYER 5: Anti-Injection
      // ========================================================================
      const injectionCheck = checkAntiInjection(validation.data, config)

      // Aggregate security results
      const allFlags: SecurityFlag[] = [
        ...botCheck.flags,
        ...spamCheck.flags,
        ...injectionCheck.flags,
      ]
      const avgScore = (botCheck.score + spamCheck.score + injectionCheck.score) / 3
      const securityStatus: SecurityStatus =
        avgScore >= 0.9 ? "clean" : avgScore >= 0.5 ? "flagged" : "blocked"

      // Block if threshold not met and config says block
      if (securityStatus === "blocked" && config.security.injection.blockOnDetection) {
        return Response.json({ error: "Contenu bloque par les filtres de securite" }, { status: 403 })
      }

      // ========================================================================
      // LAYER 6: Sanitize
      // ========================================================================
      const sanitized = sanitizeFeedback(validation.data)

      // ========================================================================
      // LAYER 7: Store in Supabase
      // ========================================================================
      const supabase = await supabaseFactory()

      // Get current user if authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: feedback, error: dbError } = await supabase
        .from("feedbacks")
        .insert({
          user_id: user?.id || null,
          category: sanitized.category,
          title: sanitized.title,
          description: sanitized.description,
          visitor_email: sanitized.visitorEmail || null,
          page_url: sanitized.pageUrl || null,
          user_agent: sanitized.browserInfo?.userAgent || null,
          browser_info: sanitized.browserInfo || {},
          ip_hash: ipHash,
          security_status: securityStatus,
          security_score: Math.round(avgScore * 100) / 100,
          security_flags: allFlags,
          auto_tags: [],
          turnstile_validated: botCheck.passed,
          is_flagged: securityStatus === "flagged",
          flag_reason:
            securityStatus === "flagged"
              ? allFlags
                  .map((f) => f.description)
                  .filter(Boolean)
                  .join(", ")
              : null,
        })
        .select()
        .single()

      if (dbError) {
        console.error("[Feedback] DB error:", dbError)
        return Response.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 })
      }

      // Link screenshots if any (with ownership verification)
      if (sanitized.screenshotIds && sanitized.screenshotIds.length > 0) {
        const folder = user?.id || "anonymous"
        for (let i = 0; i < sanitized.screenshotIds.length; i++) {
          await supabase
            .from("feedback_screenshots")
            .update({ feedback_id: feedback.id, display_order: i })
            .eq("id", sanitized.screenshotIds[i])
            .is("feedback_id", null)
            .like("storage_path", `${folder}/%`)
        }
      }

      // ========================================================================
      // LAYER 8: Processing Pipeline (fire-and-forget)
      // ========================================================================
      runProcessingPipeline(feedback, config, supabase).catch((err) => {
        console.error("[Feedback] Pipeline error:", err)
      })

      return Response.json({ success: true, id: feedback.id })
    } catch (error) {
      console.error("[Feedback] Unexpected error:", error)
      return Response.json({ error: "Erreur interne" }, { status: 500 })
    }
  }
}
