'use client'

import { useState, useEffect, useCallback } from 'react'
import type { RecordingError } from '@/types/video'
import { VIDEO_CONSTRAINTS, ERROR_MESSAGES } from '@/types/video'

type PermissionState = 'prompt' | 'granted' | 'denied' | 'unknown'

interface UseMediaPermissionsReturn {
  permissionState: PermissionState
  error: RecordingError | null
  stream: MediaStream | null
  requestPermissions: () => Promise<void>
  checkPermission: () => Promise<void>
}

export function useMediaPermissions(): UseMediaPermissionsReturn {
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt')
  const [error, setError] = useState<RecordingError | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const checkPermission = useCallback(async () => {
    try {
      // Certains navigateurs (Firefox) ne supportent pas navigator.permissions.query pour 'camera'
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      setPermissionState(result.state as PermissionState)
    } catch {
      // Fallback : on considère que c'est 'unknown' si l'API n'est pas supportée
      setPermissionState('unknown')
    }
  }, [])

  const requestPermissions = useCallback(async () => {
    setError(null)

    try {
      // Vérifier si l'API est supportée
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw { code: 'CAMERA_NOT_SUPPORTED' }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS)
      setStream(mediaStream)
      setPermissionState('granted')
    } catch (err) {
      let errorCode: RecordingError['code'] = 'CAMERA_PERMISSION_DENIED'

      if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'CAMERA_NOT_SUPPORTED') {
        errorCode = 'CAMERA_NOT_SUPPORTED'
      } else if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          errorCode = 'CAMERA_PERMISSION_DENIED'
        } else if (err.name === 'NotFoundError') {
          errorCode = 'CAMERA_NOT_SUPPORTED'
        } else if (err.name === 'NotReadableError') {
          errorCode = 'CAMERA_IN_USE'
        }
      }

      setPermissionState('denied')
      setError({
        code: errorCode,
        message: ERROR_MESSAGES[errorCode]
      })
    }
  }, [])

  // Auto-check permission au mount
  useEffect(() => {
    checkPermission()
  }, [checkPermission])

  // Cleanup : révoquer le stream au unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return {
    permissionState,
    error,
    stream,
    requestPermissions,
    checkPermission
  }
}
