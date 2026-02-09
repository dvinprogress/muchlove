'use client'

import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { RecordingError } from '@/types/video'

interface PermissionRequestProps {
  onRequestPermission: () => void
  error?: RecordingError | null
}

export function PermissionRequest({ onRequestPermission, error }: PermissionRequestProps) {
  const t = useTranslations('video.permission')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center max-w-md mx-auto p-4 space-y-4"
    >
      <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
        <Camera className="w-10 h-10 text-rose-500" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">
          {t('title')}
        </h2>
        <p className="text-gray-600">
          {t('description')}
        </p>
      </div>

      {error && error.code === 'CAMERA_PERMISSION_DENIED' && (
        <div className="w-full p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-sm text-rose-800 font-medium mb-2">
            {t('deniedTitle')}
          </p>
          <p className="text-xs text-rose-700">
            {t('deniedDescription')}
          </p>
          <ul className="mt-3 text-xs text-rose-600 space-y-1 list-disc list-inside">
            <li>{t('deniedInstructionsChrome')}</li>
            <li>{t('deniedInstructionsFirefox')}</li>
            <li>{t('deniedInstructionsSafari')}</li>
          </ul>
        </div>
      )}

      {error && error.code === 'CAMERA_NOT_SUPPORTED' && (
        <div className="w-full p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-sm text-rose-800 font-medium">
            {t('notSupportedTitle')}
          </p>
          <p className="text-xs text-rose-700 mt-1">
            {t('notSupportedDescription')}
          </p>
        </div>
      )}

      {error && error.code === 'CAMERA_IN_USE' && (
        <div className="w-full p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-sm text-rose-800 font-medium">
            {t('inUseTitle')}
          </p>
          <p className="text-xs text-rose-700 mt-1">
            {t('inUseDescription')}
          </p>
        </div>
      )}

      <button
        onClick={onRequestPermission}
        className="px-6 py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
      >
        {t('buttonAllow')}
      </button>
    </motion.div>
  )
}
