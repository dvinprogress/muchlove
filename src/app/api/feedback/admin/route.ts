import { createAdminHandler } from "@/lib/feedback/api/admin-handler"
import { feedbackConfig } from "@/lib/feedback/feedback.config"
import { createClient } from "@/lib/supabase/server"

const handler = createAdminHandler(feedbackConfig, createClient)

export const GET = handler
export const PATCH = handler
