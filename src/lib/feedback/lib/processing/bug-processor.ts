import type { FeedbackRecord } from "../../types"

const BUG_TAG_KEYWORDS: Record<string, string[]> = {
  ui: ["layout", "display", "css", "style", "responsive", "mobile", "affichage", "visuel", "design", "alignement", "couleur"],
  performance: ["slow", "lag", "freeze", "loading", "timeout", "lent", "lenteur", "charge", "vitesse", "performance"],
  crash: ["crash", "error", "500", "404", "exception", "fail", "erreur", "plante", "bug", "casse", "blanc"],
  auth: ["login", "logout", "password", "session", "authentication", "connexion", "deconnexion", "mot de passe", "inscription"],
  data: ["missing", "incorrect", "wrong", "data", "sync", "perdu", "manquant", "incorrect", "donnees", "sauvegarde"],
  navigation: ["redirect", "route", "page", "link", "navigation", "lien", "redirection", "url", "404"],
  upload: ["upload", "file", "image", "fichier", "telechargement", "photo", "video"],
  payment: ["payment", "stripe", "billing", "paiement", "facture", "credit", "abonnement", "prix"],
}

export function extractBugTags(feedback: FeedbackRecord): string[] {
  const text = `${feedback.title} ${feedback.description}`.toLowerCase()
  const tags: string[] = []

  for (const [tag, keywords] of Object.entries(BUG_TAG_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      tags.push(tag)
    }
  }

  return tags
}
