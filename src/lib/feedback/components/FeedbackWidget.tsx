"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Sparkles } from "lucide-react"
import { FeedbackModal } from "./FeedbackModal"
import type { FeedbackConfig } from "../types"

// =============================================================================
// TYPES
// =============================================================================

interface FeedbackWidgetProps {
  position?: "bottom-right" | "bottom-left"
  config: FeedbackConfig
  isAuthenticated?: boolean
  userEmail?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FeedbackWidget({
  position = "bottom-right",
  config,
  isAuthenticated = false,
  userEmail,
}: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
  }

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={`
              fixed z-40 ${positionClasses[position]}
              flex items-center gap-2.5 px-5 py-3
              bg-gradient-to-r ${config.branding.gradientFrom} via-${config.branding.accentColor}-500 ${config.branding.gradientTo}
              text-white text-sm font-semibold
              rounded-full
              shadow-lg shadow-${config.branding.primaryColor}-500/30
              hover:shadow-xl hover:shadow-${config.branding.primaryColor}-500/40
              transition-all duration-300
            `}
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span>Feedback</span>
            <Sparkles className="w-4 h-4 opacity-80" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modal */}
      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isAuthenticated={isAuthenticated}
        userEmail={userEmail}
        config={config}
      />
    </>
  )
}
