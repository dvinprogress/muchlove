import { createFeedbackHandler } from "@/lib/feedback/api/feedback-handler"
import { feedbackConfig } from "@/lib/feedback/feedback.config"
import { createClient } from "@/lib/supabase/server"

export const POST = createFeedbackHandler(feedbackConfig, createClient)
