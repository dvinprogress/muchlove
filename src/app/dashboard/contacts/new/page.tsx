import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ContactForm } from '@/components/contacts'
import { Button } from '@/components/ui'

export default function NewContactPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/contacts">
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Retour aux contacts
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Nouveau contact</h1>
        <p className="text-slate-500 mt-1">
          Ajoutez un nouveau contact pour lui envoyer une demande de témoignage
        </p>
      </div>

      <ContactForm />
    </div>
  )
}
