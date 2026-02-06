'use client'

import { motion } from 'framer-motion'
import { Video, Calendar, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, Badge } from '@/components/ui'
import { getProcessingStatusConfig } from '@/lib/utils/contact-status'
import { formatDate, formatDuration } from '@/lib/utils/format'
import type { ProcessingStatus } from '@/types/database'

interface Contact {
  first_name: string
  company_name: string
  email: string
}

interface TestimonialCardProps {
  testimonial: {
    id: string
    thumbnail_url: string | null
    processing_status: ProcessingStatus
    duration_seconds: number | null
    created_at: string
    contacts: Contact | null
  }
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const t = useTranslations('testimonials.card')
  const statusConfig = getProcessingStatusConfig(testimonial.processing_status)
  const contactName = testimonial.contacts?.first_name || t('contactFallback')
  const companyName = testimonial.contacts?.company_name || t('companyFallback')

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow h-full">
        <CardContent className="p-4">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-slate-100 rounded-lg mb-4 overflow-hidden">
            {testimonial.thumbnail_url ? (
              <img
                src={testimonial.thumbnail_url}
                alt={t('altThumbnail', { name: contactName })}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="w-12 h-12 text-slate-300" />
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="mb-3">
            <h3 className="font-semibold text-slate-900">
              {contactName}
            </h3>
            <p className="text-sm text-slate-500">
              {companyName}
            </p>
          </div>

          {/* Status & Duration */}
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant={statusConfig.variant}
              dot={testimonial.processing_status === 'processing'}
            >
              {statusConfig.label}
            </Badge>
            {testimonial.duration_seconds !== null && (
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                {formatDuration(testimonial.duration_seconds)}
              </div>
            )}
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-1 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            {formatDate(testimonial.created_at)}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
