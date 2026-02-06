import Link from 'next/link'
import { Play, Calendar, Clock, Share2 } from 'lucide-react'
import { Card, CardContent, Badge } from '@/components/ui'

type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface Contact {
  first_name: string
  company_name: string
}

interface TestimonialCardProps {
  testimonial: {
    id: string
    thumbnail_url: string | null
    processing_status: ProcessingStatus
    duration_seconds: number | null
    shared_trustpilot: boolean
    shared_google: boolean
    shared_linkedin: boolean
    created_at: string
    contacts: Contact
  }
}

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
  if (!seconds) return '--:--'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const status = statusConfig[testimonial.processing_status]
  const sharedPlatforms = [
    { name: 'Trustpilot', active: testimonial.shared_trustpilot },
    { name: 'Google', active: testimonial.shared_google },
    { name: 'LinkedIn', active: testimonial.shared_linkedin },
  ].filter((p) => p.active)

  return (
    <Link href={`/dashboard/testimonials/${testimonial.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-4">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-slate-100 rounded-lg mb-4 overflow-hidden">
            {testimonial.thumbnail_url ? (
              <img
                src={testimonial.thumbnail_url}
                alt={`Témoignage de ${testimonial.contacts.first_name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-12 h-12 text-slate-400" />
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="mb-3">
            <h3 className="font-semibold text-slate-900">
              {testimonial.contacts.first_name}
            </h3>
            <p className="text-sm text-slate-500">
              {testimonial.contacts.company_name}
            </p>
          </div>

          {/* Status & Duration */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={status.variant} dot={testimonial.processing_status === 'processing'}>
              {status.label}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              {formatDuration(testimonial.duration_seconds)}
            </div>
          </div>

          {/* Shared Platforms */}
          {sharedPlatforms.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="w-4 h-4 text-slate-400" />
              <div className="flex gap-1.5">
                {sharedPlatforms.map((platform) => (
                  <Badge key={platform.name} variant="info" className="text-xs">
                    {platform.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center gap-1 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            {formatDate(testimonial.created_at)}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
