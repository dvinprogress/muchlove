import confetti from 'canvas-confetti'

// Couleurs MuchLove : rose, gold, turquoise, corail
const MUCHLOVE_COLORS = ['#f43f5e', '#fbbf24', '#2dd4bf', '#fb7185', '#fcd34d']

// Celebration legere - 50 particules (apres partage)
export function lightCelebration(): void {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: MUCHLOVE_COLORS,
    disableForReducedMotion: true,
  })
}

// Celebration moyenne - 100 particules (apres video)
export function mediumCelebration(): void {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: MUCHLOVE_COLORS,
    disableForReducedMotion: true,
  })
}

// Celebration ambassadeur - 5 secondes continu, 2 sources (gauche + droite)
export function ambassadorCelebration(): void {
  const duration = 5000
  const end = Date.now() + duration

  const frame = (): void => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: MUCHLOVE_COLORS,
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: MUCHLOVE_COLORS,
      disableForReducedMotion: true,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}
