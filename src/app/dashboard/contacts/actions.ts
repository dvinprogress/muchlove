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
