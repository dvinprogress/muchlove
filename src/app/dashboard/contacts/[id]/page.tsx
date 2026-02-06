import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Copy, Trash2, Video } from 'lucide-react'
import { Card, CardContent, Badge, Button, EmptyState } from '@/components/ui'
import { createClient } from '@/lib/supabase/server'
import { deleteContact } from '../actions'
import type { ContactStatus } from '@/types/database'

interface ContactDetailPageProps {
  params: Promise<{
    id: string
  }>
}

const statusConfig: Record<
  ContactStatus,
  { label: string; variant: 'default' | 'info' | 'warning' | 'success' }
> = {
  created: { label: 'Créé', variant: 'default' },
  invited: { label: 'Invité', variant: 'info' },
  link_opened: { label: 'Lien ouvert', variant: 'warning' },
  video_started: { label: 'Vidéo en cours', variant: 'warning' },
  video_completed: { label: 'Vidéo terminée', variant: 'success' },
  shared_1: { label: 'Partagé x1', variant: 'success' },
  shared_2: { label: 'Partagé x2', variant: 'success' },
  shared_3: { label: 'Partagé x3', variant: 'success' },
}

function CopyLinkButton({ link }: { link: string }) {
  'use client'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/record/${link}`
      )
      alert('Lien copié dans le presse-papiers !')
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
      alert('Erreur lors de la copie du lien')
    }
  }

  return (
    <Button
      variant="secondary"
      icon={<Copy className="w-4 h-4" />}
      onClick={handleCopy}
    >
      Copier le lien
    </Button>
  )
}

function DeleteContactButton({ contactId }: { contactId: string }) {
  'use client'

  const handleDelete = async () => {
    if (
      !confirm(
        'Êtes-vous sûr de vouloir supprimer ce contact ? Cette action est irréversible.'
      )
    ) {
      return
    }

    try {
      const formData = new FormData()
      formData.append('contactId', contactId)
      await deleteContact(contactId)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la suppression du contact'
      )
    }
  }

  return (
    <Button
      variant="danger"
      icon={<Trash2 className="w-4 h-4" />}
      onClick={handleDelete}
    >
      Supprimer
    </Button>
  )
}

export default async function ContactDetailPage({
  params,
}: ContactDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return notFound()
  }

  // Fetch contact
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('company_id', user.id)
    .single()

  if (contactError || !contact) {
    return notFound()
  }

  // Fetch testimonials for this contact
  const { data: testimonials, error: testimonialsError } = await supabase
    .from('testimonials')
    .select('*')
    .eq('contact_id', id)
    .order('created_at', { ascending: false })

  if (testimonialsError) {
    console.error('Erreur lors du chargement des témoignages:', testimonialsError)
  }

  const statusInfo = statusConfig[contact.status as ContactStatus]
  const createdDate = new Date(contact.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const hasTestimonials = testimonials && testimonials.length > 0

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard/contacts">
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Retour aux contacts
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {contact.first_name}
        </h1>
        <p className="text-slate-500 mt-1">{contact.company_name}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">
                Informations du contact
              </h2>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Prénom</p>
                <p className="text-slate-900 font-medium">{contact.first_name}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Entreprise</p>
                <p className="text-slate-900 font-medium">
                  {contact.company_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Email</p>
                <p className="text-slate-900 font-medium">{contact.email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Créé le</p>
                <p className="text-slate-900 font-medium">{createdDate}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-2">Lien unique</p>
              <div className="bg-slate-50 p-3 rounded-lg font-mono text-sm text-slate-700 break-all">
                {process.env.NEXT_PUBLIC_APP_URL || 'https://app.muchlove.fr'}
                /record/{contact.unique_link}
              </div>
            </div>

            {contact.link_opened_at && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Lien ouvert le</p>
                <p className="text-slate-900 font-medium">
                  {new Date(contact.link_opened_at).toLocaleString('fr-FR')}
                </p>
              </div>
            )}

            {contact.video_started_at && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Vidéo démarrée le</p>
                <p className="text-slate-900 font-medium">
                  {new Date(contact.video_started_at).toLocaleString('fr-FR')}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <CopyLinkButton link={contact.unique_link} />
              <DeleteContactButton contactId={contact.id} />
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Témoignages
          </h2>

          {!hasTestimonials ? (
            <EmptyState
              icon={<Video className="w-12 h-12 text-slate-400" />}
              title="Aucun témoignage"
              description="Ce contact n'a pas encore enregistré de témoignage vidéo."
            />
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        Tentative #{testimonial.attempt_number}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(testimonial.created_at).toLocaleString(
                          'fr-FR'
                        )}
                      </p>
                      <Badge
                        variant={
                          testimonial.processing_status === 'completed'
                            ? 'success'
                            : testimonial.processing_status === 'failed'
                            ? 'danger'
                            : 'warning'
                        }
                        className="mt-2"
                      >
                        {testimonial.processing_status === 'completed'
                          ? 'Terminé'
                          : testimonial.processing_status === 'failed'
                          ? 'Échoué'
                          : testimonial.processing_status === 'processing'
                          ? 'En traitement'
                          : 'En attente'}
                      </Badge>
                    </div>
                    <Link href={`/dashboard/testimonials/${testimonial.id}`}>
                      <Button variant="secondary">Voir détail →</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
