import { generateWidgetStyles } from './styles'
import { renderWidget } from './render'
import type { WidgetData } from './render'

interface WidgetConfig {
  apiKey: string
  apiUrl: string
}

class MuchLoveWidget {
  private container: HTMLElement | null = null
  private shadowRoot: ShadowRoot | null = null
  private config: WidgetConfig
  private currentSlide = 0
  private totalSlides = 0
  private isPlaying = false

  constructor(config: WidgetConfig) {
    this.config = config
  }

  async init(): Promise<void> {
    // Find container
    this.container = document.getElementById('muchlove-widget')
    if (!this.container) {
      console.error('MuchLove Widget: Container #muchlove-widget not found')
      return
    }

    // Create Shadow DOM for style isolation
    this.shadowRoot = this.container.attachShadow({ mode: 'open' })

    // Fetch widget data
    try {
      const data = await this.fetchWidgetData()

      // Render widget
      this.render(data)

      // Attach event listeners
      this.attachEventListeners()
    } catch (error) {
      console.error('MuchLove Widget: Failed to load', error)
      this.renderError()
    }
  }

  private async fetchWidgetData(): Promise<WidgetData> {
    const url = `${this.config.apiUrl}/api/widget/testimonials?key=${encodeURIComponent(this.config.apiKey)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch widget data: ${response.status}`)
    }

    return response.json()
  }

  private render(data: WidgetData): void {
    if (!this.shadowRoot) return

    this.totalSlides = data.testimonials.length

    // Generate styles - pass full theme object
    const fullTheme = {
      ...data.theme,
      showNames: data.theme.showNames,
      showTranscription: data.theme.showTranscription,
      poweredByVisible: data.theme.poweredByVisible,
    }

    const styles = generateWidgetStyles(fullTheme as any)
    const styleElement = document.createElement('style')
    styleElement.textContent = styles
    this.shadowRoot.appendChild(styleElement)

    // Generate HTML
    const html = renderWidget(data)
    const wrapper = document.createElement('div')
    wrapper.innerHTML = html
    this.shadowRoot.appendChild(wrapper)
  }

  private renderError(): void {
    if (!this.shadowRoot) return

    const errorHtml = `
      <div style="padding: 20px; text-align: center; color: #999;">
        <p>Unable to load testimonials</p>
      </div>
    `
    this.shadowRoot.innerHTML = errorHtml
  }

  private attachEventListeners(): void {
    if (!this.shadowRoot) return

    // Play button click
    const playButtons = this.shadowRoot.querySelectorAll('.ml-play-button')
    playButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault()
        const card = (e.target as HTMLElement).closest('.ml-card')
        const video = card?.querySelector('video')
        if (video) {
          this.playVideo(video, button as HTMLElement)
        }
      })
    })

    // Navigation buttons
    const prevButton = this.shadowRoot.querySelector('.ml-prev')
    const nextButton = this.shadowRoot.querySelector('.ml-next')

    prevButton?.addEventListener('click', () => this.goToPrevSlide())
    nextButton?.addEventListener('click', () => this.goToNextSlide())

    // Dots navigation
    const dots = this.shadowRoot.querySelectorAll('.ml-dot')
    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        const index = parseInt((e.target as HTMLElement).dataset.index || '0', 10)
        this.goToSlide(index)
      })
    })

    // Video ended - hide controls, show play button again
    const videos = this.shadowRoot.querySelectorAll('video')
    videos.forEach((video) => {
      video.addEventListener('ended', () => {
        const card = video.closest('.ml-card')
        const playButton = card?.querySelector('.ml-play-button')
        if (playButton) {
          ;(playButton as HTMLElement).style.display = 'flex'
        }
        this.isPlaying = false
      })
    })
  }

  private playVideo(video: HTMLVideoElement, button: HTMLElement): void {
    if (this.isPlaying) return

    // Hide play button
    button.style.display = 'none'

    // Play video
    video.play().catch((error) => {
      console.error('MuchLove Widget: Failed to play video', error)
      button.style.display = 'flex'
    })

    this.isPlaying = true
  }

  private goToSlide(index: number): void {
    if (index < 0 || index >= this.totalSlides) return

    this.currentSlide = index

    // Update carousel transform
    const track = this.shadowRoot?.querySelector('.ml-carousel-track') as HTMLElement
    if (track) {
      const cardWidth = 100 // Each card is 100% width on mobile, adjusted by media queries
      track.style.transform = `translateX(-${index * cardWidth}%)`
    }

    // Update dots
    const dots = this.shadowRoot?.querySelectorAll('.ml-dot')
    dots?.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add('active')
      } else {
        dot.classList.remove('active')
      }
    })

    // Update navigation buttons
    const prevButton = this.shadowRoot?.querySelector('.ml-prev') as HTMLButtonElement
    const nextButton = this.shadowRoot?.querySelector('.ml-next') as HTMLButtonElement

    if (prevButton) {
      prevButton.disabled = index === 0
    }
    if (nextButton) {
      nextButton.disabled = index === this.totalSlides - 1
    }
  }

  private goToPrevSlide(): void {
    this.goToSlide(this.currentSlide - 1)
  }

  private goToNextSlide(): void {
    this.goToSlide(this.currentSlide + 1)
  }
}

// Auto-initialize when DOM is ready
function autoInit(): void {
  const container = document.getElementById('muchlove-widget')
  if (!container) return

  const apiKey = container.dataset.apiKey
  if (!apiKey) {
    console.error('MuchLove Widget: data-api-key attribute is required')
    return
  }

  const apiUrl = container.dataset.apiUrl || 'https://muchlove.app'

  const widget = new MuchLoveWidget({ apiKey, apiUrl })
  widget.init()
}

// Initialize on DOMContentLoaded or immediately if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit)
} else {
  autoInit()
}

export { MuchLoveWidget }
