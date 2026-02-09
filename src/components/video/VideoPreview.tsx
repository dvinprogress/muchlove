'use client'

import { useEffect, useRef } from 'react'
import { Camera } from 'lucide-react'

interface VideoPreviewProps {
  stream?: MediaStream | null
  videoUrl?: string | null
  isRecording?: boolean
}

export function VideoPreview({ stream, videoUrl, isRecording = false }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Mode live : attacher le stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Cleanup srcObject au unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [])

  const showPlaceholder = !stream && !videoUrl

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div
        className={`
          relative aspect-video rounded-2xl overflow-hidden bg-gray-900
          ${isRecording ? 'ring-4 ring-red-500 animate-pulse' : ''}
        `}
      >
        {showPlaceholder ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <Camera className="w-24 h-24 text-gray-400" />
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay={!!stream}
            muted={!!stream}
            playsInline
            controls={!!videoUrl}
            src={videoUrl || undefined}
            className={`
              w-full h-full object-cover
              ${stream ? 'scale-x-[-1]' : ''}
            `}
          />
        )}
      </div>

      {isRecording && (
        <div className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-full animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full" />
          <span>REC</span>
        </div>
      )}
    </div>
  )
}
