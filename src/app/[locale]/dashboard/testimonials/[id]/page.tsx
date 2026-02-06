import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Hash, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/dashboard'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'

type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

const statusConfig: Record<
  ProcessingStatus,
  { variant: 'default' | 'success' | 'warning' | 'danger'; label: string }
> = {
  pending: { variant: 'default', label: 'En attente' },
  processing: { variant: 'warning', label: 'En cours' },
  completed: { variant: 'success', label: 'Terminé' },
  failed: { variant: 'danger', label: 'Échoué' },
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return 'Non disponible'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}min ${remainingSeconds}s`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default async function TestimonialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  // Fetch testimonial with contact information
  const { data: testimonial, error } = await supabase
    .from('testimonials')
    .select('*, contacts(first_name, last_name, company_name, email)')
    .eq('id', id)
    .eq('company_id', user.id)
    .single()

  if (error || !testimonial) {
    notFound()
  }

  const status = statusConfig[testimonial.processing_status as ProcessingStatus]
  const contact = testimonial.contacts

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/testimonials">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux témoignages
          </Button>
        </Link>
        <Header
          title={`Témoignage de ${contact.first_name}`}
          description={contact.company_name}
        />
      </div>

      <div className="space-y-6">
        {/* Video Section */}
        <Card>
          <CardHeader>
            <CardTitle>Vidéo</CardTitle>
          </CardHeader>
          <CardContent>
            {testimonial.processed_video_url ? (
              <video
                controls
                className="w-full rounded-lg bg-black"
                poster={testimonial.thumbnail_url || undefined}
              >
                <source src={testimonial.processed_video_url} type="video/mp4" />
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            ) : testimonial.youtube_url ? (
              <div className="space-y-4">
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">Vidéo hébergée sur YouTube</p>
                </div>
                <a
                  href={testimonial.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium"
                >
                  Voir sur YouTube
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                <p className="text-slate-500">Vidéo non disponible</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Contact</p>
                <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                <p className="text-sm text-slate-600">{contact.email}</p>
                <p className="text-sm text-slate-600">{contact.company_name}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">Statut</p>
                <Badge variant={status.variant} dot={testimonial.processing_status === 'processing'}>
                  {status.label}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm">Durée: {formatDuration(testimonial.duration_seconds)}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <Hash className="w-4 h-4 text-slate-400" />
                <span className="text-sm">Tentative n°{testimonial.attempt_number}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div className="text-sm">
                  <p>Créé le {formatDate(testimonial.created_at)}</p>
                  {testimonial.completed_at && (
                    <p className="text-slate-500">
                      Terminé le {formatDate(testimonial.completed_at)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sharing Status */}
          <Card>
            <CardHeader>
              <CardTitle>Partage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Trustpilot</span>
                {testimonial.shared_trustpilot ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Google</span>
                {testimonial.shared_google ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">LinkedIn</span>
                {testimonial.shared_linkedin ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-300" />
                )}
              </div>

              {testimonial.linkedin_post_text && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500 mb-2">Texte LinkedIn</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {testimonial.linkedin_post_text}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transcription Section */}
        {testimonial.transcription && (
          <Card>
            <CardHeader>
              <CardTitle>Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans bg-slate-50 p-4 rounded-lg border border-slate-200">
                {testimonial.transcription}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
