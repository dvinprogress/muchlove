'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface DemoCounterProps {
  className?: string
}

export function DemoCounter({ className = '' }: DemoCounterProps) {
  const t = useTranslations('demo.intro')
  const [count, setCount] = useState<number | null>(null)
  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    fetch('/api/demo/count')
      .then(res => res.json())
      .then(data => {
        if (data.count > 0) {
          setCount(data.count)
        }
      })
      .catch(() => setCount(null))
  }, [])

  // Animation du compteur
  useEffect(() => {
    if (count === null || count === 0) return

    let start = 0
    const duration = 1000 // 1 seconde
    const increment = count / (duration / 16) // 60fps

    const timer = setInterval(() => {
      start += increment
      if (start >= count) {
        setDisplayCount(count)
        clearInterval(timer)
      } else {
        setDisplayCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [count])

  // Ne rien afficher si count = 0 ou erreur
  if (count === null || count === 0) {
    return null
  }

  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className={`text-sm text-slate-500 text-center ${className}`}
    >
      {t('counter', { count: displayCount })}
    </motion.p>
  )
}
