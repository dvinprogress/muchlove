'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X } from 'lucide-react'

interface InfoTooltipProps {
  title: string
  children: React.ReactNode
}

export function InfoTooltip({ title, children }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-5 h-5 text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
        aria-label={`Information: ${title}`}
      >
        <Info className="w-full h-full" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full z-10 w-[280px] sm:w-[320px] mt-2"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-blue-900 text-sm">{title}</h4>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-blue-400 hover:text-blue-600 transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-blue-800 space-y-2">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
