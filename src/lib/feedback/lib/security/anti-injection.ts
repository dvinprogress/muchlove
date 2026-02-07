import type { SecurityCheckResult, SecurityFlag, InjectionPattern, FeedbackConfig } from "../../types"

// =============================================================================
// PATTERNS D'INJECTION
// =============================================================================

const INJECTION_PATTERNS: InjectionPattern[] = [
  // Prompt manipulation
  {
    regex: /ignore\s+(previous|all|above|prior)\s+(instructions|prompts|rules)/gi,
    weight: 0.9,
    description: "Tentative de reset prompt",
    category: "prompt_manipulation"
  },
  {
    regex: /you\s+are\s+now\s+/gi,
    weight: 0.7,
    description: "Manipulation de role",
    category: "prompt_manipulation"
  },
  {
    regex: /act\s+as\s+(a|an)?\s*/gi,
    weight: 0.6,
    description: "Usurpation de role",
    category: "prompt_manipulation"
  },
  {
    regex: /pretend\s+to\s+be/gi,
    weight: 0.7,
    description: "Usurpation de role",
    category: "prompt_manipulation"
  },
  {
    regex: /system\s*:/gi,
    weight: 0.8,
    description: "Injection system prompt",
    category: "prompt_manipulation"
  },
  {
    regex: /\[INST\]|\[\/INST\]|<\|im_start\|>|<\|im_end\|>/gi,
    weight: 0.95,
    description: "Injection de tokens de controle LLM",
    category: "prompt_manipulation"
  },
  {
    regex: /<<<|>>>|---\s*system/gi,
    weight: 0.7,
    description: "Delimiteur de prompt suspect",
    category: "prompt_manipulation"
  },
  {
    regex: /do\s+not\s+follow\s+(your|the)\s+(rules|instructions|guidelines)/gi,
    weight: 0.9,
    description: "Override de regles",
    category: "prompt_manipulation"
  },
  {
    regex: /forget\s+(everything|all|your)\s+(you|previous|instructions)/gi,
    weight: 0.9,
    description: "Reset memoire",
    category: "prompt_manipulation"
  },

  // Script injection (XSS)
  {
    regex: /<script[\s>]/gi,
    weight: 1.0,
    description: "Balise script detectee",
    category: "script_injection"
  },
  {
    regex: /javascript\s*:/gi,
    weight: 0.9,
    description: "Protocole javascript",
    category: "script_injection"
  },
  {
    regex: /on(load|error|click|mouseover|submit|focus|blur)\s*=/gi,
    weight: 0.9,
    description: "Event handler inline",
    category: "script_injection"
  },
  {
    regex: /<iframe[\s>]/gi,
    weight: 0.95,
    description: "Balise iframe detectee",
    category: "script_injection"
  },
  {
    regex: /<object[\s>]/gi,
    weight: 0.8,
    description: "Balise object detectee",
    category: "script_injection"
  },
  {
    regex: /eval\s*\(/gi,
    weight: 0.9,
    description: "Appel eval()",
    category: "script_injection"
  },
  {
    regex: /document\.(cookie|write|location)/gi,
    weight: 0.9,
    description: "Acces DOM dangereux",
    category: "script_injection"
  },

  // SQL injection
  {
    regex: /union\s+(all\s+)?select/gi,
    weight: 0.8,
    description: "UNION SELECT",
    category: "sql_injection"
  },
  {
    regex: /drop\s+table/gi,
    weight: 0.9,
    description: "DROP TABLE",
    category: "sql_injection"
  },
  {
    regex: /;\s*delete\s+from/gi,
    weight: 0.8,
    description: "DELETE FROM",
    category: "sql_injection"
  },
  {
    regex: /'\s*or\s+'1'\s*=\s*'1/gi,
    weight: 0.9,
    description: "Tautologie SQL classique",
    category: "sql_injection"
  },
  {
    regex: /;\s*insert\s+into/gi,
    weight: 0.8,
    description: "INSERT INTO",
    category: "sql_injection"
  },

  // Data exfiltration
  {
    regex: /fetch\s*\(\s*['"`]https?:/gi,
    weight: 0.7,
    description: "Appel fetch() externe",
    category: "data_exfiltration"
  },
  {
    regex: /new\s+XMLHttpRequest/gi,
    weight: 0.7,
    description: "Requete XHR",
    category: "data_exfiltration"
  },
  {
    regex: /navigator\.(sendBeacon|clipboard)/gi,
    weight: 0.8,
    description: "Exfiltration via navigator API",
    category: "data_exfiltration"
  },
]

// =============================================================================
// FONCTION PRINCIPALE
// =============================================================================

/**
 * Detecte les tentatives d'injection (prompt, XSS, SQL) dans le contenu des feedbacks
 *
 * @param data - Donnees du feedback a analyser
 * @param config - Configuration de securite
 * @returns Resultat de la verification avec score et flags
 */
export function checkAntiInjection(
  data: { title: string; description: string; visitorEmail?: string },
  config: FeedbackConfig
): SecurityCheckResult {
  const content = `${data.title} ${data.description} ${data.visitorEmail || ""}`.toLowerCase()

  const flags: SecurityFlag[] = []
  let detectedWeight = 0

  // Tester chaque pattern d'injection
  for (const pattern of INJECTION_PATTERNS) {
    // Reset lastIndex pour les regex globales
    pattern.regex.lastIndex = 0

    if (pattern.regex.test(content)) {
      detectedWeight += pattern.weight

      // Determiner la severite en fonction du poids
      let severity: SecurityFlag["severity"]
      if (pattern.weight > 0.8) {
        severity = "critical"
      } else if (pattern.weight > 0.6) {
        severity = "high"
      } else {
        severity = "medium"
      }

      flags.push({
        type: "injection",
        severity,
        pattern: pattern.category,
        description: pattern.description,
        metadata: {
          category: pattern.category,
          weight: pattern.weight,
        },
      })

      // Reset lastIndex apres le test
      pattern.regex.lastIndex = 0
    }
  }

  // Calculer le score (1 = clean, 0 = totalement malveillant)
  // On normalise par rapport au poids maximum possible
  const maxPossibleWeight = INJECTION_PATTERNS.reduce((sum, p) => sum + p.weight, 0)
  const score = Math.max(0, 1 - (detectedWeight / maxPossibleWeight))

  // Verifier si le score passe le seuil
  const passed = score >= config.security.injection.scoreThreshold

  return {
    passed,
    score: Math.round(score * 100) / 100, // Arrondir a 2 decimales
    flags,
    blockedReason: !passed && config.security.injection.blockOnDetection
      ? `Injection detectee (score: ${score.toFixed(2)})`
      : undefined,
  }
}
