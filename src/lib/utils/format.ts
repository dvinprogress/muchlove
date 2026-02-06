/**
 * Utilitaires de formatage de dates et durees
 */

/**
 * Formate une date en francais
 * @param dateString - Date au format ISO string
 * @returns Date formatee (ex: "6 fev. 2026")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formate un temps relatif en francais
 * @param dateString - Date au format ISO string
 * @returns Temps relatif (ex: "il y a 2h" ou "a l'instant")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Moins d'une minute
  if (diffMinutes < 1) {
    return "a l'instant";
  }

  // Moins d'une heure
  if (diffMinutes < 60) {
    return `il y a ${diffMinutes} min`;
  }

  // Moins de 24h
  if (diffHours < 24) {
    return `il y a ${diffHours}h`;
  }

  // Moins de 7 jours
  if (diffDays < 7) {
    return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  }

  // Sinon, date complete
  return formatDate(dateString);
}

/**
 * Formate une duree en minutes:secondes
 * @param seconds - Duree en secondes
 * @returns Duree formatee (ex: "1:30" ou "0:45")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
