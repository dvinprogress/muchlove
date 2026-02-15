import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { PublicRecordingPage } from './PublicRecordingPage'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = getSupabaseAdmin()

  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('public_slug', slug)
    .eq('public_link_enabled', true)
    .single()

  if (!company) {
    return { title: 'Not Found' }
  }

  return {
    title: `Share your experience with ${company.name} | MuchLove`,
    description: `Record a quick video testimonial for ${company.name} — it only takes a minute!`,
  }
}

export default async function PublicLinkPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = getSupabaseAdmin()

  const { data: company, error } = await supabase
    .from('companies')
    .select('id, name, logo_url, google_place_id, trustpilot_url')
    .eq('public_slug', slug)
    .eq('public_link_enabled', true)
    .single()

  if (error || !company) {
    notFound()
  }

  return (
    <PublicRecordingPage
      slug={slug}
      companyId={company.id}
      companyName={company.name}
      companyLogoUrl={company.logo_url}
      companyGooglePlaceId={company.google_place_id}
      companyTrustpilotUrl={company.trustpilot_url}
    />
  )
}
