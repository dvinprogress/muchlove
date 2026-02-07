import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { createHash } from 'crypto'
import type { Database } from '@/types/database'

const demoUploadSchema = z.object({
  sessionId: z.string().min(10).max(32),
  duration: z.coerce.number().positive().max(180),
  transcription: z.string().max(10000).optional(),
})

function hashIP(ip: string): string {
  const secret = process.env.CRON_SECRET
  if (!secret) throw new Error('CRON_SECRET environment variable is required')
  return createHash('sha256').update(ip + secret).digest('hex').slice(0, 16)
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting par IP (max 3 uploads/IP/24h)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const ipHash = hashIP(ip)

    // Supabase admin client
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Vérifier le rate limit
    const { data: existingSessions, error: checkError } = await supabase
      .from('demo_sessions')
      .select('id')
      .eq('ip_hash', ipHash)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (checkError) {
      console.error('Rate limit check error:', checkError)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    if (existingSessions && existingSessions.length >= 3) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again tomorrow.' },
        { status: 429 }
      )
    }

    // Récupérer les données du formulaire
    const formData = await request.formData()
    const videoFile = formData.get('video') as File
    const sessionId = formData.get('sessionId') as string
    const duration = formData.get('duration') as string
    const transcription = formData.get('transcription') as string | null

    // Validation Zod
    const validatedData = demoUploadSchema.parse({
      sessionId,
      duration,
      transcription: transcription || undefined,
    })

    if (!videoFile) {
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      )
    }

    // Upload vers bucket demo-videos
    const filePath = `demo/${validatedData.sessionId}/recording.webm`
    const { error: uploadError } = await supabase.storage
      .from('demo-videos')
      .upload(filePath, videoFile, {
        contentType: videoFile.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload video' },
        { status: 500 }
      )
    }

    // Insert dans demo_sessions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from('demo_sessions')
      .insert({
        session_id: validatedData.sessionId,
        ip_hash: ipHash,
        duration_seconds: validatedData.duration,
        transcription: validatedData.transcription || null,
        email: null,
        video_url: filePath,
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sessionId: validatedData.sessionId,
    })
  } catch (error) {
    console.error('Demo upload error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.format() },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
