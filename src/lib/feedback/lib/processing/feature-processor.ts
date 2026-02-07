import type { FeedbackRecord } from "../../types"

export async function createUserTask(
  feedback: FeedbackRecord,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<void> {
  const { error } = await supabase
    .from("user_feedback_tasks")
    .insert({
      feedback_id: feedback.id,
      title: feedback.category === "feature"
        ? `[Feature] ${feedback.title}`
        : `[Amelioration] ${feedback.title}`,
      description: feedback.description,
      status: "pending",
      priority: "medium",
      submitted_by_email: feedback.visitor_email,
    })

  if (error) {
    console.error("[Feature Processor] Error creating user task:", error)
    throw error
  }
}
