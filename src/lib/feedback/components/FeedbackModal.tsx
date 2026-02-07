"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, Sparkles } from "lucide-react"
import { FeedbackForm, type FeedbackFormData } from "./FeedbackForm"
import type { FeedbackConfig } from "../types"

// =============================================================================
// TYPES
// =============================================================================

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  userEmail?: string
  config: FeedbackConfig
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FeedbackModal({
  isOpen,
  onClose,
  isAuthenticated,
  userEmail,
  config,
}: FeedbackModalProps) {
  const [status, setStatus] = useState<"form" | "success" | "error">("form")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (data: FeedbackFormData) => {
    try {
      // Upload screenshots first
      const screenshotIds: string[] = []

      for (const screenshot of data.screenshots) {
        const formData = new FormData()
        formData.append("file", screenshot.file)

        const uploadRes = await fetch(config.api.uploadEndpoint, {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error("Erreur lors de l'upload des images")
        }

        const uploadData = await uploadRes.json()
        if (uploadData.screenshotId) {
          screenshotIds.push(uploadData.screenshotId)
        }
      }

      // Submit feedback
      const res = await fetch(config.api.feedbackEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: data.category,
          title: data.title,
          description: data.description,
          visitorEmail: data.visitorEmail,
          pageUrl: data.pageUrl,
          browserInfo: data.browserInfo,
          screenshotIds,
          turnstileToken: data.turnstileToken,
          honeypot: data.honeypot,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Erreur lors de l'envoi")
      }

      setStatus("success")
    } catch (error) {
      console.error("Submit error:", error)
      setErrorMessage(
        error instanceof Error ? error.message : "Une erreur est survenue"
      )
      setStatus("error")
    }
  }

  const handleClose = () => {
    setStatus("form")
    setErrorMessage("")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header gradient */}
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${config.branding.gradientFrom} via-${config.branding.accentColor}-500 ${config.branding.gradientTo} rounded-t-2xl`} />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 -m-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {status === "form" && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <FeedbackForm
                      isAuthenticated={isAuthenticated}
                      userEmail={userEmail}
                      onSubmit={handleSubmit}
                      onCancel={handleClose}
                      config={config}
                    />
                  </motion.div>
                )}

                {status === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center mb-5 border border-emerald-200"
                    >
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-gray-900">
                      Merci pour votre feedback !
                    </h3>
                    <p className="text-gray-500 mt-2 max-w-xs">
                      Votre retour nous aide a ameliorer continuellement la
                      plateforme.
                    </p>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-50 rounded-full text-sm text-emerald-600 border border-emerald-200"
                    >
                      <Sparkles className="w-4 h-4" />
                      Notre equipe va l&apos;analyser rapidement
                    </motion.div>

                    <button
                      onClick={handleClose}
                      className={`mt-6 px-6 py-3 bg-gradient-to-r ${config.branding.gradientFrom} ${config.branding.gradientTo} text-white font-semibold rounded-xl shadow-lg shadow-${config.branding.primaryColor}-500/25 hover:shadow-xl hover:shadow-${config.branding.primaryColor}-500/30 transition-all`}
                    >
                      Fermer
                    </button>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center py-8"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center mb-5 border border-red-200">
                      <X className="w-10 h-10 text-red-500" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900">
                      Oups, une erreur !
                    </h3>
                    <p className="text-gray-500 mt-2 max-w-xs">{errorMessage}</p>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleClose}
                        className="px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Fermer
                      </button>
                      <button
                        onClick={() => setStatus("form")}
                        className={`px-5 py-2.5 bg-gradient-to-r ${config.branding.gradientFrom} ${config.branding.gradientTo} text-white font-semibold rounded-xl shadow-lg shadow-${config.branding.primaryColor}-500/25 hover:shadow-xl transition-all`}
                      >
                        Reessayer
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
