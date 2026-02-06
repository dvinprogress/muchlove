'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, Button } from '@/components/ui'
import { createContact } from '@/app/[locale]/dashboard/contacts/actions'
import { useTranslations } from 'next-intl'

interface ContactFormProps {
  onSuccess?: () => void
}

export function ContactForm({ onSuccess }: ContactFormProps) {
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('contacts.form')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createContact({
        first_name: formData.get('first_name') as string,
        company_name: formData.get('company_name') as string,
        email: formData.get('email') as string,
      })

      if (result.success) {
        toast.success(t('success'))
        onSuccess?.()
      } else {
        toast.error(t('error', { error: result.error }))
      }
    })
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              {t('firstName.label')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              required
              disabled={isPending}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:ring-opacity-20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={t('firstName.placeholder')}
            />
          </div>

          <div>
            <label
              htmlFor="company_name"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              {t('company.label')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              required
              disabled={isPending}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:ring-opacity-20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={t('company.placeholder')}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              {t('email.label')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              disabled={isPending}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 focus:ring-opacity-20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={t('email.placeholder')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={isPending}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? t('submitting') : t('submitAlt')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
