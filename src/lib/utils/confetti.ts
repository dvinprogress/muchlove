// Couleurs MuchLove : rose, gold, turquoise, corail
const MUCHLOVE_COLORS = ['#f43f5e', '#fbbf24', '#2dd4bf', '#fb7185', '#fcd34d']

async function getConfetti() {
  return (await import('canvas-confetti')).default
}

// Celebration legere - 50 particules (apres partage)
export async function lightCelebration(): Promise<void> {
  const confetti = await getConfetti()
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: MUCHLOVE_COLORS,
    disableForReducedMotion: true,
  })
}

// Celebration moyenne - 100 particules (apres video)
export async function mediumCelebration(): Promise<void> {
  const confetti = await getConfetti()
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: MUCHLOVE_COLORS,
    disableForReducedMotion: true,
  })
}

// Celebration ambassadeur - 5 secondes continu, 2 sources (gauche + droite)
export async function ambassadorCelebration(): Promise<void> {
  const confetti = await getConfetti()
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
