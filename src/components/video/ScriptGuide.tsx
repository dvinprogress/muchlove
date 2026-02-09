'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface ScriptGuideProps {
  companyName: string
}

const SCRIPTS = [
  { key: '1', titleKey: 'title1', scriptKey: 'script1' },
  { key: '2', titleKey: 'title2', scriptKey: 'script2' },
  { key: '3', titleKey: 'title3', scriptKey: 'script3' },
] as const

export function ScriptGuide({ companyName }: ScriptGuideProps) {
  const t = useTranslations('video.scripts')
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Fonction pour formater le script avec les blancs soulignés
  const formatScript = (script: string) => {
    const parts = script.split('___')
    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {index < parts.length - 1 && (
          <span className="font-semibold text-rose-400 border-b-2 border-dashed border-rose-300 px-1">
            ___
          </span>
        )}
      </span>
    ))
  }

  // Observer pour détecter quelle carte est visible
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            setActiveIndex(index)
          }
        })
      },
      {
        root: container,
        threshold: 0.5,
      }
    )

    const cards = container.querySelectorAll('[data-index]')
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="mt-4 space-y-2">
      {/* Container scrollable horizontal */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {SCRIPTS.map((script, index) => (
          <motion.div
            key={script.key}
            data-index={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-[280px] snap-center"
          >
            <div className="bg-white/80 backdrop-blur border border-gray-100 rounded-lg p-3 h-full shadow-sm">
              <h4 className="text-xs font-semibold text-rose-500 mb-1">
                {t(script.titleKey)}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {formatScript(t(script.scriptKey, { companyName }))}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dots indicators */}
      <div className="flex justify-center gap-1.5">
        {SCRIPTS.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const container = scrollContainerRef.current
              const card = container?.querySelector(`[data-index="${index}"]`)
              card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
              activeIndex === index
                ? 'bg-rose-500 w-4'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Voir le script ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
