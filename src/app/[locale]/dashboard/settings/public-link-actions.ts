'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateUniqueSlug } from '@/lib/utils/slugify'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }

const slugSchema = z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens')

/**
 * Toggle public link on/off
 */
export async function togglePublicLink(enabled: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // If enabling, ensure slug exists
  if (enabled) {
    const { data: company } = await supabase
      .from('companies')
      .select('public_slug, name')
      .eq('id', user.id)
      .single()

    if (!company?.public_slug) {
      // Auto-generate slug from company name
      const admin = getSupabaseAdmin()
      const slug = await generateUniqueSlug(company?.name ?? 'company', async (candidate) => {
        const { data } = await admin
          .from('companies')
          .select('id')
          .eq('public_slug', candidate)
          .single()
        return !!data
      })

      await supabase
        .from('companies')
        .update({ public_slug: slug, public_link_enabled: true })
        .eq('id', user.id)

      revalidatePath('/dashboard')
      revalidatePath('/dashboard/settings')
      return { success: true, data: undefined }
    }
  }

  const { error } = await supabase
    .from('companies')
    .update({ public_link_enabled: enabled })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { success: true, data: undefined }
}

/**
 * Update the public slug
 */
export async function updatePublicSlug(newSlug: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  const validation = slugSchema.safeParse(newSlug)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message ?? 'Invalid slug' }
  }

  // Check uniqueness
  const admin = getSupabaseAdmin()
  const { data: existing } = await admin
    .from('companies')
    .select('id')
    .eq('public_slug', newSlug)
    .neq('id', user.id)
    .single()

  if (existing) {
    return { success: false, error: 'This slug is already taken' }
  }

  const { error } = await supabase
    .from('companies')
    .update({ public_slug: newSlug })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { success: true, data: undefined }
}

/**
 * Get public link data for the current user's company
 */
export async function getPublicLinkData(): Promise<ActionResult<{
  publicSlug: string | null
  publicLinkEnabled: boolean
}>> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: company, error } = await supabase
    .from('companies')
    .select('public_slug, public_link_enabled')
    .eq('id', user.id)
    .single()

  if (error || !company) {
    return { success: false, error: 'Company not found' }
  }

  return {
    success: true,
    data: {
      publicSlug: company.public_slug,
      publicLinkEnabled: company.public_link_enabled,
    },
  }
}
