'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createContact } from '@/app/[locale]/dashboard/contacts/actions'
import { useTranslations } from 'next-intl'

interface AddContactFormProps {
  isOpen: boolean
  onClose: () => void
}

type ContactFormData = {
  first_name: string
  email: string
  company_name: string
}

export function AddContactForm({ isOpen, onClose }: AddContactFormProps) {
  const router = useRouter()
  const t = useTranslations('contacts.form')

  // Schema de validation avec messages traduits
  const contactSchema = z.object({
    first_name: z.string().min(1, t('firstName.required')),
    email: z.string().email(t('email.invalid')),
    company_name: z.string().min(1, t('company.required')),
  })

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ContactFormData>({
    first_name: '',
    email: '',
    company_name: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})
  const [globalError, setGlobalError] = useState<string>('')

  const handleChange = (field: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: '' }))
    setGlobalError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setGlobalError('')

    // Validation client-side avec Zod
    const validation = contactSchema.safeParse(formData)
    if (!validation.success) {
      const newErrors: Partial<Record<keyof ContactFormData, string>> = {}
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ContactFormData
        newErrors[field] = issue.message
      })
      setErrors(newErrors)
      return
    }

    // Submit
    setLoading(true)
    try {
      const result = await createContact(validation.data)
      if (result.success) {
        // Success: fermer modal et refresh
        onClose()
        router.refresh()
      } else {
        // Error: afficher message
        setGlobalError(result.error)
      }
    } catch (error) {
      setGlobalError(t('errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('title')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {globalError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {globalError}
          </div>
        )}

        <Input
          label={t('firstName.label')}
          type="text"
          value={formData.first_name}
          onChange={handleChange('first_name')}
          error={errors.first_name}
          placeholder={t('firstName.placeholder')}
          disabled={loading}
        />

        <Input
          label={t('email.label')}
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          placeholder={t('email.placeholder')}
          disabled={loading}
        />

        <Input
          label={t('company.label')}
          type="text"
          value={formData.company_name}
          onChange={handleChange('company_name')}
          error={errors.company_name}
          placeholder={t('company.placeholder')}
          disabled={loading}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="flex-1"
          >
            {t('submit')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
