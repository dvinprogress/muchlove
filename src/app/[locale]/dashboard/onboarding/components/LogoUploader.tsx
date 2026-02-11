'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface LogoUploaderProps {
  currentLogoUrl: string | null
  onUpload: (file: File) => Promise<void>
  isUploading: boolean
}

export function LogoUploader({ currentLogoUrl, onUpload, isUploading }: LogoUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    const maxSize = 2 * 1024 * 1024 // 2MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image')
      return false
    }

    if (file.size > maxSize) {
      toast.error('Image must be smaller than 2MB')
      return false
    }

    return true
  }

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return
    await onUpload(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = () => {
    setIsDragActive(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragActive
            ? 'border-rose-500 bg-rose-50'
            : currentLogoUrl
            ? 'border-slate-300 hover:border-rose-400 hover:bg-rose-50/50'
            : 'border-slate-300 hover:border-rose-400 hover:bg-rose-50/50'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
            <p className="text-sm text-slate-600">Uploading...</p>
          </div>
        ) : currentLogoUrl ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <img
                src={currentLogoUrl}
                alt="Company logo"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium">Change</span>
              </div>
            </div>
            <p className="text-sm text-slate-600">Click or drag to change logo</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-700">
                Drag & drop your logo here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                or click to browse (JPG, PNG, WebP • Max 2MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
