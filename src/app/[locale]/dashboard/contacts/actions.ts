'use server'

import { z } from 'zod'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Contact, ContactStatus } from '@/types/database'

// Schema Zod
const createContactSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis').max(100),
  email: z.string().email('Email invalide'),
  company_name: z.string().min(1, "Le nom de l'entreprise est requis").max(200),
  phone: z.string().max(20).optional().nullable(),
  reward: z.string().max(200).optional().nullable(),
})

// Type retour standard
type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }

/**
 * Crée un nouveau contact
 * 1. Vérifie l'authentification utilisateur
 * 2. Valide les données avec Zod
 * 3. Génère un lien unique avec nanoid(12)
 * 4. Insère le contact dans la base (RLS applique company_id = auth.uid())
 * 5. Revalide les pages concernées
 */
export async function createContact(
  data: z.infer<typeof createContactSchema>
): Promise<ActionResult<Contact>> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Non authentifié' }
  }

  // 2. Validate avec Zod
  const validation = createContactSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message ?? 'Donnees invalides' }
  }

  const validatedData = validation.data

  // 3. Generate unique_link avec nanoid(12)
  const uniqueLink = nanoid(12)

  // 4. Insert dans contacts avec company_id = user.id
  const { data: contact, error: insertError } = await supabase
    .from('contacts')
    .insert({
      company_id: user.id,
      first_name: validatedData.first_name,
      email: validatedData.email,
      company_name: validatedData.company_name,
      phone: validatedData.phone || null,
      reward: validatedData.reward || null,
      unique_link: uniqueLink,
      status: 'created' as ContactStatus,
    })
    .select()
    .single()

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  // 5. revalidatePath
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/contacts')

  // 6. Return success
  return { success: true, data: contact }
}

/**
 * Récupère les contacts de la company avec pagination
 * RLS applique automatiquement le filtre company_id = auth.uid()
 */
export async function getContacts(options?: {
  page?: number
  pageSize?: number
}): Promise<ActionResult<{ contacts: Contact[]; total: number }>> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Non authentifié' }
  }

  // 2. Pagination params
  const page = options?.page ?? 1
  const pageSize = options?.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // 3. Select with pagination and count
  const { data: contacts, error: selectError, count } = await supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (selectError) {
    return { success: false, error: selectError.message }
  }

  return { success: true, data: { contacts: contacts ?? [], total: count ?? 0 } }
}

/**
 * Met à jour un contact existant
 * 1. Vérifie l'authentification utilisateur
 * 2. Valide les données avec Zod
 * 3. Met à jour le contact dans la base (RLS applique company_id = auth.uid())
 * 4. Revalide les pages concernées
 */
export async function updateContact(
  contactId: string,
  data: { first_name: string; email: string; company_name: string; phone?: string | null; reward?: string | null }
): Promise<ActionResult> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Non authentifié' }
  }

  // 2. Validate contactId est un UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(contactId)) {
    return { success: false, error: 'ID invalide' }
  }

  // 3. Validate data avec Zod
  const updateSchema = z.object({
    first_name: z.string().min(1, 'Le prénom est requis').max(100),
    email: z.string().email('Email invalide').max(255),
    company_name: z.string().min(1, "Le nom de l'entreprise est requis").max(200),
    phone: z.string().max(20).optional().nullable(),
    reward: z.string().max(200).optional().nullable(),
  })

  const validation = updateSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message ?? 'Données invalides' }
  }

  const validated = validation.data

  // 4. Update contact where id = contactId (RLS protège)
  const { error: updateError } = await supabase
    .from('contacts')
    .update(validated)
    .eq('id', contactId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // 5. revalidatePath
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/contacts')
  revalidatePath(`/dashboard/contacts/${contactId}`)

  // 6. Return success
  return { success: true, data: undefined }
}

/**
 * Supprime un contact
 * RLS protège automatiquement (company_id = auth.uid())
 */
export async function deleteContact(contactId: string): Promise<ActionResult> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Non authentifié' }
  }

  // 2. Validate id est un UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(contactId)) {
    return { success: false, error: 'ID invalide' }
  }

  // 3. Delete from contacts where id = contactId (RLS protège)
  const { error: deleteError } = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  // 4. revalidatePath
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/contacts')

  // 5. Return success
  return { success: true, data: undefined }
}

/**
 * Stats pour le funnel
 * Retourne le nombre de contacts par status
 * Utilise des COUNT SQL en parallèle pour performance optimale
 */
export async function getContactStats(): Promise<ActionResult<Record<ContactStatus, number>>> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Non authentifié' }
  }

  // 2. Tous les statuts possibles
  const statuses: ContactStatus[] = [
    'created',
    'invited',
    'link_opened',
    'video_started',
    'video_completed',
    'shared_1',
    'shared_2',
    'shared_3',
  ]

  // 3. Count SQL en parallèle pour chaque status
  const countPromises = statuses.map(async (status) => {
    const { count, error } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)

    if (error) throw error
    return { status, count: count ?? 0 }
  })

  try {
    const results = await Promise.all(countPromises)

    // 4. Transform en Record<ContactStatus, number>
    const stats = results.reduce((acc, { status, count }) => {
      acc[status] = count
      return acc
    }, {} as Record<ContactStatus, number>)

    return { success: true, data: stats }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erreur lors du calcul des stats' }
  }
}

// Import pour les nouvelles actions email
import { createHmac } from 'crypto'
import { sendEmail } from '@/lib/email/resend'
import { InvitationEmail } from '@/lib/email/templates/InvitationEmail'
import type { Company } from '@/types/database'

// Schema pour import CSV
const csvRowSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis'),
  email: z.string().email('Email invalide'),
  company_name: z.string().min(1, "Le nom de l'entreprise est requis"),
  phone: z.string().max(20).optional().nullable(),
  reward: z.string().max(200).optional().nullable(),
})

/**
 * Importe des contacts depuis un fichier CSV
 * 1. Valide chaque ligne avec Zod (max 200 lignes)
 * 2. Génère un unique_link pour chaque contact
 * 3. Insère en batch dans la base
 * 4. Retourne le nombre de contacts créés et les erreurs éventuelles
 */
export async function importContactsCSV(
  rows: { first_name: string; email: string; company_name: string; phone?: string | null; reward?: string | null }[]
): Promise<ActionResult<{ created: number; errors: { row: number; message: string }[] }>> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Non authentifié' }
  }

  // 2. Validation max 200 lignes
  if (rows.length > 200) {
    return { success: false, error: 'Maximum 200 contacts par import' }
  }

  // 3. Valider et préparer les données
  const errors: { row: number; message: string }[] = []
  const validRows: Array<{
    company_id: string
    first_name: string
    email: string
    company_name: string
    phone: string | null
    reward: string | null
    unique_link: string
    status: ContactStatus
  }> = []

  rows.forEach((row, index) => {
    const validation = csvRowSchema.safeParse(row)
    if (!validation.success) {
      errors.push({
        row: index + 1,
        message: validation.error.issues[0]?.message ?? 'Données invalides',
      })
    } else {
      validRows.push({
        company_id: user.id,
        first_name: validation.data.first_name,
        email: validation.data.email,
        company_name: validation.data.company_name,
        phone: validation.data.phone || null,
        reward: validation.data.reward || null,
        unique_link: nanoid(12),
        status: 'created' as ContactStatus,
      })
    }
  })

  // 4. Insert batch si au moins une ligne valide
  if (validRows.length > 0) {
    const { error: insertError } = await supabase
      .from('contacts')
      .insert(validRows)

    if (insertError) {
      return { success: false, error: insertError.message }
    }
  }

  // 5. revalidatePath
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/contacts')

  // 6. Return success
  return {
    success: true,
    data: {
      created: validRows.length,
      errors,
    },
  }
}

/**
 * Envoie un email d'invitation à un contact
 * 1. Récupère le contact depuis Supabase
 * 2. Récupère les infos de la company
 * 3. Génère les URLs (recording + unsubscribe avec HMAC)
 * 4. Envoie l'email via Resend
 * 5. Met à jour le status du contact si nécessaire
 */
export async function sendInvitationEmail(contactId: string): Promise<ActionResult> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Non authentifié' }
  }

  // 2. Validate contactId est un UUID
  const uuidSchema = z.string().uuid()
  const validation = uuidSchema.safeParse(contactId)
  if (!validation.success) {
    return { success: false, error: 'ID de contact invalide' }
  }

  // 3. Récupérer le contact
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .single()

  if (contactError || !contact) {
    return { success: false, error: 'Contact introuvable' }
  }

  // 4. Récupérer la company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', user.id)
    .single<Company>()

  if (companyError || !company) {
    return { success: false, error: 'Informations entreprise introuvables' }
  }

  // 5. Construire recordingUrl
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    return { success: false, error: 'Configuration manquante' }
  }
  const recordingUrl = `${appUrl}/t/${contact.unique_link}`

  // 6. Construire unsubscribeUrl avec HMAC
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET || 'fallback'
  const hash = createHmac('sha256', secret)
    .update(contact.email)
    .digest('hex')

  const tokenData = JSON.stringify({ email: contact.email, hash })
  const token = Buffer.from(tokenData).toString('base64url')
  const unsubscribeUrl = `${appUrl}/unsubscribe?token=${token}`

  // 7. Envoyer l'email
  try {
    await sendEmail({
      to: contact.email,
      subject: `${company.name} wants to hear from you 💛`,
      react: InvitationEmail({
        contactName: contact.first_name,
        companyName: company.name,
        recordingUrl,
        unsubscribeUrl,
      }),
      tags: [
        { name: 'type', value: 'invitation' },
        { name: 'company_id', value: user.id },
      ],
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'envoi de l'email",
    }
  }

  // 8. Mettre à jour le status si contact était 'created'
  if (contact.status === 'created') {
    const { error: updateError } = await supabase
      .from('contacts')
      .update({ status: 'invited' as ContactStatus })
      .eq('id', contactId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }
  }

  // 9. revalidatePath
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/contacts')

  // 10. Return success
  return { success: true, data: undefined }
}

/**
 * Envoie des emails d'invitation en masse
 * 1. Valide les IDs (max 50 contacts)
 * 2. Récupère tous les contacts et la company
 * 3. Envoie les emails avec try/catch individuel
 * 4. Met à jour les statuts en batch
 * 5. Retourne le nombre d'envois réussis et échoués
 */
export async function sendBulkInvitationEmails(
  contactIds: string[]
): Promise<ActionResult<{ sent: number; failed: number; errors: string[] }>> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Non authentifié' }
  }

  // 2. Validation max 50 contacts
  if (contactIds.length > 50) {
    return { success: false, error: 'Maximum 50 contacts par envoi' }
  }

  // 3. Valider chaque ID est un UUID
  const uuidSchema = z.string().uuid()
  for (const id of contactIds) {
    const validation = uuidSchema.safeParse(id)
    if (!validation.success) {
      return { success: false, error: `ID invalide: ${id}` }
    }
  }

  // 4. Récupérer tous les contacts
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('*')
    .in('id', contactIds)

  if (contactsError || !contacts) {
    return { success: false, error: 'Erreur lors de la récupération des contacts' }
  }

  // 5. Récupérer la company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', user.id)
    .single<Company>()

  if (companyError || !company) {
    return { success: false, error: 'Informations entreprise introuvables' }
  }

  // 6. Vérifier NEXT_PUBLIC_APP_URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    return { success: false, error: 'Configuration manquante' }
  }

  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET || 'fallback'

  // 7. Envoyer les emails avec try/catch individuel
  let sent = 0
  let failed = 0
  const errors: string[] = []
  const successfulContactIds: string[] = []

  for (const contact of contacts) {
    try {
      // Construire URLs
      const recordingUrl = `${appUrl}/t/${contact.unique_link}`
      const hash = createHmac('sha256', secret)
        .update(contact.email)
        .digest('hex')
      const tokenData = JSON.stringify({ email: contact.email, hash })
      const token = Buffer.from(tokenData).toString('base64url')
      const unsubscribeUrl = `${appUrl}/unsubscribe?token=${token}`

      // Envoyer email
      await sendEmail({
        to: contact.email,
        subject: `${company.name} wants to hear from you 💛`,
        react: InvitationEmail({
          contactName: contact.first_name,
          companyName: company.name,
          recordingUrl,
          unsubscribeUrl,
        }),
        tags: [
          { name: 'type', value: 'invitation' },
          { name: 'company_id', value: user.id },
        ],
      })

      sent++
      if (contact.status === 'created') {
        successfulContactIds.push(contact.id)
      }
    } catch (error) {
      failed++
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      errors.push(`${contact.email}: ${message}`)
    }
  }

  // 8. Mettre à jour les statuts en batch pour les contacts 'created'
  if (successfulContactIds.length > 0) {
    await supabase
      .from('contacts')
      .update({ status: 'invited' as ContactStatus })
      .in('id', successfulContactIds)
      .eq('status', 'created')
  }

  // 9. revalidatePath
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/contacts')

  // 10. Return success
  return {
    success: true,
    data: {
      sent,
      failed,
      errors,
    },
  }
}
