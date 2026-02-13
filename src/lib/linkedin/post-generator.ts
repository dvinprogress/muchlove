/**
 * LinkedIn Post Generator for MuchLove Viral Loop
 *
 * Generates LinkedIn post text for ambassador celebrations.
 * No OAuth posting - just pre-filled share links.
 */

export interface LinkedInPostParams {
  contactFirstName: string
  companyName: string
  testimonialDuration?: number // in seconds
  locale: string
  reviewText?: string | null
}

/**
 * Format duration in seconds to human-readable format
 * Example: 161 seconds → "2min 41s"
 */
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) {
    return `${remainingSeconds}s`
  }

  return `${minutes}min ${remainingSeconds}s`
}

/**
 * Generate LinkedIn post text based on locale and parameters
 */
export function generateLinkedInPost(params: LinkedInPostParams): string {
  const { contactFirstName, companyName, testimonialDuration, locale, reviewText } = params

  // Format duration if provided
  const durationText = testimonialDuration
    ? formatDuration(testimonialDuration)
    : 'just a few minutes'

  // If reviewText is provided, use it in the post
  if (reviewText) {
    const templatesWithReview: Record<string, string> = {
      en: `${reviewText}

— ${contactFirstName}, happy customer of ${companyName}

💛 Shared via MuchLove`,

      fr: `${reviewText}

— ${contactFirstName}, client satisfait de ${companyName}

💛 Partagé via MuchLove`,

      es: `${reviewText}

— ${contactFirstName}, cliente satisfecho de ${companyName}

💛 Compartido via MuchLove`
    }

    const normalizedLocale = locale?.toLowerCase().split('-')[0] || 'en'
    return (templatesWithReview[normalizedLocale] ?? templatesWithReview.en) as string
  }

  // Fallback templates without review text
  const templates: Record<string, string> = {
    en: `🎉 ${contactFirstName} from ${companyName} just became a MuchLove Ambassador!

Completed a video testimonial + shared on 3 platforms in ${durationText}.

The power of spreading love 💛

Try it: https://muchlove.app/demo`,

    fr: `🎉 ${contactFirstName} de ${companyName} vient de devenir Ambassadeur MuchLove !

Témoignage vidéo + partage sur 3 plateformes en ${durationText}.

La puissance du bouche-à-oreille 💛

Essayez : https://muchlove.app/demo`,

    es: `🎉 ${contactFirstName} de ${companyName} se convirtió en Embajador MuchLove!

Testimonio en video + compartido en 3 plataformas en ${durationText}.

El poder del boca a boca 💛

Pruébalo: https://muchlove.app/demo`
  }

  // Fallback to English if locale not found
  const normalizedLocale = locale?.toLowerCase().split('-')[0] || 'en'
  return (templates[normalizedLocale] ?? templates.en) as string
}

/**
 * Generate LinkedIn share URL with pre-filled text
 * Opens the LinkedIn share dialog with the URL
 *
 * Note: LinkedIn's share-offsite doesn't support pre-filled text,
 * so we just pass the URL to share.
 */
export function getLinkedInShareUrl(url: string = 'https://muchlove.app/demo'): string {
  const encodedUrl = encodeURIComponent(url)
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
}

/**
 * Example usage:
 *
 * const postText = generateLinkedInPost({
 *   contactFirstName: 'Sarah',
 *   companyName: 'Acme Inc',
 *   testimonialDuration: 161,
 *   locale: 'en'
 * })
 *
 * const shareUrl = getLinkedInShareUrl('https://muchlove.app/demo')
 *
 * // Copy postText to clipboard, then open shareUrl in new tab
 * navigator.clipboard.writeText(postText)
 * window.open(shareUrl, '_blank')
 */
