import { Badge } from '@/components/ui/Badge'
import { getContactStatusConfig } from '@/lib/utils/contact-status'
import type { ContactStatus } from '@/types/database'

interface ContactStatusBadgeProps {
  status: ContactStatus
  dot?: boolean
}

/**
 * Badge affichant le statut d'un contact avec la configuration appropriée
 * Server-compatible (pas de 'use client')
 */
export function ContactStatusBadge({ status, dot = false }: ContactStatusBadgeProps) {
  const config = getContactStatusConfig(status)

  return (
    <Badge variant={config.variant} dot={dot}>
      {config.label}
    </Badge>
  )
}
