import type { SecurityCheckResult, SecurityFlag, FeedbackConfig } from "../../types"

/**
 * Analyse le contenu des feedbacks pour détecter le spam via scoring.
 */
export function checkAntiSpam(
  data: { title: string; description: string; visitorEmail?: string },
  config: FeedbackConfig
): SecurityCheckResult {
  const content = `${data.title} ${data.description}`.trim()
  const flags: SecurityFlag[] = []
  let score = 1.0

  // 1. Densité URLs
  const urlMatches = content.match(/https?:\/\/\S+/gi) || []
  if (urlMatches.length > config.security.spam.maxUrls) {
    score -= 0.3
    flags.push({
      type: "spam",
      severity: "high",
      description: `Trop d'URLs détectées: ${urlMatches.length} (max: ${config.security.spam.maxUrls})`
    })
  }

  // 2. Répétition caractères
  const repetitionPattern = new RegExp(`(.)\\1{${config.security.spam.maxRepetition},}`, "gi")
  const repetitions = content.match(repetitionPattern)
  if (repetitions && repetitions.length > 0) {
    score -= 0.2
    flags.push({
      type: "spam",
      severity: "medium",
      description: `Répétitions excessives de caractères détectées: ${repetitions.join(", ")}`
    })
  }

  // 3. Longueur minimum
  if (content.length < config.security.spam.minContentLength) {
    score -= 0.1
    flags.push({
      type: "spam",
      severity: "low",
      description: `Contenu trop court: ${content.length} caractères (min: ${config.security.spam.minContentLength})`
    })
  }

  // 4. Keywords spam connus
  const spamKeywords = [
    "buy now",
    "click here",
    "limited offer",
    "act now",
    "earn money",
    "free gift",
    "winner",
    "congratulations",
    "make money",
    "work from home"
  ]
  const contentLower = content.toLowerCase()
  const foundKeywords = spamKeywords.filter(keyword => contentLower.includes(keyword))
  if (foundKeywords.length > 0) {
    score -= 0.4
    flags.push({
      type: "spam",
      severity: "high",
      description: `Mots-clés spam détectés: ${foundKeywords.join(", ")}`
    })
  }

  // 5. Tout en majuscules
  if (content.length > 20) {
    const uppercaseChars = content.match(/[A-Z]/g) || []
    const letters = content.match(/[A-Za-z]/g) || []
    if (letters.length > 0 && uppercaseChars.length / letters.length > 0.5) {
      score -= 0.15
      flags.push({
        type: "spam",
        severity: "medium",
        description: `Plus de 50% du contenu est en majuscules`
      })
    }
  }

  // 6. Emails multiples
  const emailMatches = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi) || []
  if (emailMatches.length > 2) {
    score -= 0.2
    flags.push({
      type: "spam",
      severity: "medium",
      description: `Trop d'adresses email détectées: ${emailMatches.length}`
    })
  }

  // Score minimum = 0
  score = Math.max(0, score)

  return {
    passed: score >= 0.5,
    score,
    flags
  }
}
