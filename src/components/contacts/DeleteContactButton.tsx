'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteContact } from '@/app/[locale]/dashboard/contacts/actions'
import { Button } from '@/components/ui/Button'
import { useTranslations } from 'next-intl'

interface DeleteContactButtonProps {
  contactId: string
  contactName: string
  variant?: 'icon' | 'button'
  className?: string
}

export function DeleteContactButton({
  contactId,
  contactName,
  variant = 'icon',
  className,
}: DeleteContactButtonProps) {
  const router = useRouter()
  const t = useTranslations('contacts.actions')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    // Confirmation
    const confirmed = window.confirm(t('deleteConfirm', { name: contactName }))
    if (!confirmed) return

    setIsDeleting(true)
    const result = await deleteContact(contactId)

    if (result.success) {
      toast.success(t('deleteSuccess', { name: contactName }))
      router.refresh()
    } else {
      toast.error(t('deleteError', { error: result.error }))
    }
    setIsDeleting(false)
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={
          className ||
          'p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50'
        }
        title={t('delete')}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )
  }

  return (
    <Button
      variant="danger"
      size="sm"
      icon={<Trash2 className="w-4 h-4" />}
      onClick={handleDelete}
      disabled={isDeleting}
      className={className}
    >
      {t('delete')}
    </Button>
  )
}
