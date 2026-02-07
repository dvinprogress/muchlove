import type { SecurityCheckResult, RateLimitEntry, FeedbackConfig } from "../../types"

/**
 * Hash une adresse IP avec un salt pour anonymisation
 */
export async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + "__feedback_salt_2026__")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Extrait l'IP du client depuis les headers de la requete
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]
    if (firstIp) {
      return firstIp.trim()
    }
  }
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp
  return "unknown"
}

/**
 * Rate Limiter in-memory pour le systeme de feedback
 * Utilise un hash IP pour anonymiser les donnees
 */
class FeedbackRateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor() {
    this.startCleanup()
  }

  /**
   * Demarre le nettoyage automatique des entrees expirees
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.store.entries()) {
        // Supprimer les entrees expirees (blocage termine + fenetre passee)
        if (entry.blockedUntil && now > entry.blockedUntil) {
          this.store.delete(key)
        }
      }
    }, 60_000)
  }

  /**
   * Verifie si une IP (hashee) peut faire une requete
   */
  async check(ipHash: string, config: FeedbackConfig): Promise<SecurityCheckResult> {
    const now = Date.now()
    const { windowMs, maxRequests, blockDurationMs } = config.security.rateLimit
    const entry = this.store.get(ipHash)

    // Premiere requete
    if (!entry) {
      this.store.set(ipHash, { ipHash, count: 1, firstRequestAt: now })
      return { passed: true, score: 1, flags: [] }
    }

    // Bloque?
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return {
        passed: false,
        score: 0,
        flags: [{ type: "rate_limit", severity: "critical", description: "IP temporairement bloquee" }],
        blockedReason: `Bloque jusqu'a ${new Date(entry.blockedUntil).toISOString()}`,
      }
    }

    // Fenetre expiree → reset
    if (now - entry.firstRequestAt > windowMs) {
      this.store.set(ipHash, { ipHash, count: 1, firstRequestAt: now })
      return { passed: true, score: 1, flags: [] }
    }

    // Incrementer
    entry.count++

    // Depasse le max → bloquer
    if (entry.count > maxRequests) {
      entry.blockedUntil = now + blockDurationMs
      return {
        passed: false,
        score: 0,
        flags: [{ type: "rate_limit", severity: "critical", description: `${entry.count}/${maxRequests} requetes en ${windowMs / 1000}s` }],
        blockedReason: `Trop de requetes (${entry.count}/${maxRequests})`,
      }
    }

    return { passed: true, score: 1, flags: [] }
  }

  /**
   * Nettoie les ressources
   */
  destroy(): void {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer)
  }
}

// Singleton instance
let instance: FeedbackRateLimiter | null = null

/**
 * Retourne l'instance singleton du rate limiter
 */
export function getRateLimiter(): FeedbackRateLimiter {
  if (!instance) instance = new FeedbackRateLimiter()
  return instance
}

/**
 * Verifie le rate limit pour un hash IP
 */
export async function checkRateLimit(ipHash: string, config: FeedbackConfig): Promise<SecurityCheckResult> {
  return getRateLimiter().check(ipHash, config)
}
