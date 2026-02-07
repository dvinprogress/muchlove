/**
 * Types helpers pour les automations de croissance
 * Re-exports depuis database.ts pour une meilleure ergonomie
 */

import type {
  DemoSession,
  DemoSessionInsert,
  DemoSessionUpdate,
  EmailSequence,
  EmailSequenceInsert,
  EmailSequenceUpdate,
  EmailEvent,
  EmailEventInsert,
  EmailEventUpdate,
  WidgetConfig,
  WidgetConfigInsert,
  WidgetConfigUpdate,
  EmailSegment,
  EmailEventStatus,
  EmailSequenceStatus,
} from './database'
import { createHmac } from 'crypto'

// ============================================================================
// Demo Sessions (Automation 1: Viral Demo)
// ============================================================================
export type {
  DemoSession,
  DemoSessionInsert,
  DemoSessionUpdate,
}

export interface DemoSessionWithStats extends DemoSession {
  shared_platforms_count: number
}

// ============================================================================
// Email Sequences (Automation 2: Behavioral Emails)
// ============================================================================
export type {
  EmailSequence,
  EmailSequenceInsert,
  EmailSequenceUpdate,
  EmailSegment,
  EmailSequenceStatus,
}

export interface EmailSequenceWithEvents extends EmailSequence {
  events_count: number
  last_event_status?: EmailEventStatus
}

// Segments comportementaux
export const EMAIL_SEGMENTS = {
  FROZEN_STARTER: 'frozen_starter' as const,
  REJECTED_REQUESTER: 'rejected_requester' as const,
  COLLECTOR_UNUSED: 'collector_unused' as const,
  FREE_MAXIMIZER: 'free_maximizer' as const,
} satisfies Record<string, EmailSegment>

// Statuts de séquence
export const EMAIL_SEQUENCE_STATUSES = {
  ACTIVE: 'active' as const,
  PAUSED: 'paused' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
} satisfies Record<string, EmailSequenceStatus>

// ============================================================================
// Email Events (Automation 2+5: Tracking)
// ============================================================================
export type {
  EmailEvent,
  EmailEventInsert,
  EmailEventUpdate,
  EmailEventStatus,
}

export interface EmailEventWithSequence extends EmailEvent {
  sequence?: EmailSequence | null
}

// Statuts d'événement email
export const EMAIL_EVENT_STATUSES = {
  SENT: 'sent' as const,
  DELIVERED: 'delivered' as const,
  OPENED: 'opened' as const,
  CLICKED: 'clicked' as const,
  BOUNCED: 'bounced' as const,
  COMPLAINED: 'complained' as const,
} satisfies Record<string, EmailEventStatus>

// ============================================================================
// Widget Config (Automation 3: Embeddable Widget)
// ============================================================================
export type {
  WidgetConfig,
  WidgetConfigInsert,
  WidgetConfigUpdate,
}

export interface WidgetTheme {
  primaryColor: string
  backgroundColor: string
  borderRadius: string
  layout: 'carousel' | 'grid' | 'list'
  maxItems: number
  showNames: boolean
  showTranscription: boolean
  poweredByVisible: boolean
}

export interface WidgetConfigWithTheme extends Omit<WidgetConfig, 'theme'> {
  theme: WidgetTheme
}

// ============================================================================
// Email Preferences (Companies)
// ============================================================================
export interface EmailPreferences {
  marketing: boolean
  sequences: boolean
  weekly_digest: boolean
}

// ============================================================================
// LinkedIn Consent (Contacts)
// ============================================================================
export interface LinkedInConsent {
  consent: boolean
  consent_at: string | null
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Vérifie si une session demo est expirée
 */
export function isDemoSessionExpired(session: DemoSession): boolean {
  return new Date(session.expires_at) < new Date()
}

/**
 * Vérifie si une séquence email est active
 */
export function isEmailSequenceActive(sequence: EmailSequence): boolean {
  return sequence.status === EMAIL_SEQUENCE_STATUSES.ACTIVE
}

/**
 * Vérifie si un email a été ouvert
 */
export function isEmailOpened(event: EmailEvent): boolean {
  return [
    EMAIL_EVENT_STATUSES.OPENED,
    EMAIL_EVENT_STATUSES.CLICKED,
  ].includes(event.status as any)
}

/**
 * Génère un token unsubscribe signé avec HMAC
 */
export function generateUnsubscribeToken(
  companyId: string,
  type: keyof EmailPreferences
): string {
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET
  if (!secret) throw new Error('UNSUBSCRIBE_TOKEN_SECRET environment variable is required')

  const payload = `${companyId}:${type}`
  const signature = createHmac('sha256', secret).update(payload).digest('hex')
  return Buffer.from(payload, 'utf-8').toString('base64url') + '.' + signature
}
