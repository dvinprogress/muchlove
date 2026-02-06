"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserPlus, Link as LinkIcon, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function QuickActions() {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('dashboard.quickActions')

  const handleCopyLink = async () => {
    // TODO: Récupérer le vrai lien de la page publique depuis les settings
    const publicLink = `${window.location.origin}/p/demo`

    await navigator.clipboard.writeText(publicLink)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Nouveau contact */}
      <Link href="/dashboard/contacts/new">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 p-4 bg-rose-500 text-white rounded-xl transition-shadow hover:shadow-lg"
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-medium">{t('newContact')}</span>
        </motion.div>
      </Link>

      {/* Copier mon lien */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={handleCopyLink}
        className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl transition-shadow hover:shadow-lg"
      >
        {copied ? (
          <>
            <Check className="w-5 h-5 text-green-500" />
            <span className="font-medium text-slate-900">{t('linkCopied')}</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-5 h-5 text-slate-600" />
            <span className="font-medium text-slate-900">{t('copyLink')}</span>
          </>
        )}
      </motion.button>
    </div>
  )
}
