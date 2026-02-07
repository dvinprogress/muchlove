import type { FeedbackConfig } from "../types"

/**
 * Factory pour le handler POST /api/feedback/upload
 *
 * Gere l'upload de screenshots vers Supabase Storage.
 * Les screenshots sont crees en base avec feedback_id = null,
 * puis lies au feedback lors de la soumission finale.
 *
 * TODO: Migration SQL requise pour rendre feedback_id nullable dans feedback_screenshots
 * ALTER TABLE feedback_screenshots ALTER COLUMN feedback_id DROP NOT NULL;
 *
 * @param config - Configuration du module feedback
 * @param supabaseFactory - Factory pour creer un client Supabase
 * @returns Handler compatible Next.js Route Handler
 */
export function createUploadHandler(
  config: FeedbackConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseFactory: () => Promise<any>
) {
  return async (request: Request): Promise<Response> => {
    try {
      const formData = await request.formData()
      const file = formData.get("file")

      if (!file || !(file instanceof File)) {
        return Response.json({ error: "Aucun fichier fourni" }, { status: 400 })
      }

      // ========================================================================
      // VALIDATION: MIME Type
      // ========================================================================
      if (!config.storage.allowedMimeTypes.includes(file.type)) {
        return Response.json(
          {
            error: `Type de fichier non autorise. Acceptes: ${config.storage.allowedMimeTypes.join(", ")}`,
          },
          { status: 400 }
        )
      }

      // ========================================================================
      // VALIDATION: File Size
      // ========================================================================
      if (file.size > config.storage.maxFileSize) {
        return Response.json(
          {
            error: `Fichier trop volumineux. Max: ${config.storage.maxFileSize / (1024 * 1024)} MB`,
          },
          { status: 400 }
        )
      }

      const supabase = await supabaseFactory()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // ========================================================================
      // UPLOAD: Generate unique path and upload to Storage
      // ========================================================================
      // Secure extension extraction (prevent path traversal)
      const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"]
      const rawExt = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z]/g, "")
      const ext = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : "png"
      const screenshotId = crypto.randomUUID()
      const folder = user?.id || "anonymous"
      const storagePath = `${folder}/${screenshotId}.${ext}`

      // Verify magic bytes
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer).slice(0, 12)
      const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
      const isJPEG = bytes[0] === 0xff && bytes[1] === 0xd8
      const isWEBP = bytes.length >= 12 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
      if (!isPNG && !isJPEG && !isWEBP) {
        return Response.json({ error: "Format de fichier invalide" }, { status: 400 })
      }

      // Re-create File from buffer for upload
      const uploadFile = new File([buffer], file.name, { type: file.type })

      const { error: uploadError } = await supabase.storage
        .from(config.storage.bucket)
        .upload(storagePath, uploadFile, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error("[Feedback Upload] Storage error:", uploadError)
        return Response.json({ error: "Erreur lors de l'upload" }, { status: 500 })
      }

      // ========================================================================
      // DB: Create screenshot record (unlinked, will be linked on feedback submit)
      // ========================================================================
      const { data: screenshot, error: dbError } = await supabase
        .from("feedback_screenshots")
        .insert({
          id: screenshotId,
          feedback_id: null, // Will be linked when feedback is submitted
          storage_path: storagePath,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single()

      if (dbError) {
        console.error("[Feedback Upload] DB error:", dbError)
        return Response.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 })
      }

      return Response.json({ success: true, screenshotId: screenshot.id })
    } catch (error) {
      console.error("[Feedback Upload] Unexpected error:", error)
      return Response.json({ error: "Erreur interne" }, { status: 500 })
    }
  }
}
