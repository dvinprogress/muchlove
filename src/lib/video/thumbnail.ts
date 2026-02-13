/**
 * Extracts a frame from a video blob and returns it as a JPEG blob
 * Uses Canvas API - native browser, zero dependencies
 */
export async function generateThumbnail(
  videoBlob: Blob,
  seekTime: number = 1 // time in seconds to seek to
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    const url = URL.createObjectURL(videoBlob)
    video.src = url

    video.onloadedmetadata = () => {
      // Seek to the desired time (or middle if video is short)
      const time = Math.min(seekTime, video.duration / 2)
      video.currentTime = time
    }

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas')
        // Use square format matching video constraints (720x720)
        canvas.width = 720
        canvas.height = 720

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(url)
          reject(new Error('Canvas context not available'))
          return
        }

        // Draw the video frame (mirror horizontally since front camera is mirrored)
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to JPEG blob (quality 0.85 for good balance size/quality)
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url)
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to generate thumbnail'))
            }
          },
          'image/jpeg',
          0.85
        )
      } catch (err) {
        URL.revokeObjectURL(url)
        reject(err)
      }
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load video'))
    }
  })
}
