'use server'

import { z } from 'zod'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendInvitationEmail } from '@/app/[locale]/dashboard/contacts/actions'
import type { ContactStatus } from '@/types/database'

// Type retour standard
type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }

// Schemas Zod
const businessInfoSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  industry: z.string().max(100).optional().or(z.literal('')),
})

const sharingLinksSchema = z.object({
  trustpilot_url: z.string().url('Invalid Trustpilot URL').optional().or(z.literal('')),
  google_place_id: z.string().max(200).optional().or(z.literal('')),
})

const firstContactSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  email: z.string().email('Invalid email'),
})

/**
 * Met à jour les informations business de la company
 * 1. Valide les données avec Zod
 * 2. Update company name et industry
 * 3. Revalide les pages concernées
 */
export async function updateBusinessInfo(
  data: z.infer<typeof businessInfoSchema>
): Promise<ActionResult> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // 2. Validate avec Zod
  const validation = businessInfoSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message ?? 'Invalid data' }
  }

  const validatedData = validation.data

  // 3. Update company
  const { error: updateError } = await supabase
    .from('companies')
    .update({
      name: validatedData.name,
      industry: validatedData.industry || null,
    })
    .eq('id', user.id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // 4. Revalidate paths
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/onboarding')
  revalidatePath('/dashboard/settings')

  return { success: true, data: undefined }
}

/**
 * Upload le logo de l'entreprise
 * 1. Valide le fichier (taille max 2MB, MIME type image/jpeg|png|webp)
 * 2. Supprime l'ancien logo si existant
 * 3. Upload le nouveau logo dans Storage
 * 4. Met à jour logo_url dans companies
 * 5. Revalide les pages concernées
 */
export async function uploadCompanyLogo(formData: FormData): Promise<ActionResult> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // 2. Extract file from FormData
  const file = formData.get('file') as File | null

  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  // 3. Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    return { success: false, error: 'File size must be less than 2MB' }
  }

  // 4. Validate MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'File must be JPEG, PNG or WebP' }
  }

  try {
    // 5. Delete old logo if exists
    const { data: existingFiles } = await supabase
      .storage
      .from('company-logos')
      .list(user.id)

    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map((f) => `${user.id}/${f.name}`)
      await supabase.storage.from('company-logos').remove(filesToRemove)
    }

    // 6. Upload new logo
    const { error: uploadError } = await supabase
      .storage
      .from('company-logos')
      .upload(`${user.id}/logo`, file, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    // 7. Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('company-logos')
      .getPublicUrl(`${user.id}/logo`)

    // 8. Update company logo_url
    const { error: updateError } = await supabase
      .from('companies')
      .update({ logo_url: publicUrlData.publicUrl })
      .eq('id', user.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // 9. Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/onboarding')
    revalidatePath('/dashboard/settings')

    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload logo',
    }
  }
}

/**
 * Met à jour les liens de partage (Trustpilot, Google)
 * 1. Valide les données avec Zod
 * 2. Update trustpilot_url et google_place_id
 * 3. Revalide les pages concernées
 */
export async function updateSharingLinks(
  data: z.infer<typeof sharingLinksSchema>
): Promise<ActionResult> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // 2. Validate avec Zod
  const validation = sharingLinksSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message ?? 'Invalid data' }
  }

  const validatedData = validation.data

  // 3. Update company
  const { error: updateError } = await supabase
    .from('companies')
    .update({
      trustpilot_url: validatedData.trustpilot_url || null,
      google_place_id: validatedData.google_place_id || null,
    })
    .eq('id', user.id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // 4. Revalidate paths
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/onboarding')
  revalidatePath('/dashboard/settings')

  return { success: true, data: undefined }
}

/**
 * Crée le premier contact et lui envoie une invitation
 * 1. Valide les données avec Zod
 * 2. Récupère le nom de la company
 * 3. Génère un unique_link avec nanoid(12)
 * 4. Insère le contact dans la base
 * 5. Envoie l'email d'invitation via sendInvitationEmail
 * 6. Revalide les pages concernées
 * 7. Retourne l'ID du contact créé
 */
export async function createFirstContact(
  data: z.infer<typeof firstContactSchema>
): Promise<ActionResult<{ contactId: string }>> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // 2. Validate avec Zod
  const validation = firstContactSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message ?? 'Invalid data' }
  }

  const validatedData = validation.data

  // 3. Get company name
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('name')
    .eq('id', user.id)
    .single()

  if (companyError || !company) {
    return { success: false, error: 'Company not found' }
  }

  // 4. Generate unique_link avec nanoid(12)
  const uniqueLink = nanoid(12)

  // 5. Insert contact
  const { data: contact, error: insertError } = await supabase
    .from('contacts')
    .insert({
      company_id: user.id,
      first_name: validatedData.first_name,
      email: validatedData.email,
      company_name: company.name,
      unique_link: uniqueLink,
      status: 'created' as ContactStatus,
    })
    .select()
    .single()

  if (insertError || !contact) {
    return { success: false, error: insertError?.message ?? 'Failed to create contact' }
  }

  // 6. Send invitation email (imported from contacts/actions)
  const emailResult = await sendInvitationEmail(contact.id)

  if (!emailResult.success) {
    // Contact créé mais email échoué - on retourne quand même le contact
    // mais on peut logger l'erreur
    console.error('Failed to send invitation email:', emailResult.error)
  }

  // 7. Revalidate paths
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/contacts')
  revalidatePath('/dashboard/onboarding')

  return { success: true, data: { contactId: contact.id } }
}

/**
 * Marque l'onboarding comme complété
 * 1. Met à jour onboarding_completed_at avec la date actuelle
 * 2. Revalide les pages concernées
 */
export async function completeOnboarding(): Promise<ActionResult> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // 2. Update company
  const { error: updateError } = await supabase
    .from('companies')
    .update({
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // 3. Revalidate paths
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/onboarding')

  return { success: true, data: undefined }
}
