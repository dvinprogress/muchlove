'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import type { Contact } from '@/types/database'
import { ContactStatusBadge } from './ContactStatusBadge'
import { useTranslations } from 'next-intl'

interface ContactCardProps {
  contact: Contact
}

export function ContactCard({ contact }: ContactCardProps) {
  const t = useTranslations('contacts.card')
  const createdDate = new Date(contact.created_at).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 text-lg">
              {contact.first_name}
            </h3>
            <p className="text-sm font-medium text-slate-700">
              {contact.company_name}
            </p>
            <p className="text-sm text-slate-500 mt-1">{contact.email}</p>
          </div>
          <ContactStatusBadge status={contact.status} />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">{t('createdOn', { date: createdDate })}</span>
          <Link
            href={`/dashboard/contacts/${contact.id}`}
            className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
          >
            {t('viewDetail')}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
