import { getContacts } from './actions'
import { ContactsList } from '@/components/contacts/ContactsList'
import { ContactsEmptyState } from '@/components/contacts/ContactsEmptyState'
import { getTranslations } from 'next-intl/server'

interface ContactsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const t = await getTranslations('contacts')

  // Parse page from searchParams
  const params = await searchParams
  const page = parseInt(params.page ?? '1', 10)

  // Fetch contacts via server action avec pagination
  const result = await getContacts({ page, pageSize: 20 })

  // Gestion erreur
  if (!result.success) {
    return (
      <div>
        <div className="pb-6 border-b border-slate-200 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-500 mt-1">
            {t('description')}
          </p>
        </div>
        <div className="text-center text-red-500 py-8">
          {t('error', { error: result.error })}
        </div>
      </div>
    )
  }

  const { contacts, total } = result.data
  const hasContacts = total > 0

  return (
    <div>
      <div className="pb-6 border-b border-slate-200 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <p className="text-slate-500 mt-1">
          {t('description')}
        </p>
      </div>

      {!hasContacts ? (
        <ContactsEmptyState />
      ) : (
        <ContactsList contacts={contacts} currentPage={page} totalContacts={total} pageSize={20} />
      )}
    </div>
  )
}
