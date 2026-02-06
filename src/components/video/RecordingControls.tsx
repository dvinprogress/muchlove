'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Circle, Square, RotateCcw, Check } from 'lucide-react'
import type { RecordingPhase } from '@/types/video'

interface RecordingControlsProps {
  phase: RecordingPhase
  duration: number
  maxDuration: number
  attempts: number
  maxAttempts: number
  countdown: number | null
  onStartRecording: () => void
  onStopRecording: () => void
  onRetry: () => void
  onValidate: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function RecordingControls({
  phase,
  duration,
  maxDuration,
  attempts,
  maxAttempts,
  countdown,
  onStartRecording,
  onStopRecording,
  onRetry,
  onValidate
}: RecordingControlsProps) {
  return (
    <div className="w-full max-w-md mx-auto mt-6 space-y-4">
      <AnimatePresence mode="wait">
        {/* Phase: previewing */}
        {phase === 'previewing' && (
          <motion.div
            key="previewing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex justify-center"
          >
            <button
              onClick={onStartRecording}
              className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-red-500/50"
            >
              <Circle className="w-10 h-10 text-white fill-white" />
            </button>
          </motion.div>
        )}

        {/* Phase: countdown */}
        {phase === 'countdown' && countdown !== null && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="flex justify-center"
          >
            <div className="text-8xl font-bold text-rose-500 animate-pulse">
              {countdown}
            </div>
          </motion.div>
        )}

        {/* Phase: recording */}
        {phase === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-red-500">REC</span>
              </div>
              <div className="text-xl font-mono font-bold text-gray-900">
                {formatDuration(duration)}
              </div>
            </div>

            {/* Barre de progression */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${(duration / maxDuration) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={onStopRecording}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-red-500/50"
              >
                <Square className="w-8 h-8 text-white fill-white" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Phase: recorded */}
        {phase === 'recorded' && (
          <motion.div
            key="recorded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {formatDuration(duration)}
              </div>
              <div className="text-sm text-gray-600">
                Tentative {attempts + 1}/{maxAttempts}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={onRetry}
                disabled={attempts >= maxAttempts}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-rose-500 text-rose-500 font-semibold rounded-lg hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Recommencer</span>
              </button>

              <button
                onClick={onValidate}
                className="flex items-center space-x-2 px-6 py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                <Check className="w-5 h-5" />
                <span>Valider</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
