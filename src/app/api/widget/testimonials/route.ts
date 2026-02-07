import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { WidgetData, WidgetTheme } from '@/types/widget'
import { DEFAULT_WIDGET_THEME } from '@/types/widget'

const querySchema = z.object({
  key: z.string().min(1),
})

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const rawParams = {
      key: searchParams.get('key'),
    }

    // Validate query params
    const validation = querySchema.safeParse(rawParams)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Missing or invalid api_key parameter' },
        { status: 400 }
      )
    }

    const { key } = validation.data
    const supabase = getSupabaseAdmin()

    // Fetch widget config by api_key
    const { data: widgetConfig, error: configError } = await supabase
      .from('widget_configs')
      .select('*')
      .eq('api_key', key)
      .single()

    if (configError || !widgetConfig) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    if (!widgetConfig.enabled) {
      return NextResponse.json(
        { error: 'Widget is disabled' },
        { status: 403 }
      )
    }

    // CORS check: verify allowed_domains
    const origin = request.headers.get('origin')
    const allowedDomains = widgetConfig.allowed_domains || []

    if (allowedDomains.length > 0 && origin) {
      const originHostname = new URL(origin).hostname
      const isAllowed = allowedDomains.some(domain => {
        // Support wildcards like *.example.com
        if (domain.startsWith('*.')) {
          const baseDomain = domain.slice(2)
          return originHostname.endsWith(baseDomain)
        }
        return originHostname === domain
      })

      if (!isAllowed) {
        return NextResponse.json(
          { error: 'Origin not allowed' },
          { status: 403 }
        )
      }
    }

    // Fetch testimonials for this company
    const { data: testimonials, error: testimonialsError } = await supabase
      .from('testimonials')
      .select(`
        id,
        raw_video_url,
        transcription,
        duration_seconds,
        created_at,
        contacts (
          first_name,
          company_name
        )
      `)
      .eq('company_id', widgetConfig.company_id)
      .eq('processing_status', 'completed')
      .or('shared_trustpilot.eq.true,shared_google.eq.true,shared_linkedin.eq.true')
      .order('created_at', { ascending: false })
      .limit(10)

    if (testimonialsError) {
      console.error('Error fetching testimonials:', testimonialsError)
      return NextResponse.json(
        { error: 'Failed to fetch testimonials' },
        { status: 500 }
      )
    }

    // Format testimonials with signed URLs
    const formattedTestimonials = await Promise.all(
      (testimonials || []).map(async (t) => {
        let videoUrl = ''

        if (t.raw_video_url) {
          // Generate signed URL valid for 1 hour
          const { data: signedData } = await supabase.storage
            .from('videos')
            .createSignedUrl(t.raw_video_url, 3600)

          videoUrl = signedData?.signedUrl || ''
        }

        return {
          id: t.id,
          firstName: (t.contacts as any)?.first_name || 'Anonymous',
          companyName: (t.contacts as any)?.company_name || '',
          transcription: t.transcription,
          durationSeconds: t.duration_seconds,
          videoUrl,
          createdAt: t.created_at,
        }
      })
    )

    // Parse theme from JSONB
    const theme: WidgetTheme = {
      ...DEFAULT_WIDGET_THEME,
      ...(widgetConfig.theme as Partial<WidgetTheme>),
    }

    const responseData: WidgetData = {
      testimonials: formattedTestimonials,
      theme,
      poweredByVisible: theme.poweredByVisible,
    }

    // CORS headers
    const corsOrigin = allowedDomains.length > 0 && origin ? origin : '*'

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    })

  } catch (error) {
    console.error('Widget API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
