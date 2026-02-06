'use client'

import { useCallback } from 'react'
import { lightCelebration, mediumCelebration, ambassadorCelebration } from '@/lib/utils/confetti'

type CelebrationType = 'light' | 'medium' | 'ambassador'

export function useConfetti() {
  const celebrate = useCallback((type: CelebrationType = 'light') => {
    switch (type) {
      case 'light':
        lightCelebration()
        break
      case 'medium':
        mediumCelebration()
        break
      case 'ambassador':
        ambassadorCelebration()
        break
    }
  }, [])

  return { celebrate }
}
