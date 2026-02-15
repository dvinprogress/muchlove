import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const slugSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/)

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const validation = slugSchema.safeParse(slug)
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data: company, error } = await supabase
    .from('companies')
    .select('id, name, logo_url, google_place_id, trustpilot_url')
    .eq('public_slug', slug)
    .eq('public_link_enabled', true)
    .single()

  if (error || !company) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(company, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  })
}
