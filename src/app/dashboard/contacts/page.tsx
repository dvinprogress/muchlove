import Link from 'next/link'
import { Header } from '@/components/dashboard'
import { EmptyState, Button } from '@/components/ui'
import { ContactCard } from '@/components/contacts'
import { Users, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function ContactsPage() {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return (
      <div>
        <Header
          title="Contacts"
          description="Gérez vos contacts et envoyez des demandes de témoignages"
        />
        <div className="text-center text-slate-500 py-8">
          Erreur d'authentification
        </div>
      </div>
    )
  }

  // Fetch contacts
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', user.id)
    .order('created_at', { ascending: false })

  if (contactsError) {
    console.error('Erreur lors du chargement des contacts:', contactsError)
  }

  const hasContacts = contacts && contacts.length > 0

  return (
    <div>
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-500 mt-1">
            Gérez vos contacts et envoyez des demandes de témoignages
          </p>
        </div>
        <Link href="/dashboard/contacts/new">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Ajouter un contact
          </Button>
        </Link>
      </div>

      {!hasContacts ? (
        <EmptyState
          icon={<Users className="w-12 h-12 text-slate-400" />}
          title="Aucun contact"
          description="Commencez par ajouter vos premiers contacts pour leur demander des témoignages."
          action={{
            label: 'Ajouter un contact',
            href: '/dashboard/contacts/new',
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  )
}
