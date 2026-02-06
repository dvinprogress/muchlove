'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Link as LinkIcon, Trash2 } from 'lucide-react'
import type { Contact, ContactStatus } from '@/types/database'
import { SearchInput } from '@/components/ui/SearchInput'
import { Button } from '@/components/ui/Button'
import { ContactStatusBadge } from './ContactStatusBadge'
import { AddContactForm } from './AddContactForm'
import { deleteContact } from '@/app/dashboard/contacts/actions'
import { formatDate } from '@/lib/utils/format'
import { CONTACT_STATUS_ORDER } from '@/lib/utils/contact-status'

interface ContactsListProps {
  contacts: Contact[]
}

// Variants Framer Motion pour stagger animation
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

export function ContactsList({ contacts }: ContactsListProps) {
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all')

  // Filtre les contacts selon la recherche et le statut
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Filtre recherche
      const searchLower = search.toLowerCase()
      const matchesSearch =
        contact.first_name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        contact.company_name.toLowerCase().includes(searchLower)

      // Filtre statut
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [contacts, search, statusFilter])

  // Copier le lien unique
  const handleCopyLink = async (uniqueLink: string) => {
    const link = `${window.location.origin}/t/${uniqueLink}`
    try {
      await navigator.clipboard.writeText(link)
      // TODO: afficher toast success
      alert('Lien copié dans le presse-papiers')
    } catch (error) {
      alert('Erreur lors de la copie du lien')
    }
  }

  // Supprimer un contact
  const handleDelete = async (contactId: string, contactName: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le contact ${contactName} ?`)) {
      return
    }

    const result = await deleteContact(contactId)
    if (result.success) {
      router.refresh()
    } else {
      alert(`Erreur: ${result.error}`)
    }
  }

  // Initiale pour l'avatar
  const getInitial = (firstName: string) => {
    return firstName.charAt(0).toUpperCase()
  }

  return (
    <div>
      {/* Barre d'outils */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Recherche */}
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher par nom, email ou entreprise..."
          />
        </div>

        {/* Filtre statut */}
        <div className="w-full md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContactStatus | 'all')}
            className="
              w-full rounded-lg px-3 py-2 text-sm
              border border-slate-300
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
              focus:border-rose-500
            "
          >
            <option value="all">Tous les statuts</option>
            {CONTACT_STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton ajouter */}
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
          Ajouter un contact
        </Button>
      </div>

      {/* Liste vide */}
      {filteredContacts.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          {search || statusFilter !== 'all' ? 'Aucun contact ne correspond aux filtres' : 'Aucun contact'}
        </div>
      )}

      {/* Desktop: Tableau */}
      <div className="hidden md:block overflow-x-auto">
        {filteredContacts.length > 0 && (
          <motion.table
            className="w-full"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Contact</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Entreprise</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Date</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <motion.tr
                  key={contact.id}
                  variants={itemVariants}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-medium text-sm">
                        {getInitial(contact.first_name)}
                      </div>
                      <span className="font-medium text-slate-900">{contact.first_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">{contact.email}</td>
                  <td className="py-3 px-4 text-slate-900 text-sm">{contact.company_name}</td>
                  <td className="py-3 px-4">
                    <ContactStatusBadge status={contact.status} />
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">{formatDate(contact.created_at)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopyLink(contact.unique_link)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Copier le lien"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id, contact.first_name)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        )}
      </div>

      {/* Mobile: Cards */}
      <motion.div
        className="md:hidden space-y-4"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {filteredContacts.map((contact) => (
          <motion.div
            key={contact.id}
            variants={itemVariants}
            className="bg-white border border-slate-200 rounded-lg p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-medium">
                  {getInitial(contact.first_name)}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{contact.first_name}</div>
                  <div className="text-sm text-slate-500">{contact.email}</div>
                </div>
              </div>
              <ContactStatusBadge status={contact.status} />
            </div>

            {/* Entreprise */}
            <div className="text-sm">
              <span className="text-slate-500">Entreprise: </span>
              <span className="text-slate-900 font-medium">{contact.company_name}</span>
            </div>

            {/* Date */}
            <div className="text-sm text-slate-500">{formatDate(contact.created_at)}</div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                icon={<LinkIcon className="w-4 h-4" />}
                onClick={() => handleCopyLink(contact.unique_link)}
                className="flex-1"
              >
                Copier le lien
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => handleDelete(contact.id, contact.first_name)}
              >
                Supprimer
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal d'ajout */}
      <AddContactForm isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  )
}
