'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Sparkles, Edit3, Check, Copy, ClipboardCheck } from 'lucide-react'

interface ReviewValidationProps {
  transcription: string | null
  contactFirstName: string
  companyName: string
  onValidate: (reviewText: string) => void
}

export function ReviewValidation({
  transcription,
  contactFirstName,
  companyName,
  onValidate
}: ReviewValidationProps) {
  const t = useTranslations('review')
  const [isEditing, setIsEditing] = useState(false)

  // Generate a clean review from transcription
  const generateReview = (rawTranscription: string | null): string => {
    if (!rawTranscription || rawTranscription.trim().length < 10) {
      // Fallback if no transcription
      return t('fallbackReview', { companyName })
    }

    // Clean up the transcription:
    // - Remove filler words
    // - Capitalize first letter
    // - Ensure it ends with proper punctuation
    let cleaned = rawTranscription.trim()

    // Remove common filler words (FR + EN)
    const fillers = [
      /\b(euh|euuh|hum|hmm|ben|bah|genre|en fait|du coup|voilà)\b/gi,
      /\b(uh|uhm|um|like|you know|basically|so yeah|i mean)\b/gi,
    ]
    fillers.forEach(filler => {
      cleaned = cleaned.replace(filler, '')
    })

    // Clean up multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim()

    // Capitalize first letter
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)

    // Ensure ends with punctuation
    if (!/[.!?]$/.test(cleaned)) {
      cleaned += '.'
    }

    return cleaned
  }

  const [reviewText, setReviewText] = useState(() => generateReview(transcription))
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reviewText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text
    }
  }

  const handleValidate = () => {
    onValidate(reviewText)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {t('title')}
        </h2>
        <p className="text-gray-600">
          {t('subtitle', { firstName: contactFirstName })}
        </p>
      </div>

      {/* Review card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-amber-700">
            {t('yourReview')}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
            >
              {copied ? (
                <><ClipboardCheck className="w-4 h-4" /> {t('copied')}</>
              ) : (
                <><Copy className="w-4 h-4" /> {t('copy')}</>
              )}
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? t('done') : t('edit')}
            </button>
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full min-h-[120px] p-4 rounded-lg border border-amber-300 bg-white text-gray-900 text-base leading-relaxed resize-y focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
            autoFocus
          />
        ) : (
          <div className="bg-white rounded-lg p-4 text-gray-800 text-base leading-relaxed italic">
            &ldquo;{reviewText}&rdquo;
          </div>
        )}

        <p className="text-xs text-amber-600">
          {t('editHint')}
        </p>
      </div>

      {/* Validate button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleValidate}
        className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-lg rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" />
        {t('validate')}
      </motion.button>

      {/* Reassurance */}
      <p className="text-center text-sm text-gray-500">
        {t('reassurance')}
      </p>
    </motion.div>
  )
}
