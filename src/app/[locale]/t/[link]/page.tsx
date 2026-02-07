import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TestimonialRecordingPage } from './TestimonialRecordingPage'
import type { Database } from '@/types/database'

type Contact = Database['public']['Tables']['contacts']['Row']
type Company = Database['public']['Tables']['companies']['Row']

interface ContactWithCompany extends Contact {
  companies: Company | null
}

interface PageProps {
  params: Promise<{ link: string }>
}

export default async function TestimonialPage({ params }: PageProps) {
  const { link } = await params
  const supabase = await createClient()

  // Fetch contact par unique_link avec les infos de la company
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*, companies(*)')
    .eq('unique_link', link)
    .single<ContactWithCompany>()

  if (error || !contact) {
    notFound()
  }

  // Mettre à jour le statut si c'est la première ouverture du lien
  if (contact.status === 'created' || contact.status === 'invited') {
    await supabase
      .from('contacts')
      .update({
        status: 'link_opened',
        link_opened_at: new Date().toISOString(),
      })
      .eq('id', contact.id)
  }

  const company = contact.companies
  const companyName = company?.name ?? contact.company_name

  // Fetch the testimonial if one exists (for duration)
  const { data: testimonial } = await supabase
    .from('testimonials')
    .select('id, duration_seconds')
    .eq('contact_id', contact.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <TestimonialRecordingPage
      contactId={contact.id}
      companyId={contact.company_id}
      contactFirstName={contact.first_name}
      companyName={companyName}
      companyLogoUrl={company?.logo_url ?? null}
      contactStatus={contact.status}
      companyGooglePlaceId={company?.google_place_id ?? null}
      companyTrustpilotUrl={company?.trustpilot_url ?? null}
      testimonialId={testimonial?.id ?? ''}
      testimonialDuration={testimonial?.duration_seconds ?? undefined}
    />
  )
}
