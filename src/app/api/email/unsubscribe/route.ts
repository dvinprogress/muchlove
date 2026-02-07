import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { z } from 'zod'
import { createHmac, timingSafeEqual } from 'crypto'

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: {
        schema: 'public',
      },
    }
  )
}

// Schema de validation du token
const unsubscribeTokenSchema = z.object({
  companyId: z.string().uuid(),
  type: z.enum(['marketing', 'sequences', 'weekly_digest']),
})

/**
 * Décode et vérifie un token unsubscribe signé avec HMAC
 */
function decodeUnsubscribeToken(token: string) {
  try {
    const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET
    if (!secret) throw new Error('UNSUBSCRIBE_TOKEN_SECRET environment variable is required')

    const [encodedPayload, signature] = token.split('.')
    if (!encodedPayload || !signature) return null

    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf-8')

    // Verify HMAC with timing-safe comparison
    const expectedSignature = createHmac('sha256', secret).update(payload).digest('hex')
    const signatureBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null
    }

    const [companyId, type] = payload.split(':')
    return unsubscribeTokenSchema.parse({ companyId, type })
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/unsubscribe?error=missing_token', request.url))
  }

  const decoded = decodeUnsubscribeToken(token)
  if (!decoded) {
    return NextResponse.redirect(new URL('/unsubscribe?error=invalid_token', request.url))
  }

  const supabase = getSupabaseAdmin()

  // Récupérer les préférences actuelles
  const { data: company, error: fetchError } = await supabase
    .from('companies')
    .select('email_preferences')
    .eq('id', decoded.companyId)
    .single<{ email_preferences: Database['public']['Tables']['companies']['Row']['email_preferences'] }>()

  if (fetchError || !company) {
    return NextResponse.redirect(new URL('/unsubscribe?error=company_not_found', request.url))
  }

  // Mettre à jour les préférences
  const currentPrefs = (company.email_preferences as Record<string, boolean>) || {}
  const updatedPrefs = {
    ...currentPrefs,
    [decoded.type]: false,
  }

  // Contournement temporaire du type checking - le client Supabase généré
  // ne reconnaît pas correctement les nouveaux champs
  const { error: updateError } = await (supabase
    .from('companies')
    .update as any)({ email_preferences: updatedPrefs })
    .eq('id', decoded.companyId)

  if (updateError) {
    return NextResponse.redirect(new URL('/unsubscribe?error=update_failed', request.url))
  }

  // Rediriger vers la page de confirmation
  return NextResponse.redirect(new URL('/unsubscribe?success=true', request.url))
}
