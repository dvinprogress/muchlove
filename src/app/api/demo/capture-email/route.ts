import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import type { Database } from '@/types/database'

const captureEmailSchema = z.object({
  sessionId: z.string().min(10).max(32),
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation Zod
    const validatedData = captureEmailSchema.parse(body)

    // Supabase admin client
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update demo_sessions SET email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('demo_sessions')
      .update({ email: validatedData.email })
      .eq('session_id', validatedData.sessionId)

    if (updateError) {
      console.error('Email capture error:', updateError)
      return NextResponse.json(
        { error: 'Failed to capture email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Capture email error:', error)

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
