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
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const formatScript = (script: string) => {
    const parts = script.split('___')
    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {index < parts.length - 1 && (
          <span className="font-bold text-rose-400 border-b-2 border-dashed border-rose-300 px-1">
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
      { root: container, threshold: 0.5 }
    )

    const cards = container.querySelectorAll('[data-index]')
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  const handleSelect = (index: number) => {
    setSelectedCard(selectedCard === index ? null : index)
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide px-1">
        {t('guideTitle') || 'Choisissez votre script'}
      </h3>

      {/* Desktop: Vertical stack */}
      <div className="hidden lg:flex flex-col gap-3">
        {SCRIPTS.map((script, index) => {
          const isSelected = selectedCard === index
          return (
            <motion.div
              key={script.key}
              onClick={() => handleSelect(index)}
              animate={{
                scale: isSelected ? 1.03 : 1,
                opacity: selectedCard !== null && !isSelected ? 0.6 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`
                cursor-pointer rounded-xl p-5 transition-colors duration-200
                ${isSelected
                  ? 'bg-rose-50 border-2 border-rose-400 shadow-md'
                  : 'bg-white border-2 border-slate-100 hover:border-slate-200 shadow-sm hover:shadow'
                }
              `}
            >
              <h4 className={`text-sm mb-2 ${isSelected ? 'font-bold text-rose-600' : 'font-semibold text-rose-500'}`}>
                {t(script.titleKey)}
              </h4>
              <p className={`leading-relaxed ${isSelected ? 'text-base font-semibold text-slate-900' : 'text-sm text-slate-600'}`}>
                {formatScript(t(script.scriptKey, { companyName }))}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Mobile: Horizontal scroll */}
      <div className="lg:hidden">
        <div className="relative">
          {activeIndex > 0 && (
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors"
              aria-label="Script précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {activeIndex < SCRIPTS.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors"
              aria-label="Script suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {SCRIPTS.map((script, index) => {
              const isSelected = selectedCard === index
              return (
                <motion.div
                  key={script.key}
                  data-index={index}
                  onClick={() => handleSelect(index)}
                  animate={{
                    scale: isSelected ? 1.03 : 1,
                    opacity: selectedCard !== null && !isSelected ? 0.6 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className={`
                    flex-shrink-0 w-[300px] snap-center cursor-pointer rounded-xl p-4
                    ${isSelected
                      ? 'bg-rose-50 border-2 border-rose-400 shadow-md'
                      : 'bg-white border-2 border-slate-100 shadow-sm'
                    }
                  `}
                >
                  <h4 className={`text-sm mb-1 ${isSelected ? 'font-bold text-rose-600' : 'font-semibold text-rose-500'}`}>
                    {t(script.titleKey)}
                  </h4>
                  <p className={`leading-relaxed ${isSelected ? 'text-base font-semibold text-slate-900' : 'text-sm text-slate-600'}`}>
                    {formatScript(t(script.scriptKey, { companyName }))}
                  </p>
                </motion.div>
              )
            })}
          </div>

          <div className="flex justify-center gap-1.5 mt-2">
            {SCRIPTS.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  activeIndex === index ? 'bg-rose-500 w-4' : 'bg-gray-300 hover:bg-gray-400 w-1.5'
                }`}
                aria-label={`Script ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
