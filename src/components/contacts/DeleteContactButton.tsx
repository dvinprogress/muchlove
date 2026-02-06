'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteContact } from '@/app/dashboard/contacts/actions'
import { Button } from '@/components/ui/Button'

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
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    // Confirmation
    const confirmed = window.confirm(`Delete ${contactName}? This can't be undone.`)
    if (!confirmed) return

    setIsDeleting(true)
    const result = await deleteContact(contactId)

    if (result.success) {
      toast.success(`${contactName} has been removed 💛`)
      router.refresh()
    } else {
      toast.error(`Could not delete: ${result.error}`)
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
        title="Supprimer"
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
      Supprimer
    </Button>
  )
}
