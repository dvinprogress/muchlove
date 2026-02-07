import type { FeedbackSubmissionInput } from "../schemas"

/**
 * Supprime les balises HTML
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "")
}

/**
 * Echappe les caracteres speciaux HTML
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  }
  return input.replace(/[&<>"']/g, (char) => map[char] || char)
}

/**
 * Normalise les espaces (multiples espaces → un seul, trim)
 */
export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim()
}

/**
 * Supprime les caracteres de controle (sauf newline et tab)
 */
export function stripControlChars(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
}

/**
 * Tronque a une longueur max
 */
export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input
  return input.slice(0, maxLength)
}

/**
 * Sanitize un champ texte avec toutes les protections
 */
export function sanitizeField(input: string, maxLength: number = 5000): string {
  let result = input
  result = stripControlChars(result)
  result = stripHtml(result)
  result = normalizeWhitespace(result)
  result = truncate(result, maxLength)
  return result
}

/**
 * Sanitize toutes les donnees d'un feedback avant stockage
 */
export function sanitizeFeedback(data: FeedbackSubmissionInput): FeedbackSubmissionInput {
  return {
    ...data,
    title: sanitizeField(data.title, 200),
    description: sanitizeField(data.description, 5000),
    visitorEmail: data.visitorEmail ? data.visitorEmail.trim().toLowerCase() : data.visitorEmail,
  }
}
