"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Send, Mail, Sparkles } from "lucide-react"
import { CategorySelector } from "./CategorySelector"
import { ScreenshotUploader } from "./ScreenshotUploader"
import { CATEGORY_CONFIG } from "../lib/config"
import type { CompressedFile } from "../lib/compress"
import type { FeedbackConfig } from "../types"

// =============================================================================
// TYPES
// =============================================================================

type FeedbackCategory = "bug" | "improvement" | "feature"

interface FeedbackFormProps {
  isAuthenticated: boolean
  userEmail?: string
  onSubmit: (data: FeedbackFormData) => Promise<void>
  onCancel: () => void
  config: FeedbackConfig
  turnstileToken?: string
}

export interface FeedbackFormData {
  category: FeedbackCategory
  title: string
  description: string
  visitorEmail?: string
  screenshots: CompressedFile[]
  pageUrl: string
  browserInfo: {
    userAgent: string
    language: string
    platform: string
    screenWidth: number
    screenHeight: number
  }
  turnstileToken?: string
  honeypot: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FeedbackForm({
  isAuthenticated,
  userEmail,
  onSubmit,
  onCancel,
  config,
  turnstileToken = "",
}: FeedbackFormProps) {
  const [step, setStep] = useState<"category" | "form">("category")
  const [category, setCategory] = useState<FeedbackCategory | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState(userEmail || "")
  const [honeypot, setHoneypot] = useState("")
  const [screenshots, setScreenshots] = useState<CompressedFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!category) {
      newErrors.category = "Selectionnez une categorie"
    }

    if (!title.trim()) {
      newErrors.title = "Le titre est requis"
    } else if (title.length < 5) {
      newErrors.title = "Le titre doit contenir au moins 5 caracteres"
    }

    if (!description.trim()) {
      newErrors.description = "La description est requise"
    } else if (description.length < 20) {
      newErrors.description = "La description doit contenir au moins 20 caracteres"
    }

    if (!isAuthenticated && !email.trim()) {
      newErrors.email = "L'email est requis pour vous recontacter"
    } else if (!isAuthenticated && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email invalide"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCategorySelect = (cat: FeedbackCategory) => {
    setCategory(cat)
    setStep("form")
  }

  const handleBack = () => {
    setStep("category")
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || !category) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        category,
        title: title.trim(),
        description: description.trim(),
        visitorEmail: !isAuthenticated ? email.trim() : undefined,
        screenshots,
        pageUrl: window.location.href,
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
        },
        turnstileToken,
        honeypot,
      })
    } catch (error) {
      console.error("Submit error:", error)
      setErrors({ submit: "Une erreur est survenue. Veuillez reessayer." })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get category config
  const categoryConfig = category ? CATEGORY_CONFIG[category] : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot field (hidden) */}
      <input
        type="text"
        name="_hp_email"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ display: "none" }}
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {step === "category" && (
          <motion.div
            key="category"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-${config.branding.primaryColor}-100 text-${config.branding.primaryColor}-600 text-sm font-medium mb-3`}>
                <Sparkles className="w-4 h-4" />
                Feedback
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Comment pouvons-nous vous aider ?
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Selectionnez le type de feedback
              </p>
            </div>

            <CategorySelector value={category} onChange={handleCategorySelect} />
          </motion.div>
        )}

        {step === "form" && category && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Header with back button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {categoryConfig?.label}
                </h3>
                <p className="text-sm text-gray-500">
                  {categoryConfig?.description}
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Titre
              </label>
              <input
                type="text"
                placeholder="Resume en quelques mots..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className={`
                  w-full px-4 py-3 rounded-xl border bg-white
                  text-gray-900 placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-${config.branding.primaryColor}-500/20 focus:border-${config.branding.primaryColor}-500
                  transition-all
                  ${errors.title ? "border-red-300 bg-red-50" : "border-gray-200"}
                `}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                placeholder={
                  category === "bug"
                    ? "Decrivez le probleme rencontre, les etapes pour le reproduire..."
                    : category === "improvement"
                    ? "Decrivez l'amelioration souhaitee et pourquoi..."
                    : "Decrivez la fonctionnalite que vous aimeriez voir..."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={5000}
                className={`
                  w-full px-4 py-3 rounded-xl border bg-white resize-none
                  text-gray-900 placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-${config.branding.primaryColor}-500/20 focus:border-${config.branding.primaryColor}-500
                  transition-all
                  ${errors.description ? "border-red-300 bg-red-50" : "border-gray-200"}
                `}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Email (if not authenticated) */}
            {!isAuthenticated && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`
                      w-full pl-11 pr-4 py-3 rounded-xl border bg-white
                      text-gray-900 placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-${config.branding.primaryColor}-500/20 focus:border-${config.branding.primaryColor}-500
                      transition-all
                      ${errors.email ? "border-red-300 bg-red-50" : "border-gray-200"}
                    `}
                  />
                </div>
                {errors.email ? (
                  <p className="text-sm text-red-500">{errors.email}</p>
                ) : (
                  <p className="text-xs text-gray-400">Pour vous tenir informe de l&apos;avancement</p>
                )}
              </div>
            )}

            {/* Screenshots */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Captures d&apos;ecran{" "}
                <span className="text-gray-400 font-normal">(recommande)</span>
              </label>
              <ScreenshotUploader
                maxFiles={5}
                onChange={setScreenshots}
                disabled={isSubmitting}
              />
            </div>

            {errors.submit && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 text-center">{errors.submit}</p>
              </div>
            )}

            {/* Submit button */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 px-5 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-5 py-3 bg-gradient-to-r ${config.branding.gradientFrom} ${config.branding.gradientTo} text-white font-semibold rounded-xl shadow-lg shadow-${config.branding.primaryColor}-500/25 hover:shadow-xl hover:shadow-${config.branding.primaryColor}-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Envoi...
                  </>
                ) : (
                  <>
                    Envoyer
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}
