'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Trash2, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { sendBulkInvitationEmails, deleteContact } from '@/app/[locale]/dashboard/contacts/actions'
import { Button } from '@/components/ui/Button'
import { useTranslations } from 'next-intl'

interface BulkActionsBarProps {
  selectedIds: Set<string>
  onClear: () => void
}

export function BulkActionsBar({ selectedIds, onClear }: BulkActionsBarProps) {
  const router = useRouter()
  const t = useTranslations('contacts.bulk')
  const [isSending, setIsSending] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const count = selectedIds.size

  const handleBulkEmail = async () => {
    setIsSending(true)
    const result = await sendBulkInvitationEmails(Array.from(selectedIds))

    if (result.success) {
      const { sent, failed } = result.data
      if (failed === 0) {
        toast.success(t('sendSuccess', { sent }))
      } else {
        toast.warning(t('sendPartial', { sent, failed }))
      }
      onClear()
      router.refresh()
    } else {
      toast.error(result.error)
    }
    setIsSending(false)
  }

  const handleBulkDelete = async () => {
    const confirmed = window.confirm(t('deleteConfirm', { count }))
    if (!confirmed) return

    setIsDeleting(true)
    let deleted = 0

    for (const id of selectedIds) {
      const result = await deleteContact(id)
      if (result.success) deleted++
    }

    toast.success(t('deleteSuccess', { count: deleted }))
    onClear()
    router.refresh()
    setIsDeleting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-xl shadow-2xl px-6 py-3 flex items-center gap-4"
    >
      <span className="text-sm font-medium">
        {t('selected', { count })}
      </span>

      <div className="h-5 w-px bg-slate-600" />

      <Button
        variant="ghost"
        size="sm"
        icon={<Mail className="w-4 h-4" />}
        onClick={handleBulkEmail}
        loading={isSending}
        disabled={isSending || isDeleting}
        className="text-white hover:bg-slate-700"
      >
        {t('sendEmails')}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        icon={<Trash2 className="w-4 h-4" />}
        onClick={handleBulkDelete}
        loading={isDeleting}
        disabled={isSending || isDeleting}
        className="text-red-400 hover:bg-slate-700"
      >
        {t('delete')}
      </Button>

      <button
        onClick={onClear}
        className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
