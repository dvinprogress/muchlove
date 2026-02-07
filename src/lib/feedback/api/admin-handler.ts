import type { FeedbackConfig } from "../types"
import { feedbackQuerySchema, feedbackUpdateSchema } from "../lib/schemas"

/**
 * Handler pour GET /api/feedback/admin
 *
 * Liste les feedbacks avec filtres optionnels.
 * Supporte : status, category, securityStatus, dateFrom, dateTo, limit, offset
 *
 * @returns { data: FeedbackRecord[], total: number }
 */
async function handleGetFeedbacks(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  request: Request
): Promise<Response> {
  try {
    const url = new URL(request.url)
    const queryParams = {
      status: url.searchParams.get("status") || undefined,
      category: url.searchParams.get("category") || undefined,
      securityStatus: url.searchParams.get("securityStatus") || undefined,
      dateFrom: url.searchParams.get("dateFrom") || undefined,
      dateTo: url.searchParams.get("dateTo") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      offset: url.searchParams.get("offset") || undefined,
    }

    const validation = feedbackQuerySchema.safeParse(queryParams)
    if (!validation.success) {
      return Response.json(
        { error: "Parametres de requete invalides", details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { status, category, securityStatus, dateFrom, dateTo, limit, offset } = validation.data

    // Build query with filters
    let query = supabase.from("feedbacks").select("*", { count: "exact" })

    if (status) query = query.eq("status", status)
    if (category) query = query.eq("category", category)
    if (securityStatus) query = query.eq("security_status", securityStatus)
    if (dateFrom) query = query.gte("created_at", dateFrom)
    if (dateTo) query = query.lte("created_at", dateTo)

    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("[Feedback Admin] DB error:", error)
      return Response.json({ error: "Erreur lors de la recuperation des feedbacks" }, { status: 500 })
    }

    return Response.json({ data, total: count || 0 })
  } catch (error) {
    console.error("[Feedback Admin] Unexpected error:", error)
    return Response.json({ error: "Erreur interne" }, { status: 500 })
  }
}

/**
 * Handler pour PATCH /api/feedback/admin
 *
 * Met a jour un feedback par son ID.
 * Body : { status?, priority?, ai_suggested_category?, ai_tags?, is_flagged?, flag_reason? }
 * Query param : id (UUID)
 *
 * @returns { data: FeedbackRecord }
 */
async function handlePatchFeedback(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  request: Request
): Promise<Response> {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return Response.json({ error: "Parametre 'id' requis" }, { status: 400 })
    }

    const body = await request.json()
    const validation = feedbackUpdateSchema.safeParse(body)

    if (!validation.success) {
      return Response.json(
        { error: "Donnees de mise a jour invalides", details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("feedbacks")
      .update(validation.data)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[Feedback Admin] DB error:", error)
      return Response.json({ error: "Erreur lors de la mise a jour" }, { status: 500 })
    }

    if (!data) {
      return Response.json({ error: "Feedback non trouve" }, { status: 404 })
    }

    return Response.json({ data })
  } catch (error) {
    console.error("[Feedback Admin] Unexpected error:", error)
    return Response.json({ error: "Erreur interne" }, { status: 500 })
  }
}

/**
 * Factory pour le handler GET/PATCH /api/feedback/admin
 *
 * Verifie l'authentification et le role admin avant de traiter la requete.
 *
 * @param config - Configuration du module feedback
 * @param supabaseFactory - Factory pour creer un client Supabase
 * @returns Handler compatible Next.js Route Handler
 */
export function createAdminHandler(
  _config: FeedbackConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseFactory: () => Promise<any>
) {
  return async (request: Request): Promise<Response> => {
    const supabase = await supabaseFactory()

    // ========================================================================
    // AUTH: Check authentication
    // ========================================================================
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: "Non authentifie" }, { status: 401 })
    }

    // ========================================================================
    // AUTH: Check admin role
    // ========================================================================
    const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return Response.json({ error: "Acces refuse" }, { status: 403 })
    }

    // ========================================================================
    // ROUTING: Dispatch based on HTTP method
    // ========================================================================
    if (request.method === "GET") {
      return handleGetFeedbacks(supabase, request)
    }

    if (request.method === "PATCH") {
      return handlePatchFeedback(supabase, request)
    }

    return Response.json({ error: "Methode non autorisee" }, { status: 405 })
  }
}
