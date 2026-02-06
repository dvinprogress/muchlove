import { redirect } from 'next/navigation'
import { Video } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/dashboard'
import { EmptyState } from '@/components/ui'
import { TestimonialsList } from '@/components/testimonials'

export default async function TestimonialsPage() {
  const supabase = await createClient()

  // Fetch authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  // Fetch testimonials with contact information
  const { data: testimonials, error } = await supabase
    .from('testimonials')
    .select('*, contacts(first_name, company_name, email)')
    .eq('company_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching testimonials:', error)
  }

  const hasTestimonials = testimonials && testimonials.length > 0

  return (
    <div>
      <Header
        title="Témoignages"
        description="Consultez et gérez tous vos témoignages vidéo"
      />

      {!hasTestimonials ? (
        <EmptyState
          icon={<Video className="w-12 h-12 text-slate-400" />}
          title="Aucun témoignage"
          description="Vos témoignages vidéo apparaîtront ici une fois que vos contacts auront enregistré leurs vidéos."
        />
      ) : (
        <TestimonialsList testimonials={testimonials} />
      )}
    </div>
  )
}
