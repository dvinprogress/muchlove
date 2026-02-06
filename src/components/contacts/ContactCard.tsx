import Link from 'next/link'
import { Card, CardContent, Badge } from '@/components/ui'
import type { Contact, ContactStatus } from '@/types/database'

interface ContactCardProps {
  contact: Contact
}

const statusConfig: Record<
  ContactStatus,
  { label: string; variant: 'default' | 'info' | 'warning' | 'success' }
> = {
  created: { label: 'Créé', variant: 'default' },
  invited: { label: 'Invité', variant: 'info' },
  link_opened: { label: 'Lien ouvert', variant: 'warning' },
  video_started: { label: 'Vidéo en cours', variant: 'warning' },
  video_completed: { label: 'Vidéo terminée', variant: 'success' },
  shared_1: { label: 'Partagé x1', variant: 'success' },
  shared_2: { label: 'Partagé x2', variant: 'success' },
  shared_3: { label: 'Partagé x3', variant: 'success' },
}

export function ContactCard({ contact }: ContactCardProps) {
  const statusInfo = statusConfig[contact.status]
  const createdDate = new Date(contact.created_at).toLocaleDateString('fr-FR', {
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
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">Créé le {createdDate}</span>
          <Link
            href={`/dashboard/contacts/${contact.id}`}
            className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
          >
            Voir détail →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
