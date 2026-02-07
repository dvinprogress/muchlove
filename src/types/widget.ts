export interface WidgetTheme {
  primaryColor: string
  backgroundColor: string
  borderRadius: string
  layout: 'carousel' | 'grid'
  maxItems: number
  showNames: boolean
  showTranscription: boolean
  poweredByVisible: boolean
}

export const DEFAULT_WIDGET_THEME: WidgetTheme = {
  primaryColor: '#FFBF00',
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  layout: 'carousel',
  maxItems: 5,
  showNames: true,
  showTranscription: true,
  poweredByVisible: true,
}

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
  theme: WidgetTheme
  poweredByVisible: boolean
}
