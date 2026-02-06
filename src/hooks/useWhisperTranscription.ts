'use client'

import { useRef, useState, useCallback } from 'react'

interface UseWhisperTranscriptionReturn {
  transcribe: (videoBlob: Blob) => Promise<string | null>
  isTranscribing: boolean
  isModelLoading: boolean
  progress: number // 0-100
  error: string | null
}

export function useWhisperTranscription(): UseWhisperTranscriptionReturn {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Cache le pipeline pour ne pas recharger à chaque appel
  const pipelineRef = useRef<any>(null)

  const extractAudioFromBlob = async (blob: Blob): Promise<Float32Array | null> => {
    try {
      const arrayBuffer = await blob.arrayBuffer()
      const audioContext = new AudioContext({ sampleRate: 16000 })
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      // Extraire le canal mono
      const audioData = audioBuffer.getChannelData(0)

      await audioContext.close()
      return audioData
    } catch (err) {
      console.error('Erreur extraction audio:', err)
      setError('Impossible d\'extraire l\'audio de la vidéo')
      return null
    }
  }

  const loadPipeline = async () => {
    if (pipelineRef.current) {
      return pipelineRef.current
    }

    setIsModelLoading(true)
    setProgress(0)

    try {
      // Import dynamique pour éviter les problèmes SSR
      const { pipeline, env } = await import('@huggingface/transformers')

      // Configurer le cache local
      env.allowLocalModels = false
      env.useBrowserCache = true

      // Essayer avec WebGPU d'abord
      let transcriber
      try {
        setProgress(10)
        transcriber = await pipeline(
          'automatic-speech-recognition',
          'onnx-community/whisper-tiny',
          {
            device: 'webgpu',
            progress_callback: (progress: any) => {
              // Progress du chargement du modèle (0-50%)
              if (progress.status === 'download') {
                const downloadProgress = (progress.loaded / progress.total) * 50
                setProgress(Math.min(downloadProgress, 50))
              } else if (progress.status === 'progress') {
                const loadProgress = progress.progress * 50
                setProgress(Math.min(loadProgress, 50))
              }
            }
          }
        )
      } catch (webgpuError) {
        console.warn('WebGPU non supporté, fallback sur CPU:', webgpuError)
        setProgress(10)

        // Fallback sur CPU
        transcriber = await pipeline(
          'automatic-speech-recognition',
          'Xenova/whisper-tiny',
          {
            progress_callback: (progress: any) => {
              if (progress.status === 'download') {
                const downloadProgress = (progress.loaded / progress.total) * 50
                setProgress(Math.min(downloadProgress, 50))
              } else if (progress.status === 'progress') {
                const loadProgress = progress.progress * 50
                setProgress(Math.min(loadProgress, 50))
              }
            }
          }
        )
      }

      setProgress(50)
      pipelineRef.current = transcriber
      setIsModelLoading(false)
      return transcriber
    } catch (err) {
      console.error('Erreur chargement modèle:', err)
      setError('Impossible de charger le modèle Whisper')
      setIsModelLoading(false)
      return null
    }
  }

  const transcribe = useCallback(async (videoBlob: Blob): Promise<string | null> => {
    setIsTranscribing(true)
    setError(null)
    setProgress(0)

    try {
      // 1. Charger le modèle si nécessaire (0-50% du progress)
      const transcriber = await loadPipeline()
      if (!transcriber) {
        setIsTranscribing(false)
        return null
      }

      setProgress(50)

      // 2. Extraire l'audio
      const audioData = await extractAudioFromBlob(videoBlob)
      if (!audioData) {
        setIsTranscribing(false)
        return null
      }

      setProgress(60)

      // 3. Transcription (60-100% du progress)
      const result = await transcriber(audioData, {
        // Pour les vidéos longues (>30s), découper en chunks
        chunk_length_s: 30,
        stride_length_s: 5,
        task: 'transcribe',
        return_timestamps: false,
      })

      setProgress(100)
      setIsTranscribing(false)

      // Le résultat peut être un objet { text: string } ou directement une string
      const transcription = typeof result === 'string' ? result : result.text
      return transcription || null
    } catch (err) {
      console.error('Erreur transcription:', err)
      setError('Erreur lors de la transcription')
      setIsTranscribing(false)
      return null
    }
  }, [])

  return {
    transcribe,
    isTranscribing,
    isModelLoading,
    progress,
    error,
  }
}
