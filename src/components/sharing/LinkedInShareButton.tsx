'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Linkedin, Check, Loader2 } from 'lucide-react'
import { generateLinkedInPost, getLinkedInShareUrl } from '@/lib/linkedin/post-generator'
import type { ContactStatus } from '@/types/database'

interface LinkedInShareButtonProps {
  contactId: string
  testimonialId: string
  contactFirstName: string
  companyName: string
  testimonialDuration?: number
  currentStatus: ContactStatus
  locale: string
  reviewText?: string | null
  onStatusUpdate: (newStatus: ContactStatus) => void
  onCelebration: () => void
}

type ShareState = 'idle' | 'sharing' | 'shared'

export function LinkedInShareButton({
  contactId: _contactId,
  contactFirstName,
  companyName,
  testimonialDuration,
  currentStatus,
  locale,
  reviewText,
  onStatusUpdate: _onStatusUpdate,
  onCelebration
}: LinkedInShareButtonProps) {
  const t = useTranslations('sharing.linkedin')
  const [shareState, setShareState] = useState<ShareState>(
    currentStatus === 'shared_3' ? 'shared' : 'idle'
  )

  const handleShare = async () => {
    try {
      setShareState('sharing')

      // Generate the LinkedIn post text
      const postText = generateLinkedInPost({
        contactFirstName,
        companyName,
        testimonialDuration,
        locale,
        reviewText
      })

      // Copy to clipboard
      await navigator.clipboard.writeText(postText)

      // Open LinkedIn share dialog
      const shareUrl = getLinkedInShareUrl()
      window.open(shareUrl, '_blank')

      // Update status via Server Action (imported in parent)
      // The parent SharingFlow will handle the server action call
      setShareState('shared')
      onCelebration()
    } catch (error) {
      console.error('LinkedIn share error:', error)
      setShareState('idle')
      alert(t('shareError'))
    }
  }

  const isDisabled = shareState === 'shared'

  return (
    <motion.button
      onClick={handleShare}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`
        w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold
        transition-colors duration-200
        ${
          isDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-[#0A66C2] hover:bg-[#004182] text-white'
        }
      `}
    >
      {shareState === 'sharing' && <Loader2 className="w-5 h-5 animate-spin" />}
      {shareState === 'shared' && <Check className="w-5 h-5" />}
      {shareState === 'idle' && <Linkedin className="w-5 h-5" />}

      <span>
        {shareState === 'shared' ? t('done') : t('action')}
      </span>
    </motion.button>
  )
}
