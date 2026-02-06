'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { z } from 'zod'

// Schema de validation pour l'email
const emailSchema = z.object({
  email: z.string().email('Email invalide'),
})

// Helper pour récupérer l'origin — force NEXT_PUBLIC_APP_URL en production
async function getOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  return `${protocol}://${host}`
}

/**
 * Connexion via magic link envoyé par email
 */
export async function signInWithEmail(formData: FormData) {
  try {
    const email = formData.get('email') as string

    // Validation
    const result = emailSchema.safeParse({ email })
    if (!result.success) {
      return { error: result.error.issues[0]?.message ?? 'Email invalide' }
    }

    const supabase = await createClient()
    const origin = await getOrigin()
    const emailRedirectTo = `${origin}/auth/callback`

    const { error } = await supabase.auth.signInWithOtp({
      email: result.data.email,
      options: {
        emailRedirectTo,
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { error: 'Une erreur est survenue lors de l\'envoi du lien' }
  }
}

/**
 * Connexion via Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = await getOrigin()
  const redirectTo = `${origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  })

  if (error || !data.url) {
    redirect('/login?error=google_auth_failed')
  }

  redirect(data.url)
}

/**
 * Connexion via LinkedIn OIDC
 */
export async function signInWithLinkedinOidc() {
  const supabase = await createClient()
  const origin = await getOrigin()
  const redirectTo = `${origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo,
    },
  })

  if (error || !data.url) {
    redirect('/login?error=linkedin_auth_failed')
  }

  redirect(data.url)
}

/**
 * Déconnexion
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
