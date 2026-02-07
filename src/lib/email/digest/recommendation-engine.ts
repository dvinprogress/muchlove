import type { WeeklyStats } from './stats-aggregator'

export interface Recommendation {
  type: 'add_contacts' | 'send_reminders' | 'use_videos' | 'install_widget' | 'upgrade' | 'celebrate'
  title: string
  description: string
  ctaText: string
  ctaUrl: string
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://muchlove.app'

export function generateRecommendation(stats: WeeklyStats): Recommendation {
  // 1. Si aucun contact → inviter à ajouter des contacts
  if (stats.totalContacts === 0) {
    return {
      type: 'add_contacts',
      title: "Let's find your first ambassadors",
      description: 'Import contacts or invite them directly to share their experience',
      ctaText: 'Add contacts',
      ctaUrl: `${BASE_URL}/dashboard/contacts/new`,
    }
  }

  // 2. Si contacts mais aucune vidéo → envoyer des relances
  if (stats.totalContacts > 0 && stats.newVideos === 0) {
    return {
      type: 'send_reminders',
      title: 'Your contacts are waiting to share',
      description: 'Send a gentle reminder to help them record their story',
      ctaText: 'Send reminders',
      ctaUrl: `${BASE_URL}/dashboard/contacts`,
    }
  }

  // 3. Si vidéos mais aucun partage → utiliser les vidéos
  if (stats.newVideos > 0 && stats.newShares === 0) {
    return {
      type: 'use_videos',
      title: 'You have videos waiting to be shared',
      description: 'Install the widget on your site or share them on social media',
      ctaText: 'Install widget',
      ctaUrl: `${BASE_URL}/dashboard/widget`,
    }
  }

  // 4. Si limite atteinte → upgrade
  if (stats.videosUsed >= stats.videosLimit) {
    return {
      type: 'upgrade',
      title: "You've hit your video limit",
      description: 'Upgrade to keep collecting love from your ambassadors',
      ctaText: 'Upgrade now',
      ctaUrl: `${BASE_URL}/dashboard/settings`,
    }
  }

  // 5. Si nouveaux ambassadeurs → célébrer
  if (stats.newAmbassadors > 0) {
    const plural = stats.newAmbassadors > 1 ? 's' : ''
    return {
      type: 'celebrate',
      title: `You have ${stats.newAmbassadors} new ambassador${plural}!`,
      description: "They've shared your love with the world. That's huge 🎉",
      ctaText: 'See your ambassadors',
      ctaUrl: `${BASE_URL}/dashboard/contacts?filter=ambassadors`,
    }
  }

  // 6. Default → momentum
  return {
    type: 'celebrate',
    title: 'Keep spreading the love',
    description: "You're building something special. Keep the momentum going",
    ctaText: 'View dashboard',
    ctaUrl: `${BASE_URL}/dashboard`,
  }
}
