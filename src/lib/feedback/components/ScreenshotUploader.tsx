"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Image as ImageIcon, Loader2, Camera } from "lucide-react"
import {
  compressImage,
  formatFileSize,
  validateImageFile,
  revokePreviewURLs,
  type CompressedFile,
} from "../lib/compress"

// =============================================================================
// TYPES
// =============================================================================

interface ScreenshotUploaderProps {
  maxFiles?: number
  onChange: (files: CompressedFile[]) => void
  disabled?: boolean
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ScreenshotUploader({
  maxFiles = 5,
  onChange,
  disabled = false,
}: ScreenshotUploaderProps) {
  const [files, setFiles] = useState<CompressedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      revokePreviewURLs(files)
    }
  }, [files])

  const processFiles = useCallback(
    async (newFiles: File[]) => {
      if (disabled) return

      setError(null)
      setIsCompressing(true)

      try {
        const remainingSlots = maxFiles - files.length
        const filesToProcess = newFiles.slice(0, remainingSlots)

        if (newFiles.length > remainingSlots) {
          setError(`Maximum ${maxFiles} images. ${newFiles.length - remainingSlots} fichier(s) ignore(s).`)
        }

        const compressed: CompressedFile[] = []

        for (const file of filesToProcess) {
          const validation = validateImageFile(file)
          if (!validation.valid) {
            setError(validation.error || "Fichier invalide")
            continue
          }

          const result = await compressImage(file)
          compressed.push(result)
        }

        const updatedFiles = [...files, ...compressed]
        setFiles(updatedFiles)
        onChange(updatedFiles)
      } catch (err) {
        console.error("Compression error:", err)
        setError("Erreur lors de la compression des images")
      } finally {
        setIsCompressing(false)
      }
    },
    [files, maxFiles, onChange, disabled]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      )

      if (droppedFiles.length > 0) {
        processFiles(droppedFiles)
      }
    },
    [processFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])
      if (selectedFiles.length > 0) {
        processFiles(selectedFiles)
      }
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    },
    [processFiles]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const imageFiles: File[] = []
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) imageFiles.push(file)
        }
      }

      if (imageFiles.length > 0) {
        processFiles(imageFiles)
      }
    },
    [processFiles]
  )

  // Listen for paste events
  useEffect(() => {
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [handlePaste])

  const removeFile = useCallback(
    (index: number) => {
      const fileToRemove = files[index]
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }

      const updatedFiles = files.filter((_, i) => i !== index)
      setFiles(updatedFiles)
      onChange(updatedFiles)
    },
    [files, onChange]
  )

  const canAddMore = files.length < maxFiles && !disabled

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {canAddMore && (
        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-3 p-6
            border-2 border-dashed rounded-xl
            cursor-pointer transition-all duration-200
            ${isDragging
              ? "border-orange-400 bg-orange-50"
              : "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/50"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />

          <div
            className={`
              w-14 h-14 rounded-xl flex items-center justify-center transition-all
              ${isDragging
                ? "bg-gradient-to-br from-orange-500 to-amber-500"
                : "bg-white border border-gray-200"
              }
            `}
          >
            {isCompressing ? (
              <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
            ) : (
              <Camera
                className={`w-7 h-7 ${isDragging ? "text-white" : "text-gray-400"}`}
              />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {isCompressing
                ? "Compression en cours..."
                : isDragging
                ? "Deposez vos images ici"
                : "Glissez des images ou cliquez ici"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WebP jusqu&apos;a 5MB - Max {maxFiles} images
            </p>
          </div>

          {/* Paste hint */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-500">
            <span>Ctrl+V</span>
            <span className="text-gray-300">|</span>
            <span>Coller depuis presse-papier</span>
          </div>
        </motion.div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-red-50 border border-red-200"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {files.map((file, index) => (
              <motion.div
                key={file.preview}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm"
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img
                  src={file.preview}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Overlay with info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-3 gap-0.5">
                  <p className="text-xs text-white font-medium">
                    {file.width}x{file.height}
                  </p>
                  <p className="text-[10px] text-white/70">
                    {formatFileSize(file.compressedSize)}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-gray-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-red-500 shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Counter */}
      {files.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center">
            <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <span>
            {files.length}/{maxFiles} image{files.length > 1 ? "s" : ""}
          </span>
          {files.length < maxFiles && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="ml-auto text-orange-500 hover:text-orange-600 font-medium text-sm"
            >
              + Ajouter
            </button>
          )}
        </div>
      )}
    </div>
  )
}
