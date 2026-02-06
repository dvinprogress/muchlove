import { getContacts } from './actions'
import { ContactsList } from '@/components/contacts/ContactsList'
import { ContactsEmptyState } from '@/components/contacts/ContactsEmptyState'

export default async function ContactsPage() {
  // Fetch contacts via server action
  const result = await getContacts()

  // Gestion erreur
  if (!result.success) {
    return (
      <div>
        <div className="pb-6 border-b border-slate-200 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-500 mt-1">
            Gérez vos contacts et envoyez des demandes de témoignages
          </p>
        </div>
        <div className="text-center text-red-500 py-8">
          Erreur: {result.error}
        </div>
      </div>
    )
  }

  const contacts = result.data
  const hasContacts = contacts.length > 0

  return (
    <div>
      <div className="pb-6 border-b border-slate-200 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
        <p className="text-slate-500 mt-1">
          Gérez vos contacts et envoyez des demandes de témoignages
        </p>
      </div>

      {!hasContacts ? (
        <ContactsEmptyState />
      ) : (
        <ContactsList contacts={contacts} />
      )}
    </div>
  )
}
