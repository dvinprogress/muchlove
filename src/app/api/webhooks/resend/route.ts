import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { EMAIL_EVENT_STATUSES, type EmailEventStatus } from '@/types/automations'

/**
 * Webhook Resend pour tracking des events email
 * https://resend.com/docs/webhooks
 *
 * Events supportés:
 * - email.sent
 * - email.delivered
 * - email.delivery_delayed
 * - email.bounced
 * - email.complained
 * - email.opened
 * - email.clicked
 *
 * Sécurité:
 * - Vérification de signature Svix avec RESEND_WEBHOOK_SECRET
 * - Rejette toute requête avec signature invalide (401)
 */

interface ResendWebhookEvent {
  type: string
  created_at: string
  data: {
    created_at: string
    email_id: string
    from: string
    to: string[]
    subject: string
    tags?: { name: string; value: string }[]
    // Pour email.bounced
    bounce?: {
      type: 'soft' | 'hard'
    }
    // Pour email.clicked
    link?: string
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin()

  try {
    // Vérifier que le secret webhook est configuré
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('RESEND_WEBHOOK_SECRET is required')
    }

    // Lire le body brut pour vérification de signature
    const rawBody = await request.text()

    // Extraire les headers Svix
    const svixHeaders = {
      'svix-id': request.headers.get('svix-id') ?? '',
      'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
      'svix-signature': request.headers.get('svix-signature') ?? '',
    }

    // Vérifier la signature avec Svix
    let event: ResendWebhookEvent
    try {
      const wh = new Webhook(webhookSecret)
      event = wh.verify(rawBody, svixHeaders) as ResendWebhookEvent
    } catch (err) {
      console.error('[Resend Webhook] Invalid signature:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    console.log('[Resend Webhook] Received event:', event.type, event.data.email_id)

    // Mapper le type d'événement Resend vers notre statut
    const eventStatus = mapResendEventToStatus(event.type)

    if (!eventStatus) {
      console.log('[Resend Webhook] Ignoring event type:', event.type)
      return NextResponse.json({ received: true })
    }

    // Trouver l'email_event correspondant via resend_id
    const { data: emailEvent, error: findError } = await supabase
      .from('email_events')
      .select('id, sequence_id, company_id, status')
      .eq('resend_id', event.data.email_id)
      .single()

    if (findError || !emailEvent) {
      console.error('[Resend Webhook] Email event not found for resend_id:', event.data.email_id)
      // Ne pas faire planter le webhook, juste logger
      return NextResponse.json({ received: true })
    }

    // Updater le statut de l'event
    const { error: updateError } = await supabase
      .from('email_events')
      .update({
        status: eventStatus,
        metadata: {
          ...(emailEvent as any).metadata,
          [`${event.type}_at`]: event.created_at,
          ...(event.data.link && { clicked_link: event.data.link }),
          ...(event.data.bounce && { bounce_type: event.data.bounce.type }),
        },
      })
      .eq('id', emailEvent.id)

    if (updateError) {
      console.error('[Resend Webhook] Error updating email_event:', updateError)
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    console.log(`[Resend Webhook] Updated event ${emailEvent.id} → ${eventStatus}`)

    // Si bounced ou complained, annuler la séquence
    if (
      eventStatus === EMAIL_EVENT_STATUSES.BOUNCED ||
      eventStatus === EMAIL_EVENT_STATUSES.COMPLAINED
    ) {
      if (emailEvent.sequence_id) {
        const cancelReason =
          eventStatus === EMAIL_EVENT_STATUSES.BOUNCED ? 'email_bounced' : 'user_complained'

        const { error: cancelError } = await supabase
          .from('email_sequences')
          .update({
            status: 'cancelled',
            cancelled_reason: cancelReason,
          })
          .eq('id', emailEvent.sequence_id)

        if (!cancelError) {
          console.log(`[Resend Webhook] Cancelled sequence ${emailEvent.sequence_id} (${cancelReason})`)
        } else {
          console.error('[Resend Webhook] Error cancelling sequence:', cancelError)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Resend Webhook] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Mapper un type d'événement Resend vers notre EmailEventStatus
 */
function mapResendEventToStatus(resendEventType: string): EmailEventStatus | null {
  switch (resendEventType) {
    case 'email.sent':
      return EMAIL_EVENT_STATUSES.SENT
    case 'email.delivered':
      return EMAIL_EVENT_STATUSES.DELIVERED
    case 'email.opened':
      return EMAIL_EVENT_STATUSES.OPENED
    case 'email.clicked':
      return EMAIL_EVENT_STATUSES.CLICKED
    case 'email.bounced':
      return EMAIL_EVENT_STATUSES.BOUNCED
    case 'email.complained':
      return EMAIL_EVENT_STATUSES.COMPLAINED
    default:
      return null
  }
}
