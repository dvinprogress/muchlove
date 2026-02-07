'use server'

import { createClient } from '@/lib/supabase/server'
import { generateLinkedInPost } from '@/lib/linkedin/post-generator'
import type { ContactStatus } from '@/types/database'

interface ShareStatusResult {
  success: boolean
  newStatus: ContactStatus
  error?: string
}

/**
 * Update share status for a contact after they share on a platform
 * Handles the progression: video_completed → shared_1 → shared_2 → shared_3 (ambassador)
 */
export async function updateShareStatus(
  contactId: string,
  testimonialId: string,
  platform: 'trustpilot' | 'google' | 'linkedin',
  additionalData?: {
    locale?: string
    firstName?: string
    companyName?: string
    duration?: number
  }
): Promise<ShareStatusResult> {
  try {
    const supabase = await createClient()

    // Fetch current contact status
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('status, first_name, company_name')
      .eq('id', contactId)
      .single()

    if (contactError || !contact) {
      return {
        success: false,
        newStatus: 'link_opened',
        error: 'Contact not found'
      }
    }

    // Determine new status based on current status
    let newStatus: ContactStatus
    switch (contact.status) {
      case 'video_completed':
        newStatus = 'shared_1'
        break
      case 'shared_1':
        newStatus = 'shared_2'
        break
      case 'shared_2':
        newStatus = 'shared_3' // Ambassador!
        break
      default:
        newStatus = contact.status
    }

    // Update contact status
    const { error: updateContactError } = await supabase
      .from('contacts')
      .update({
        status: newStatus,
        ...(platform === 'linkedin' && {
          linkedin_consent: true,
          linkedin_consent_at: new Date().toISOString()
        })
      })
      .eq('id', contactId)

    if (updateContactError) {
      return {
        success: false,
        newStatus: contact.status,
        error: 'Failed to update contact status'
      }
    }

    // Prepare testimonial update based on platform
    const testimonialUpdate: Record<string, boolean | string | null> = {}

    switch (platform) {
      case 'trustpilot':
        testimonialUpdate.shared_trustpilot = true
        break
      case 'google':
        testimonialUpdate.shared_google = true
        break
      case 'linkedin':
        testimonialUpdate.shared_linkedin = true
        // Generate and save the LinkedIn post text
        if (additionalData?.locale) {
          const postText = generateLinkedInPost({
            contactFirstName: additionalData.firstName || contact.first_name,
            companyName: additionalData.companyName || contact.company_name,
            testimonialDuration: additionalData.duration,
            locale: additionalData.locale
          })
          testimonialUpdate.linkedin_post_text = postText
        }
        break
    }

    // Update testimonial
    const { error: updateTestimonialError } = await supabase
      .from('testimonials')
      .update(testimonialUpdate)
      .eq('id', testimonialId)

    if (updateTestimonialError) {
      return {
        success: false,
        newStatus: contact.status,
        error: 'Failed to update testimonial'
      }
    }

    return {
      success: true,
      newStatus
    }
  } catch (error) {
    console.error('updateShareStatus error:', error)
    return {
      success: false,
      newStatus: 'link_opened',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
