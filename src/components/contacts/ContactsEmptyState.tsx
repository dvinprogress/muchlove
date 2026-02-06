'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { AddContactForm } from './AddContactForm'

/**
 * Wrapper client pour EmptyState avec modale d'ajout
 */
export function ContactsEmptyState() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <>
      <EmptyState
        icon={<Users className="w-12 h-12 text-slate-400" />}
        title="Aucun contact"
        description="Commencez par ajouter vos premiers contacts pour leur demander des témoignages."
        action={{
          label: 'Ajouter un contact',
          onClick: () => setShowAddModal(true),
        }}
      />
      <AddContactForm isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </>
  )
}
