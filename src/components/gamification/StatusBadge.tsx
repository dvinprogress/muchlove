'use client'

import { motion } from 'framer-motion'
import { Clock, Mail, Eye, Video, Check, Share2, Star } from 'lucide-react'
import type { ContactStatus } from '@/types/database'
import { getContactStatusConfig } from '@/lib/utils/contact-status'

interface StatusBadgeProps {
  status: ContactStatus
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_ICONS: Record<ContactStatus, React.ComponentType<{ className?: string }>> = {
  created: Clock,
  invited: Mail,
  link_opened: Eye,
  video_started: Video,
  video_completed: Check,
  shared_1: Share2,
  shared_2: Share2,
  shared_3: Star
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5'
}

const ICON_SIZE_CLASSES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = getContactStatusConfig(status)
  const Icon = STATUS_ICONS[status]
  const isAmbassador = status === 'shared_3'

  const badge = (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${SIZE_CLASSES[size]}`}
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color
      }}
    >
      <Icon className={ICON_SIZE_CLASSES[size]} />
      <span>{config.label}</span>
    </div>
  )

  if (isAmbassador) {
    return (
      <motion.div
        animate={{
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {badge}
      </motion.div>
    )
  }

  return badge
}
