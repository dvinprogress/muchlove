export interface CompressedFile {
  file: File
  data: string
  name: string
  type: string
  size: number
  compressedSize: number
  width: number
  height: number
  preview: string
}

export async function compressImage(file: File): Promise<CompressedFile> {
  const data = await fileToBase64(file)
  const { width, height } = await getImageDimensions(file)
  return {
    file,
    data,
    name: file.name,
    type: file.type,
    size: file.size,
    compressedSize: file.size,
    width,
    height,
    preview: URL.createObjectURL(file),
  }
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => resolve({ width: 0, height: 0 })
    img.src = URL.createObjectURL(file)
  })
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024
  const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Format non supporte. Utilisez PNG, JPEG, GIF ou WebP.' }
  }
  if (file.size > maxSize) {
    return { valid: false, error: 'Fichier trop volumineux (max 10 MB).' }
  }
  return { valid: true }
}

export function revokePreviewURLs(files: CompressedFile[]): void {
  for (const file of files) {
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
  }
}
