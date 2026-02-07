'use client'

import { useCallback } from 'react'
import { lightCelebration, mediumCelebration, ambassadorCelebration } from '@/lib/utils/confetti'

type CelebrationType = 'light' | 'medium' | 'ambassador'

export function useConfetti() {
  const celebrate = useCallback((type: CelebrationType = 'light') => {
    switch (type) {
      case 'light':
        void lightCelebration()
        break
      case 'medium':
        void mediumCelebration()
        break
      case 'ambassador':
        void ambassadorCelebration()
        break
    }
  }, [])

  return { celebrate }
}
