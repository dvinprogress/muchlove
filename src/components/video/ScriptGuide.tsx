'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
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

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollContainerRef.current
    const card = container?.querySelector(`[data-index="${index}"]`)
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [])

  const goToPrev = useCallback(() => {
    const newIndex = Math.max(0, activeIndex - 1)
    scrollToIndex(newIndex)
  }, [activeIndex, scrollToIndex])

  const goToNext = useCallback(() => {
    const newIndex = Math.min(SCRIPTS.length - 1, activeIndex + 1)
    scrollToIndex(newIndex)
  }, [activeIndex, scrollToIndex])

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
      {/* Container avec flèches */}
      <div className="relative">
        {/* Flèche gauche */}
        {activeIndex > 0 && (
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-300 transition-colors"
            aria-label="Script précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Flèche droite */}
        {activeIndex < SCRIPTS.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-300 transition-colors"
            aria-label="Script suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Container scrollable horizontal */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 px-2"
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
              animate={{
                opacity: 1,
                x: 0,
                scale: expandedCard === index ? 1.05 : 1,
                zIndex: expandedCard === index ? 10 : 1
              }}
              transition={{
                delay: expandedCard !== null ? 0 : index * 0.1,
                type: "spring",
                stiffness: 300
              }}
              onClick={() => setExpandedCard(expandedCard === index ? null : index)}
              className="flex-shrink-0 w-[320px] md:w-[360px] snap-center cursor-pointer"
            >
              <div className="bg-white/80 backdrop-blur border border-gray-100 rounded-lg p-4 h-full shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-sm font-semibold text-rose-500 mb-1">
                  {t(script.titleKey)}
                </h4>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  {formatScript(t(script.scriptKey, { companyName }))}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dots indicators */}
      <div className="flex justify-center gap-1.5">
        {SCRIPTS.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              activeIndex === index
                ? 'bg-rose-500 w-4'
                : 'bg-gray-300 hover:bg-gray-400 w-1.5'
            }`}
            aria-label={`Script ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
