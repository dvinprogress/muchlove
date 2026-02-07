import { createUploadHandler } from "@/lib/feedback/api/upload-handler"
import { feedbackConfig } from "@/lib/feedback/feedback.config"
import { createClient } from "@/lib/supabase/server"

export const POST = createUploadHandler(feedbackConfig, createClient)
