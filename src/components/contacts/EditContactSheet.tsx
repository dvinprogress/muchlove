'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { updateContact, deleteContact } from '@/app/[locale]/dashboard/contacts/actions'
import { useRouter } from 'next/navigation'

interface EditContactSheetProps {
  contact: {
    id: string
    first_name: string
    email: string
    company_name: string
    phone: string | null
    reward: string | null
    status: string
    unique_link: string
    created_at: string
  }
  isOpen: boolean
  onClose: () => void
}

export function EditContactSheet({ contact, isOpen, onClose }: EditContactSheetProps) {
  const t = useTranslations('contacts')
  const router = useRouter()
  const [firstName, setFirstName] = useState(contact.first_name)
  const [email, setEmail] = useState(contact.email)
  const [companyName, setCompanyName] = useState(contact.company_name)
  const [phone, setPhone] = useState(contact.phone || '')
  const [reward, setReward] = useState(contact.reward || '')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateContact(contact.id, {
        first_name: firstName,
        email,
        company_name: companyName,
        phone: phone || null,
        reward: reward || null
      })
      if (result.success) {
        toast.success(t('edit.success'))
        onClose()
        router.refresh()
      } else {
        toast.error(result.error || t('edit.error'))
      }
    } catch {
      toast.error(t('edit.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const result = await deleteContact(contact.id)
      if (result.success) {
        toast.success(t('actions.deleteSuccess'))
        onClose()
        router.refresh()
      } else {
        toast.error(result.error || t('actions.deleteError'))
      }
    } catch {
      toast.error(t('actions.deleteError'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t('edit.title')}</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Status badge */}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>{t('edit.status')}: </span>
                <span className="font-medium text-slate-700">{t(`status.${contact.status}`)}</span>
              </div>

              {/* Editable fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('form.firstName.label')}</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('form.email.label')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('form.company.label')}</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('form.phone.label')}
                    <span className="text-slate-400 font-normal ml-1">{t('form.optional')}</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('form.phone.placeholder')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('form.reward.label')}
                    <span className="text-slate-400 font-normal ml-1">{t('form.optional')}</span>
                  </label>
                  <input
                    type="text"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    placeholder={t('form.reward.placeholder')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-slate-400">{t('form.reward.suggestions')}</p>
                </div>
              </div>

              {/* Info section */}
              <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 space-y-1">
                <p>{t('edit.createdAt')}: {new Date(contact.created_at).toLocaleDateString()}</p>
                <p>{t('edit.link')}: /t/{contact.unique_link}</p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t space-y-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-4 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? t('edit.saving') : t('edit.save')}
              </button>

              {/* Delete with confirmation */}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('actions.delete')}
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                  <p className="text-sm text-red-700 text-center">{t('edit.deleteConfirm')}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
                    >
                      {t('form.cancel')}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg text-sm font-medium"
                    >
                      {deleting ? '...' : t('edit.confirmDelete')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
