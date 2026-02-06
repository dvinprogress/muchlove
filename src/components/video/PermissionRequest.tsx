'use client'

import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import type { RecordingError } from '@/types/video'

interface PermissionRequestProps {
  onPermissionGranted: (stream: MediaStream) => void
  error?: RecordingError | null
}

export function PermissionRequest({ onPermissionGranted, error }: PermissionRequestProps) {
  const handleRequestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720, max: 720 }, height: { ideal: 720, max: 720 }, frameRate: { ideal: 30, max: 30 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      })
      onPermissionGranted(stream)
    } catch (err) {
      // L'erreur sera gérée par le composant parent
      console.error('Permission denied:', err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center max-w-md mx-auto p-8 space-y-6"
    >
      <div className="w-32 h-32 rounded-full bg-rose-100 flex items-center justify-center">
        <Camera className="w-16 h-16 text-rose-500" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          We need camera access 📷
        </h2>
        <p className="text-gray-600">
          To record your video testimonial, please allow camera and microphone access in your browser.
        </p>
      </div>

      {error && error.code === 'CAMERA_PERMISSION_DENIED' && (
        <div className="w-full p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-sm text-rose-800 font-medium mb-2">
            We need your permission 😊
          </p>
          <p className="text-xs text-rose-700">
            Please allow camera access in your browser settings, then reload the page.
          </p>
          <ul className="mt-3 text-xs text-rose-600 space-y-1 list-disc list-inside">
            <li>Chrome: Click the lock icon in your address bar</li>
            <li>Firefox: Click the crossed-out camera icon</li>
            <li>Safari: Preferences → Websites → Camera</li>
          </ul>
        </div>
      )}

      {error && error.code === 'CAMERA_NOT_SUPPORTED' && (
        <div className="w-full p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-sm text-rose-800 font-medium">
            Camera not available 📷
          </p>
          <p className="text-xs text-rose-700 mt-1">
            Your browser doesn't support camera access, or no camera was detected.
          </p>
        </div>
      )}

      {error && error.code === 'CAMERA_IN_USE' && (
        <div className="w-full p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-sm text-rose-800 font-medium">
            Camera already in use 😊
          </p>
          <p className="text-xs text-rose-700 mt-1">
            Your camera is being used by another app. Please close it and try again.
          </p>
        </div>
      )}

      <button
        onClick={handleRequestPermission}
        className="px-8 py-4 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
      >
        Allow camera access
      </button>
    </motion.div>
  )
}
