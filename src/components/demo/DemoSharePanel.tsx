'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Linkedin, Twitter } from 'lucide-react'

interface DemoSharePanelProps {
  onShare: (platform: string) => void
}

export function DemoSharePanel({ onShare }: DemoSharePanelProps) {
  const t = useTranslations('demo.share')

  const shareUrl = 'https://muchlove.app/demo'

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    onShare('linkedin')
  }

  const handleTwitterShare = () => {
    const text = t('twitterText')
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    onShare('twitter')
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

      <div className="space-y-3">
        <button
          onClick={handleLinkedInShare}
          className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          <Linkedin className="w-5 h-5" />
          {t('linkedin')}
        </button>

        <button
          onClick={handleTwitterShare}
          className="w-full flex items-center justify-center gap-3 bg-[#1DA1F2] hover:bg-[#0C85D0] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          <Twitter className="w-5 h-5" />
          {t('twitter')}
        </button>
      </div>
    </motion.div>
  )
}
