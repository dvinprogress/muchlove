'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { z } from 'zod'

interface DemoEmailCaptureProps {
  sessionId: string
  onEmailCaptured: (email: string) => void
  onSkip: () => void
}

const emailSchema = z.string().email()

export function DemoEmailCapture({
  sessionId,
  onEmailCaptured,
  onSkip
}: DemoEmailCaptureProps) {
  const t = useTranslations('demo.emailCapture')
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('') // Anti-spam honeypot
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)

  // Fetch count au mount
  useState(() => {
    fetch('/api/demo/count')
      .then(res => res.json())
      .then(data => setCount(data.count))
      .catch(() => setCount(null))
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Protection honeypot
    if (honeypot) {
      // Bot détecté, ne rien faire
      return
    }

    setError(null)

    // Validation email
    const result = emailSchema.safeParse(email)
    if (!result.success) {
      setError('Invalid email')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/demo/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email })
      })

      if (!response.ok) {
        throw new Error('Failed to capture email')
      }

      // Email capturé avec succès
      onEmailCaptured(email)
    } catch (err) {
      console.error('Email capture error:', err)
      setError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('title')}
        </h2>
        <p className="text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field (invisible) */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="absolute left-[-9999px]"
          aria-hidden="true"
        />

        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('placeholder')}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('submit')}
            </span>
          ) : (
            t('submit')
          )}
        </button>

        <button
          type="button"
          onClick={onSkip}
          disabled={isSubmitting}
          className="w-full text-gray-500 hover:text-gray-700 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('skip')}
        </button>
      </form>

      {count !== null && count > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-500 mt-4"
        >
          {t('counter', { count })}
        </motion.p>
      )}
    </motion.div>
  )
}
