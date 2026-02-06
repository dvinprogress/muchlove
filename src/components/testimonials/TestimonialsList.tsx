'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type { ProcessingStatus } from '@/types/database'
import { TestimonialCard } from './TestimonialCard'

interface Contact {
  first_name: string
  company_name: string
  email: string
}

interface TestimonialItem {
  id: string
  thumbnail_url: string | null
  processing_status: ProcessingStatus
  duration_seconds: number | null
  shared_trustpilot: boolean
  shared_google: boolean
  shared_linkedin: boolean
  created_at: string
  contacts: Contact | null
}

interface TestimonialsListProps {
  testimonials: TestimonialItem[]
}

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function TestimonialsList({ testimonials }: TestimonialsListProps) {
  const t = useTranslations('testimonials.list')
  const [statusFilter, setStatusFilter] = useState<ProcessingStatus | 'all'>('all')

  const STATUS_FILTERS: Array<{ value: ProcessingStatus | 'all'; labelKey: string }> = [
    { value: 'all', labelKey: 'filterAll' },
    { value: 'pending', labelKey: 'filterPending' },
    { value: 'processing', labelKey: 'filterProcessing' },
    { value: 'completed', labelKey: 'filterCompleted' },
    { value: 'failed', labelKey: 'filterFailed' },
  ]

  const filteredTestimonials = testimonials.filter((testimonial) => {
    if (statusFilter === 'all') return true
    return testimonial.processing_status === statusFilter
  })

  return (
    <div>
      {/* Filtre */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProcessingStatus | 'all')}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          {STATUS_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {t(filter.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filteredTestimonials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">{t('emptyState')}</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTestimonials.map((testimonial) => (
            <motion.div key={testimonial.id} variants={itemVariants}>
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
