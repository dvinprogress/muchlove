'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { sendInvitationEmail } from '@/app/[locale]/dashboard/contacts/actions'
import { Button } from '@/components/ui/Button'
import { useTranslations } from 'next-intl'
import type { ContactStatus } from '@/types/database'

interface SendEmailButtonProps {
  contactId: string
  contactStatus: ContactStatus
  variant?: 'icon' | 'button'
  className?: string
}

export function SendEmailButton({
  contactId,
  contactStatus,
  variant = 'icon',
  className,
}: SendEmailButtonProps) {
  const router = useRouter()
  const t = useTranslations('contacts.email')
  const [isSending, setIsSending] = useState(false)

  const alreadyInvited = contactStatus !== 'created'

  const handleSend = async () => {
    if (alreadyInvited) return

    setIsSending(true)
    const result = await sendInvitationEmail(contactId)

    if (result.success) {
      toast.success(t('sent'))
      router.refresh()
    } else {
      toast.error(t('error', { error: result.error }))
    }
    setIsSending(false)
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleSend}
        disabled={isSending || alreadyInvited}
        className={
          className ||
          `p-2 rounded-lg transition-colors disabled:opacity-50 ${
            alreadyInvited
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
          }`
        }
        title={alreadyInvited ? t('alreadyInvited') : t('send')}
      >
        <Mail className="w-4 h-4" />
      </button>
    )
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      icon={<Mail className="w-4 h-4" />}
      onClick={handleSend}
      disabled={isSending || alreadyInvited}
      loading={isSending}
      className={className}
    >
      {alreadyInvited ? t('alreadyInvited') : t('send')}
    </Button>
  )
}
