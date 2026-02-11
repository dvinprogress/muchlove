'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronLeft, ChevronRight, Upload } from 'lucide-react'
import type { Contact, ContactStatus } from '@/types/database'
import { SearchInput } from '@/components/ui/SearchInput'
import { Button } from '@/components/ui/Button'
import { ContactStatusBadge } from './ContactStatusBadge'
import { AddContactForm } from './AddContactForm'
import { CopyLinkButton } from './CopyLinkButton'
import { DeleteContactButton } from './DeleteContactButton'
import { SendEmailButton } from './SendEmailButton'
import { CSVImportModal } from './CSVImportModal'
import { BulkActionsBar } from './BulkActionsBar'
import { formatDate } from '@/lib/utils/format'
import { CONTACT_STATUS_ORDER } from '@/lib/utils/contact-status'
import { useTranslations } from 'next-intl'

interface ContactsListProps {
  contacts: Contact[]
  currentPage: number
  totalContacts: number
  pageSize: number
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

export function ContactsList({ contacts, currentPage, totalContacts, pageSize }: ContactsListProps) {
  const router = useRouter()
  const t = useTranslations('contacts.list')
  const tStatus = useTranslations('contacts.status')
  const tBulk = useTranslations('contacts.bulk')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Calcul pagination
  const totalPages = Math.ceil(totalContacts / pageSize)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  // Filtre les contacts selon la recherche et le statut (cote client pour la page courante)
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const searchLower = search.toLowerCase()
      const matchesSearch =
        contact.first_name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        contact.company_name.toLowerCase().includes(searchLower)

      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [contacts, search, statusFilter])

  // Selection
  const allFilteredSelected = filteredContacts.length > 0 && filteredContacts.every(c => selectedIds.has(c.id))

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (allFilteredSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)))
    }
  }, [allFilteredSelected, filteredContacts])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // Navigation pagination
  const handlePageChange = (newPage: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', newPage.toString())
    router.push(url.pathname + url.search)
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
            placeholder={t('searchPlaceholder')}
          />
        </div>

        {/* Filtre statut */}
        <div className="w-full md:w-48">
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
            <option value="all">{t('allStatuses')}</option>
            {CONTACT_STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {tStatus(status)}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton import CSV */}
        <Button variant="secondary" icon={<Upload className="w-4 h-4" />} onClick={() => setShowImportModal(true)}>
          {t('importCSV')}
        </Button>

        {/* Bouton ajouter */}
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
          {t('addContact')}
        </Button>
      </div>

      {/* Liste vide */}
      {filteredContacts.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          {search || statusFilter !== 'all' ? t('noMatch') : t('noContacts')}
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
                <th className="py-3 px-2 w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                    title={tBulk('selectAll')}
                  />
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">{t('table.contact')}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">{t('table.email')}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">{t('table.company')}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">{t('table.status')}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">{t('table.date')}</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-700">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <motion.tr
                  key={contact.id}
                  variants={itemVariants}
                  className={`border-b border-slate-100 transition-colors ${
                    selectedIds.has(contact.id) ? 'bg-rose-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 px-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                      className="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                    />
                  </td>
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
                    <div className="flex items-center justify-end gap-1">
                      <SendEmailButton contactId={contact.id} contactStatus={contact.status} variant="icon" />
                      <CopyLinkButton uniqueLink={contact.unique_link} variant="icon" />
                      <DeleteContactButton
                        contactId={contact.id}
                        contactName={contact.first_name}
                        variant="icon"
                      />
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
            className={`border rounded-lg p-4 space-y-3 ${
              selectedIds.has(contact.id) ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
            }`}
          >
            {/* Header avec checkbox */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(contact.id)}
                  onChange={() => toggleSelect(contact.id)}
                  className="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500 mt-1"
                />
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
              <span className="text-slate-500">{t('mobileCard.company')} </span>
              <span className="text-slate-900 font-medium">{contact.company_name}</span>
            </div>

            {/* Date */}
            <div className="text-sm text-slate-500">{formatDate(contact.created_at)}</div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <SendEmailButton contactId={contact.id} contactStatus={contact.status} variant="button" className="flex-1" />
              <CopyLinkButton uniqueLink={contact.unique_link} variant="button" className="flex-1" />
              <DeleteContactButton contactId={contact.id} contactName={contact.first_name} variant="button" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
          <div className="text-sm text-slate-500">
            {t('pagination.pageOf', { current: currentPage, total: totalPages, count: totalContacts })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft className="w-4 h-4" />}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
            >
              {t('pagination.previous')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronRight className="w-4 h-4" />}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
            >
              {t('pagination.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddContactForm isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <CSVImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <BulkActionsBar selectedIds={selectedIds} onClear={clearSelection} />
        )}
      </AnimatePresence>
    </div>
  )
}
