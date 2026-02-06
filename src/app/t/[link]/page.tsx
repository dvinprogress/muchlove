import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, Button } from '@/components/ui'
import type { Database } from '@/types/database'

type Contact = Database['public']['Tables']['contacts']['Row']
type Company = Database['public']['Tables']['companies']['Row']

interface ContactWithCompany extends Contact {
  companies: Company
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8 text-center space-y-6">
            {/* Logo ou nom de l'entreprise */}
            {company.logo_url ? (
              <div className="flex justify-center">
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="h-16 w-auto object-contain"
                />
              </div>
            ) : (
              <h1 className="text-3xl font-bold text-slate-900">
                {company.name}
              </h1>
            )}

            {/* Message personnalisé */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                Bonjour {contact.first_name} !
              </h2>
              <p className="text-lg text-slate-700">
                {company.name} aimerait recevoir votre témoignage vidéo
              </p>
            </div>

            {/* Description */}
            <p className="text-slate-600 leading-relaxed">
              C'est simple et rapide : enregistrez une vidéo de 30 secondes à 2
              minutes pour partager votre expérience
            </p>

            {/* CTA Button */}
            <Button
              disabled
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bientôt disponible
            </Button>

            {/* Powered by */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                Powered by{' '}
                <span className="text-rose-500 font-semibold">MuchLove</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
