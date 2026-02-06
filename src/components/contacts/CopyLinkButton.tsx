'use client'

import { LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'

interface CopyLinkButtonProps {
  uniqueLink: string
  variant?: 'icon' | 'button'
  className?: string
}

export function CopyLinkButton({ uniqueLink, variant = 'icon', className }: CopyLinkButtonProps) {
  const handleCopy = async () => {
    const link = `${window.location.origin}/t/${uniqueLink}`
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Link copied! Ready to share 💛')
    } catch (error) {
      toast.error('Oops! Could not copy the link. Try again?')
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleCopy}
        className={className || 'p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors'}
        title="Copier le lien"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
    )
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      icon={<LinkIcon className="w-4 h-4" />}
      onClick={handleCopy}
      className={className}
    >
      Copier le lien
    </Button>
  )
}
