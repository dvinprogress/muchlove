import type { FeedbackRecord, FeedbackConfig } from "../../types"
import { extractBugTags } from "./bug-processor"
import { createUserTask } from "./feature-processor"

export async function runProcessingPipeline(
  feedback: FeedbackRecord,
  config: FeedbackConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<void> {
  if (feedback.security_status === "blocked") return

  if (config.processing.bugAutoTag && feedback.category === "bug") {
    const tags = extractBugTags(feedback)
    if (tags.length > 0) {
      await supabase
        .from("feedbacks")
        .update({ auto_tags: tags })
        .eq("id", feedback.id)
    }
  }

  if (config.processing.featureToUserTasks && (feedback.category === "feature" || feedback.category === "improvement")) {
    await createUserTask(feedback, supabase)
  }

  if (config.processing.webhookUrl) {
    sendWebhook(config.processing.webhookUrl, feedback).catch((err) => {
      console.error("[Pipeline] Webhook error:", err)
    })
  }
}

async function sendWebhook(url: string, feedback: FeedbackRecord): Promise<void> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "feedback.created",
        timestamp: new Date().toISOString(),
        feedback: {
          id: feedback.id,
          category: feedback.category,
          title: feedback.title,
          description: feedback.description,
          security_status: feedback.security_status,
          auto_tags: feedback.auto_tags,
        },
      }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}
