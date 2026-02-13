'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createContact, sendInvitationEmail } from '@/app/[locale]/dashboard/contacts/actions'
import { useTranslations } from 'next-intl'
import { Check, Mail, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface AddContactFormProps {
  isOpen: boolean
  onClose: () => void
}

type ContactFormData = {
  first_name: string
  email: string
  company_name: string
  phone: string
  reward: string
}

export function AddContactForm({ isOpen, onClose }: AddContactFormProps) {
  const router = useRouter()
  const t = useTranslations('contacts.form')

  // Schema de validation avec messages traduits
  const contactSchema = z.object({
    first_name: z.string().min(1, t('firstName.required')),
    email: z.string().email(t('email.invalid')),
    company_name: z.string().min(1, t('company.required')),
    phone: z.string().max(20).optional(),
    reward: z.string().max(200).optional(),
  })

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ContactFormData>({
    first_name: '',
    email: '',
    company_name: '',
    phone: '',
    reward: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})
  const [globalError, setGlobalError] = useState<string>('')
  const [createdContact, setCreatedContact] = useState<{ id: string; unique_link: string } | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

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
      const result = await createContact({
        ...validation.data,
        phone: validation.data.phone || null,
        reward: validation.data.reward || null,
      })
      if (result.success) {
        // Success: afficher écran de succès avec boutons d'action
        setCreatedContact({
          id: result.data.id,
          unique_link: result.data.unique_link,
        })
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
      // Reset états
      setCreatedContact(null)
      setFormData({
        first_name: '',
        email: '',
        company_name: '',
        phone: '',
        reward: '',
      })
      setErrors({})
      setGlobalError('')
      setLinkCopied(false)
      onClose()
    }
  }

  const handleSendEmail = async () => {
    if (!createdContact) return

    setSendingEmail(true)
    try {
      const result = await sendInvitationEmail(createdContact.id)
      if (result.success) {
        toast.success(t('emailSent'))
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(t('errorGeneric'))
    } finally {
      setSendingEmail(false)
    }
  }

  const handleCopyLink = () => {
    if (!createdContact) return

    const recordingUrl = `${window.location.origin}/t/${createdContact.unique_link}`
    navigator.clipboard.writeText(recordingUrl)
      .then(() => {
        setLinkCopied(true)
        toast.success(t('linkCopied'))
        // Reset après 3 secondes
        setTimeout(() => setLinkCopied(false), 3000)
      })
      .catch(() => {
        toast.error(t('errorGeneric'))
      })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={createdContact ? t('success') : t('title')} size="md">
      {createdContact ? (
        // Écran de succès avec boutons d'action
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{t('successMessage')}</h3>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={handleSendEmail}
              loading={sendingEmail}
              disabled={sendingEmail}
              className="w-full flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {t('sendEmail')}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {linkCopied ? t('linkCopied') : t('copyLink')}
            </Button>

            <button
              onClick={handleClose}
              className="text-sm text-slate-500 hover:text-slate-700 mt-2 transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      ) : (
        // Formulaire d'ajout de contact
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('phone.label')}
              <span className="text-slate-400 font-normal ml-1">{t('optional')}</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder={t('phone.placeholder')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('reward.label')}
              <span className="text-slate-400 font-normal ml-1">{t('optional')}</span>
            </label>
            <input
              type="text"
              value={formData.reward}
              onChange={handleChange('reward')}
              placeholder={t('reward.placeholder')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-slate-400">{t('reward.suggestions')}</p>
          </div>

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
      )}
    </Modal>
  )
}
