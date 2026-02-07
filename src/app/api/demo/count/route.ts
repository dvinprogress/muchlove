import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function GET() {
  try {
    // Supabase admin client
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Query: count des sessions des 7 derniers jours
    const { count, error } = await supabase
      .from('demo_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      console.error('Count error:', error)
      return NextResponse.json(
        { count: 0 },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=300', // Cache 5 min
          },
        }
      )
    }

    return NextResponse.json(
      { count: count || 0 },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300', // Cache 5 min
        },
      }
    )
  } catch (error) {
    console.error('Demo count error:', error)
    return NextResponse.json(
      { count: 0 },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300',
        },
      }
    )
  }
}
