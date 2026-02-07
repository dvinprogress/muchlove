"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface WidgetSnippetProps {
  apiKey: string
}

export function WidgetSnippet({ apiKey }: WidgetSnippetProps) {
  const t = useTranslations('widget.snippet')
  const [copied, setCopied] = useState(false)

  const snippet = `<!-- MuchLove Widget -->
<div id="muchlove-widget" data-api-key="${apiKey}"></div>
<script src="https://muchlove.app/widget/muchlove-widget.js" async defer></script>`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{t('title')}</h3>
        <p className="text-sm text-slate-600 mt-1">{t('description')}</p>
      </div>

      <div className="relative">
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{snippet}</code>
        </pre>
        <motion.button
          onClick={handleCopy}
          className="absolute top-3 right-3 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md flex items-center gap-2 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              {t('copied')}
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              {t('copy')}
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
