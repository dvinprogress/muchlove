'use client'

import { useState, useCallback } from 'react'

interface UseWhisperTranscriptionReturn {
  transcribe: (videoBlob: Blob) => Promise<string | null>
  isTranscribing: boolean
  isModelLoading: boolean
  progress: number // 0-100
  error: string | null
}

/**
 * Converts Float32Array audio samples to a WAV blob
 */
function float32ToWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeString(36, 'data')
  view.setUint32(40, samples.length * 2, true)

  // Write audio data
  const offset = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0))
    view.setInt16(offset + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

export function useWhisperTranscription(): UseWhisperTranscriptionReturn {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  /**
   * Extracts audio from video blob as Float32Array
   */
  const extractAudioFromBlob = async (blob: Blob): Promise<Float32Array | null> => {
    try {
      const arrayBuffer = await blob.arrayBuffer()
      const audioContext = new AudioContext({ sampleRate: 16000 })
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      // Extract mono channel
      const audioData = audioBuffer.getChannelData(0)

      await audioContext.close()
      return audioData
    } catch (err) {
      console.error('Audio extraction error:', err)
      setError('Unable to extract audio from video')
      return null
    }
  }

  /**
   * Transcribes video blob by calling /api/transcribe
   */
  const transcribe = useCallback(async (videoBlob: Blob): Promise<string | null> => {
    setIsTranscribing(true)
    setError(null)
    setProgress(0)

    try {
      // Step 1: Extract audio (0-30% progress)
      setProgress(5)
      const audioData = await extractAudioFromBlob(videoBlob)
      if (!audioData) {
        setIsTranscribing(false)
        return null
      }

      setProgress(30)

      // Step 2: Convert to WAV blob
      const wavBlob = float32ToWav(audioData, 16000)

      // Step 3: Send to API (30-100% progress)
      const formData = new FormData()
      formData.append('audio', wavBlob, 'audio.wav')

      setProgress(40)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      setProgress(80)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Transcription failed' }))
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const data = await response.json()
      setProgress(100)
      setIsTranscribing(false)

      return data.transcription || null
    } catch (err) {
      console.error('Transcription error:', err)
      setError(err instanceof Error ? err.message : 'Transcription failed')
      setIsTranscribing(false)
      return null
    }
  }, [])

  return {
    transcribe,
    isTranscribing,
    isModelLoading: false, // No model to load with API approach
    progress,
    error,
  }
}
