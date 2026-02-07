import type { SecurityCheckResult, SecurityFlag, FeedbackConfig } from "../../types"

interface TurnstileVerifyResponse {
  success: boolean
  "error-codes"?: string[]
}

async function verifyTurnstile(
  token: string,
  secretKey: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }),
  })

  const data = (await response.json()) as TurnstileVerifyResponse
  return {
    success: data.success,
    error: data["error-codes"]?.join(", "),
  }
}

export async function checkAntiBot(
  data: { turnstileToken: string; honeypot?: string },
  config: FeedbackConfig
): Promise<SecurityCheckResult> {
  const flags: SecurityFlag[] = []

  if (data.honeypot && data.honeypot.trim() !== "") {
    flags.push({
      type: "bot",
      severity: "critical",
      description: "Honeypot field was filled",
    })
    return {
      passed: false,
      score: 0,
      flags,
    }
  }

  if (!config.security.turnstile.siteKey || config.security.turnstile.siteKey.trim() === "") {
    // Turnstile not configured - allow but with reduced score to flag in logs
    return {
      passed: true,
      score: 0.7,
      flags: [{
        type: "bot",
        severity: "low",
        description: "Turnstile not configured - anti-bot protection reduced",
      }],
    }
  }

  const turnstileResult = await verifyTurnstile(
    data.turnstileToken,
    config.security.turnstile.secretKey
  )

  if (!turnstileResult.success) {
    flags.push({
      type: "bot",
      severity: "critical",
      description: `Turnstile verification failed: ${turnstileResult.error || "unknown error"}`,
    })
    return {
      passed: false,
      score: 0,
      flags,
    }
  }

  return {
    passed: true,
    score: 1.0,
    flags: [],
  }
}
