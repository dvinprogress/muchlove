import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { DEFAULT_WIDGET_THEME } from '@/types/widget'
import type { Json } from '@/types/database'

const updateConfigSchema = z.object({
  enabled: z.boolean().optional(),
  theme: z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    borderRadius: z.enum(['0px', '8px', '12px', '16px']),
    layout: z.enum(['carousel', 'grid']),
    maxItems: z.number().int().min(3).max(10),
    showNames: z.boolean(),
    showTranscription: z.boolean(),
    poweredByVisible: z.boolean(),
  }).optional(),
  allowedDomains: z.array(z.string()).optional(),
})

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('email', user.email!)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Fetch widget config
    const { data: config, error: configError } = await supabase
      .from('widget_configs')
      .select('*')
      .eq('company_id', company.id)
      .single()

    if (configError) {
      // Config doesn't exist yet
      return NextResponse.json({ config: null }, { status: 200 })
    }

    return NextResponse.json({ config }, { status: 200 })
  } catch (error) {
    console.error('Get widget config error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, plan')
      .eq('email', user.email!)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = updateConfigSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { enabled, theme, allowedDomains } = validation.data

    // Check if poweredByVisible requires Pro+ plan
    if (theme && !theme.poweredByVisible) {
      const isPro = ['pro', 'enterprise'].includes(company.plan)
      if (!isPro) {
        return NextResponse.json(
          { error: 'Hiding "Powered by MuchLove" requires Pro plan or higher' },
          { status: 403 }
        )
      }
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Check if config exists
    const { data: existingConfig } = await supabaseAdmin
      .from('widget_configs')
      .select('id, api_key')
      .eq('company_id', company.id)
      .single()

    if (existingConfig) {
      // Update existing config
      const updateData: any = {}
      if (enabled !== undefined) updateData.enabled = enabled
      if (theme) updateData.theme = theme
      if (allowedDomains !== undefined) updateData.allowed_domains = allowedDomains

      const { data: updatedConfig, error: updateError } = await supabaseAdmin
        .from('widget_configs')
        .update(updateData)
        .eq('id', existingConfig.id)
        .select()
        .single()

      if (updateError) {
        console.error('Update widget config error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update widget config' },
          { status: 500 }
        )
      }

      return NextResponse.json({ config: updatedConfig }, { status: 200 })
    } else {
      // Create new config
      const apiKey = `ml_${nanoid(32)}`

      const { data: newConfig, error: createError } = await supabaseAdmin
        .from('widget_configs')
        .insert({
          company_id: company.id,
          api_key: apiKey,
          enabled: enabled ?? false,
          theme: (theme ?? DEFAULT_WIDGET_THEME) as unknown as Json,
          allowed_domains: allowedDomains ?? [],
        })
        .select()
        .single()

      if (createError) {
        console.error('Create widget config error:', createError)
        return NextResponse.json(
          { error: 'Failed to create widget config' },
          { status: 500 }
        )
      }

      return NextResponse.json({ config: newConfig }, { status: 201 })
    }
  } catch (error) {
    console.error('Update widget config error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
