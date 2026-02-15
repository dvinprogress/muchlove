import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const slugSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/)

const registerSchema = z.object({
  first_name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  company_name: z.string().min(1).max(200),
  website: z.string().max(0).optional(), // Honeypot - must be empty
})

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 }) // 1 hour window
    return false
  }

  entry.count++
  return entry.count > 10 // Max 10 per hour
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // 1. Validate slug
  const slugValidation = slugSchema.safeParse(slug)
  if (!slugValidation.success) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  // 2. Rate limiting by IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // 3. Parse and validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const validation = registerSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0]?.message ?? 'Invalid data' },
      { status: 400 }
    )
  }

  const { first_name, email, company_name, website } = validation.data

  // 4. Honeypot check
  if (website) {
    // Silently reject bots that fill the hidden field
    return NextResponse.json({ contactId: 'ok', uniqueLink: 'ok', alreadyRecorded: false })
  }

  const supabase = getSupabaseAdmin()

  // 5. Verify company exists and public link is enabled
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, videos_used, videos_limit')
    .eq('public_slug', slug)
    .eq('public_link_enabled', true)
    .single()

  if (companyError || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  // 6. Check video quota
  if (company.videos_used >= company.videos_limit) {
    return NextResponse.json({ error: 'Video quota reached' }, { status: 403 })
  }

  // 7. Deduplication: check if contact with same email already exists for this company
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id, unique_link, status')
    .eq('company_id', company.id)
    .eq('email', email)
    .single()

  if (existingContact) {
    const hasRecorded = ['video_completed', 'shared_1', 'shared_2', 'shared_3'].includes(existingContact.status)
    return NextResponse.json({
      contactId: existingContact.id,
      uniqueLink: existingContact.unique_link,
      alreadyRecorded: hasRecorded,
    })
  }

  // 8. Create new organic contact
  const uniqueLink = nanoid(12)

  const { data: newContact, error: insertError } = await supabase
    .from('contacts')
    .insert({
      company_id: company.id,
      first_name,
      email,
      company_name,
      unique_link: uniqueLink,
      status: 'link_opened',
      source: 'organic',
      link_opened_at: new Date().toISOString(),
    })
    .select('id, unique_link')
    .single()

  if (insertError || !newContact) {
    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    contactId: newContact.id,
    uniqueLink: newContact.unique_link,
    alreadyRecorded: false,
  })
}
