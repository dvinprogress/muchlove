---
name: setup-gamification
description: Implemente un element de gamification (progress-bar, confetti, status-badges, celebration)
argument-hint: "[progress-bar|confetti|status-badges|celebration-modal|all]"
user-invocable: true
---

# Workflow Gamification

Element: **$ARGUMENTS**

Consulter l'agent `ux-copywriter` pour les guidelines copy et animations.

## Elements Disponibles

### 1. Progress Bar

### 2. Confetti Celebrations

### 3. Status Badges

### 4. Celebration Modal

---

## 1. PROGRESS BAR

### 1.1 Installation dependances

```bash
# Deja installe: framer-motion
```

### 1.2 Composant ProgressBar

Fichier: `src/components/gamification/ProgressBar.tsx`

```typescript
'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number  // 0-100
  steps?: { value: number; label: string }[]
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
}

export function ProgressBar({
  value,
  steps,
  showPercentage = false,
  size = 'md'
}: ProgressBarProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Steps indicators */}
      {steps && (
        <div className="relative mt-2">
          <div className="flex justify-between">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{ position: 'absolute', left: `${step.value}%`, transform: 'translateX(-50%)' }}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full border-2 ${
                    value >= step.value
                      ? 'bg-yellow-400 border-yellow-400'
                      : 'bg-white border-gray-300'
                  }`}
                  animate={value >= step.value ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                />
                <span className={`text-xs mt-1 ${
                  value >= step.value ? 'text-yellow-600 font-medium' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Percentage */}
      {showPercentage && (
        <div className="text-right mt-1 text-sm text-gray-500">
          {Math.round(value)}%
        </div>
      )}
    </div>
  )
}
```

### 1.3 Progress Steps MuchLove

```typescript
// Configuration des etapes MuchLove
export const MUCHLOVE_PROGRESS_STEPS = [
  { value: 0, label: 'Start' },
  { value: 25, label: 'Video' },
  { value: 50, label: 'Trustpilot' },
  { value: 75, label: 'Google' },
  { value: 100, label: 'Ambassador' }
]

// Mapping status -> progress
export const STATUS_PROGRESS: Record<string, number> = {
  created: 0,
  invited: 0,
  link_opened: 0,
  video_started: 10,
  video_completed: 25,
  shared_1: 50,
  shared_2: 75,
  shared_3: 100
}
```

---

## 2. CONFETTI CELEBRATIONS

### 2.1 Installation

```bash
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

### 2.2 Utilitaire Confetti

Fichier: `src/lib/confetti.ts`

```typescript
import confetti from 'canvas-confetti'

// Couleurs MuchLove
const MUCHLOVE_COLORS = ['#FFBF00', '#FF6B6B', '#4ECDC4', '#FFD700']

/**
 * Light celebration - apres chaque etape
 */
export function lightCelebration() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: MUCHLOVE_COLORS
  })
}

/**
 * Medium celebration - apres video complete
 */
export function mediumCelebration() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: MUCHLOVE_COLORS
  })
}

/**
 * Ambassador celebration - 3/3 complete
 */
export function ambassadorCelebration() {
  const duration = 5000
  const end = Date.now() + duration

  const frame = () => {
    // Left side
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: MUCHLOVE_COLORS
    })

    // Right side
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: MUCHLOVE_COLORS
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}

/**
 * Fireworks celebration - special occasions
 */
export function fireworksCelebration() {
  const duration = 3000
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 30,
      startVelocity: 30,
      spread: 360,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2
      },
      colors: MUCHLOVE_COLORS
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}
```

### 2.3 Hook useConfetti

Fichier: `src/hooks/useConfetti.ts`

```typescript
'use client'

import { useCallback } from 'react'
import {
  lightCelebration,
  mediumCelebration,
  ambassadorCelebration
} from '@/lib/confetti'

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
```

---

## 3. STATUS BADGES

### 3.1 Composant StatusBadge

Fichier: `src/components/gamification/StatusBadge.tsx`

```typescript
'use client'

import { motion } from 'framer-motion'
import {
  Clock,
  Mail,
  Eye,
  Video,
  Check,
  Share2,
  Star
} from 'lucide-react'

type Status =
  | 'created'
  | 'invited'
  | 'link_opened'
  | 'video_started'
  | 'video_completed'
  | 'shared_1'
  | 'shared_2'
  | 'shared_3'

interface StatusConfig {
  label: string
  color: string
  bgColor: string
  icon: React.ComponentType<{ className?: string }>
  animate?: boolean
}

const STATUS_CONFIG: Record<Status, StatusConfig> = {
  created: {
    label: 'Created',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: Clock
  },
  invited: {
    label: 'Invited',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: Mail
  },
  link_opened: {
    label: 'Opened',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    icon: Eye
  },
  video_started: {
    label: 'Recording',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: Video
  },
  video_completed: {
    label: 'Video Ready',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: Check
  },
  shared_1: {
    label: 'Shared 1/3',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: Share2
  },
  shared_2: {
    label: 'Shared 2/3',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: Share2
  },
  shared_3: {
    label: 'Ambassador',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: Star,
    animate: true
  }
}

interface StatusBadgeProps {
  status: Status
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses[size]}`}
      animate={config.animate ? { scale: [1, 1.05, 1] } : {}}
      transition={config.animate ? { repeat: Infinity, duration: 2 } : {}}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </motion.span>
  )
}
```

---

## 4. CELEBRATION MODAL

### 4.1 Composant CelebrationModal

Fichier: `src/components/gamification/CelebrationModal.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConfetti } from '@/hooks/useConfetti'

type CelebrationType = 'video_complete' | 'share_1' | 'share_2' | 'ambassador'

interface CelebrationConfig {
  headline: string
  body: string
  subtext?: string
  confettiType: 'light' | 'medium' | 'ambassador'
  ctaText: string
}

const CELEBRATION_CONFIG: Record<CelebrationType, CelebrationConfig> = {
  video_complete: {
    headline: "You did it!",
    body: "You just recorded something special. While we add subtitles and polish your video, get ready for the fun part.",
    subtext: "~1 min left to complete",
    confettiType: 'medium',
    ctaText: "Continue"
  },
  share_1: {
    headline: "Nice! 1 down, 2 to go",
    body: "You just helped gain visibility on Trustpilot. That's huge!",
    confettiType: 'light',
    ctaText: "Keep going"
  },
  share_2: {
    headline: "You're on fire!",
    body: "Your story is now on Trustpilot AND Google Reviews. Impressive.",
    confettiType: 'light',
    ctaText: "One last step"
  },
  ambassador: {
    headline: "You're officially an ambassador!",
    body: "You just helped in the biggest way possible. Your video is now live everywhere.",
    subtext: "That's the power of spreading love",
    confettiType: 'ambassador',
    ctaText: "Finish"
  }
}

interface CelebrationModalProps {
  type: CelebrationType
  isOpen: boolean
  companyName?: string
  onContinue: () => void
  autoClose?: number  // ms, 0 = no auto close
}

export function CelebrationModal({
  type,
  isOpen,
  companyName = 'them',
  onContinue,
  autoClose = 0
}: CelebrationModalProps) {
  const config = CELEBRATION_CONFIG[type]
  const { celebrate } = useConfetti()

  // Trigger confetti on open
  useEffect(() => {
    if (isOpen) {
      celebrate(config.confettiType)
    }
  }, [isOpen, config.confettiType, celebrate])

  // Auto close timer
  useEffect(() => {
    if (isOpen && autoClose > 0) {
      const timer = setTimeout(onContinue, autoClose)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, onContinue])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md text-center shadow-xl"
          >
            {/* Emoji */}
            <motion.div
              className="text-6xl mb-4"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              {type === 'ambassador' ? '🏆' : '🎉'}
            </motion.div>

            {/* Headline */}
            <h2 className="text-2xl font-bold mb-3">
              {config.headline}
            </h2>

            {/* Body */}
            <p className="text-gray-600 mb-2">
              {config.body.replace('{companyName}', companyName)}
            </p>

            {/* Subtext */}
            {config.subtext && (
              <p className="text-sm text-gray-400 mb-6">
                {config.subtext}
              </p>
            )}

            {/* CTA */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="px-8 py-3 bg-yellow-500 text-white rounded-full font-medium hover:bg-yellow-600 transition-colors"
            >
              {config.ctaText}
            </motion.button>

            {/* Auto close indicator */}
            {autoClose > 0 && (
              <p className="text-xs text-gray-400 mt-4">
                Continuing automatically...
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## 5. EXPORT INDEX

Fichier: `src/components/gamification/index.ts`

```typescript
export { ProgressBar, MUCHLOVE_PROGRESS_STEPS, STATUS_PROGRESS } from './ProgressBar'
export { StatusBadge } from './StatusBadge'
export { CelebrationModal } from './CelebrationModal'
```

Fichier: `src/hooks/index.ts` (ajouter)

```typescript
export { useConfetti } from './useConfetti'
```

---

## Phase Verification

### Tests manuels

- [ ] Progress bar anime correctement
- [ ] Confetti se declenche
- [ ] Status badges affichent correctement
- [ ] Modal celebration s'ouvre/ferme
- [ ] Animations fluides (pas de jank)

### Quality checks

```bash
npm run lint
npm run type-check
npm run build
```

## Commit

```bash
git add src/components/gamification/ src/hooks/ src/lib/confetti.ts
git commit -m "feat(gamification): add progress bar, confetti, badges, celebration modal"
```
