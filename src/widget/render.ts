export interface WidgetTestimonial {
  id: string
  firstName: string
  companyName: string
  transcription: string | null
  durationSeconds: number | null
  videoUrl: string
  createdAt: string
}

export interface WidgetData {
  testimonials: WidgetTestimonial[]
  theme: {
    showNames: boolean
    showTranscription: boolean
    poweredByVisible: boolean
  }
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function renderWidget(data: WidgetData): string {
  const { testimonials, theme } = data

  if (testimonials.length === 0) {
    return `
      <div class="ml-widget">
        <div class="ml-card">
          <p style="text-align: center; color: #999;">No testimonials yet</p>
        </div>
      </div>
    `
  }

  const cardsHtml = testimonials
    .map((testimonial) => {
      const nameHtml = theme.showNames
        ? `
          <div class="ml-header">
            <div class="ml-name">${testimonial.firstName}</div>
            ${testimonial.companyName ? `<div class="ml-company">${testimonial.companyName}</div>` : ''}
          </div>
        `
        : ''

      const transcriptionHtml =
        theme.showTranscription && testimonial.transcription
          ? `<div class="ml-transcription">${truncateText(testimonial.transcription, 150)}</div>`
          : ''

      return `
        <div class="ml-card" data-testimonial-id="${testimonial.id}">
          <div class="ml-video-container">
            <video
              class="ml-video"
              src="${testimonial.videoUrl}"
              preload="metadata"
              playsinline
            ></video>
            <button class="ml-play-button" aria-label="Play video">
              <svg viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <div class="ml-duration">${formatDuration(testimonial.durationSeconds)}</div>
          </div>
          <div class="ml-content">
            ${nameHtml}
            ${transcriptionHtml}
          </div>
        </div>
      `
    })
    .join('')

  const dotsHtml = testimonials
    .map(
      (_, index) =>
        `<button class="ml-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>`
    )
    .join('')

  const footerHtml = theme.poweredByVisible
    ? `
      <div class="ml-footer">
        Powered by <a href="https://muchlove.app" target="_blank" rel="noopener">MuchLove</a>
      </div>
    `
    : ''

  return `
    <div class="ml-widget">
      <div class="ml-carousel">
        <div class="ml-carousel-track">
          ${cardsHtml}
        </div>
      </div>
      <div class="ml-navigation">
        <button class="ml-nav-button ml-prev" aria-label="Previous" disabled>
          <svg viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <div class="ml-dots">
          ${dotsHtml}
        </div>
        <button class="ml-nav-button ml-next" aria-label="Next">
          <svg viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>
      ${footerHtml}
    </div>
  `
}
