---
paths:
  - "src/components/**/*"
  - "**/*.tsx"
---

# Conventions Framer Motion MuchLove

## Performance

### Privilegier les proprietes GPU-accelerated

```typescript
// BON - GPU accelerated (transform)
animate={{ x: 100, scale: 1.1, rotate: 45, opacity: 0.5 }}

// EVITER - Layout thrashing
animate={{ left: 100, width: 200, height: 300 }}
```

### Layout animations avec layoutId

```typescript
// Transitions fluides entre composants
<motion.div layoutId={`card-${id}`} />
```

### Eviter les re-renders

```typescript
// Definir variants en dehors du composant
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

function Component() {
  return <motion.div variants={variants} />
}
```

## Variants MuchLove

### Page Transitions

```typescript
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { opacity: 0, y: -20 }
}

// Usage
<motion.div
  initial="initial"
  animate="animate"
  exit="exit"
  variants={pageVariants}
>
```

### Stagger Children

```typescript
export const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

// Usage
<motion.ul variants={containerVariants} initial="initial" animate="animate">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants} />
  ))}
</motion.ul>
```

### Micro-interactions Boutons

```typescript
export const buttonVariants = {
  tap: { scale: 0.95 },
  hover: { scale: 1.02 }
}

// Usage
<motion.button
  whileTap="tap"
  whileHover="hover"
  variants={buttonVariants}
>
```

### Cards Hover

```typescript
export const cardVariants = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  hover: { y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }
}
```

## Animations MuchLove

### Progress Bar

```typescript
export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}
```

### Success Pulse

```typescript
export const successPulse = {
  scale: [1, 1.05, 1],
  transition: { duration: 0.3 }
}

// Trigger on success
<motion.div animate={success ? successPulse : {}} />
```

### Fade In Up (liste items)

```typescript
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}
```

## Celebrations

### Confetti (canvas-confetti)

```typescript
import confetti from 'canvas-confetti'

// Couleurs MuchLove
const muchLoveColors = ['#FFBF00', '#FF6B6B', '#4ECDC4']

// Light celebration
export function lightCelebration() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.6 },
    colors: muchLoveColors
  })
}

// Ambassador celebration (intense)
export function ambassadorCelebration() {
  const duration = 5000
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: muchLoveColors
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: muchLoveColors
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}
```

## AnimatePresence

### Toujours wrapper les elements conditionnels

```typescript
import { AnimatePresence } from 'framer-motion'

<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

### Mode pour transitions

- `mode="wait"` : Attend la sortie avant l'entree
- `mode="sync"` : Simultane (defaut)
- `mode="popLayout"` : Pour les listes

## Spring vs Tween

### Spring (naturel, rebond)

```typescript
transition: { type: 'spring', stiffness: 300, damping: 20 }
```

### Tween (precis, lineaire)

```typescript
transition: { duration: 0.3, ease: 'easeOut' }
```

### Recommandations MuchLove

- **Boutons**: Spring (feedback tactile)
- **Pages**: Tween easeOut (smooth)
- **Progress**: Tween easeOut (precis)
- **Celebrations**: Spring (fun)
