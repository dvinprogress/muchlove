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
    return { success: false, error: validation.error.issues[0].message }
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
 * Récupère tous les contacts de la company
 * RLS applique automatiquement le filtre company_id = auth.uid()
 */
export async function getContacts(): Promise<ActionResult<Contact[]>> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Non authentifié' }
  }

  // 2. Select * from contacts where company_id = user.id order by created_at desc
  const { data: contacts, error: selectError } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  if (selectError) {
    return { success: false, error: selectError.message }
  }

  return { success: true, data: contacts }
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
 */
export async function getContactStats(): Promise<ActionResult<Record<ContactStatus, number>>> {
  // 1. Get user from session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Non authentifié' }
  }

  // 2. Select count(*) group by status
  const { data: contacts, error: selectError } = await supabase
    .from('contacts')
    .select('status')

  if (selectError) {
    return { success: false, error: selectError.message }
  }

  // 3. Aggregate counts par status
  const stats: Record<ContactStatus, number> = {
    created: 0,
    invited: 0,
    link_opened: 0,
    video_started: 0,
    video_completed: 0,
    shared_1: 0,
    shared_2: 0,
    shared_3: 0,
  }

  contacts.forEach((contact) => {
    if (contact.status in stats) {
      stats[contact.status as ContactStatus]++
    }
  })

  return { success: true, data: stats }
}
