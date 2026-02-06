'use client'

import { Badge } from '@/components/ui/Badge'
import { getContactStatusConfig } from '@/lib/utils/contact-status'
import type { ContactStatus } from '@/types/database'
import { useTranslations } from 'next-intl'

interface ContactStatusBadgeProps {
  status: ContactStatus
  dot?: boolean
}

/**
 * Badge affichant le statut d'un contact avec la configuration appropriée
 */
export function ContactStatusBadge({ status, dot = false }: ContactStatusBadgeProps) {
  const config = getContactStatusConfig(status)
  const t = useTranslations('contacts.status')

  return (
    <Badge variant={config.variant} dot={dot}>
      {t(status)}
    </Badge>
  )
}
