import { ImageResponse } from 'next/og'

export const alt = 'MuchLove - Video Testimonials'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const taglines: Record<string, string> = {
    en: 'Video Testimonials That Convert',
    fr: 'Témoignages Vidéo Qui Convertissent',
    es: 'Testimonios en Video Que Convierten',
  }

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          background: 'linear-gradient(135deg, #fff1f2, #ffffff, #fef2f2)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: '#f43f5e',
            marginBottom: 20,
          }}
        >
          MuchLove
        </div>
        <div style={{ fontSize: 36, color: '#64748b' }}>
          {taglines[locale] || taglines.en}
        </div>
      </div>
    ),
    { ...size }
  )
}
