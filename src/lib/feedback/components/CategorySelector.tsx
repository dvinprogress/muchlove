"use client"

import { motion } from "framer-motion"
import { Bug, Sparkles, Lightbulb, Check, LucideIcon } from "lucide-react"
import { CATEGORY_CONFIG } from "../lib/config"

// =============================================================================
// TYPES
// =============================================================================

type FeedbackCategory = "bug" | "improvement" | "feature"

interface CategorySelectorProps {
  value: FeedbackCategory | null
  onChange: (category: FeedbackCategory) => void
}

interface CategoryOption {
  value: FeedbackCategory
  label: string
  description: string
  icon: LucideIcon
  gradient: string
  bgHover: string
  borderSelected: string
  bgSelected: string
}

// =============================================================================
// CONFIG
// =============================================================================

const CATEGORIES: CategoryOption[] = [
  {
    value: "bug",
    label: CATEGORY_CONFIG.bug.label,
    description: CATEGORY_CONFIG.bug.description,
    icon: Bug,
    gradient: "from-red-500 to-rose-500",
    bgHover: "hover:bg-red-50",
    borderSelected: "border-red-300",
    bgSelected: "bg-gradient-to-r from-red-50 to-rose-50",
  },
  {
    value: "improvement",
    label: CATEGORY_CONFIG.improvement.label,
    description: CATEGORY_CONFIG.improvement.description,
    icon: Sparkles,
    gradient: "from-blue-500 to-indigo-500",
    bgHover: "hover:bg-blue-50",
    borderSelected: "border-blue-300",
    bgSelected: "bg-gradient-to-r from-blue-50 to-indigo-50",
  },
  {
    value: "feature",
    label: CATEGORY_CONFIG.feature.label,
    description: CATEGORY_CONFIG.feature.description,
    icon: Lightbulb,
    gradient: "from-amber-500 to-orange-500",
    bgHover: "hover:bg-amber-50",
    borderSelected: "border-amber-300",
    bgSelected: "bg-gradient-to-r from-amber-50 to-orange-50",
  },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {CATEGORIES.map((category, index) => {
        const isSelected = value === category.value
        const Icon = category.icon

        return (
          <motion.button
            key={category.value}
            type="button"
            onClick={() => onChange(category.value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            className={`
              relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all
              ${isSelected
                ? `${category.borderSelected} ${category.bgSelected} shadow-md`
                : `border-gray-200 bg-white ${category.bgHover}`
              }
            `}
          >
            {/* Icon */}
            <div
              className={`
                flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-all
                ${isSelected
                  ? `bg-gradient-to-br ${category.gradient} shadow-lg`
                  : "bg-gray-100"
                }
              `}
            >
              <Icon
                className={`w-6 h-6 ${isSelected ? "text-white" : "text-gray-400"}`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p
                className={`font-semibold ${isSelected ? "text-gray-900" : "text-gray-700"}`}
              >
                {category.label}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {category.description}
              </p>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className={`
                  absolute top-3 right-3 w-6 h-6 rounded-full
                  flex items-center justify-center
                  bg-gradient-to-br ${category.gradient}
                  shadow-lg
                `}
              >
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
