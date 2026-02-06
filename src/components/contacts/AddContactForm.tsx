'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createContact } from '@/app/dashboard/contacts/actions'

interface AddContactFormProps {
  isOpen: boolean
  onClose: () => void
}

// Schema de validation
const contactSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  email: z.string().email('Invalid email'),
  company_name: z.string().min(1, "Company name is required"),
})

type ContactFormData = z.infer<typeof contactSchema>

export function AddContactForm({ isOpen, onClose }: AddContactFormProps) {
  const router = useRouter()
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
      setGlobalError('Oops! Something didn\'t work 😊 Try again?')
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Add contact" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {globalError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {globalError}
          </div>
        )}

        <Input
          label="First name"
          type="text"
          value={formData.first_name}
          onChange={handleChange('first_name')}
          error={errors.first_name}
          placeholder="Jean"
          disabled={loading}
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          placeholder="jean@example.com"
          disabled={loading}
        />

        <Input
          label="Company"
          type="text"
          value={formData.company_name}
          onChange={handleChange('company_name')}
          error={errors.company_name}
          placeholder="Acme Inc."
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
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="flex-1"
          >
            Add
          </Button>
        </div>
      </form>
    </Modal>
  )
}
