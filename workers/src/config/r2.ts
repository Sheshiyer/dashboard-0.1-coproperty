// ============================================================================
// R2 Bucket Configuration for Photo Storage
// ============================================================================

export interface R2Config {
  bucket: R2Bucket
  publicUrl: string
}

/**
 * Get R2 configuration from environment bindings.
 * The PHOTOS binding must be configured in wrangler.toml.
 * R2_PUBLIC_URL defaults to the production photos domain.
 */
export function getR2Config(env: { PHOTOS: R2Bucket; R2_PUBLIC_URL?: string }): R2Config {
  return {
    bucket: env.PHOTOS,
    publicUrl: env.R2_PUBLIC_URL || 'https://photos.coproperty.com',
  }
}

/** Maximum file size for photo uploads (10MB) */
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024

/** Allowed MIME types for photo uploads */
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

/**
 * Validate that a file is an acceptable photo upload.
 * Returns null if valid, or an error message string.
 */
export function validatePhotoFile(file: File): string | null {
  if (!file) {
    return 'No file provided'
  }

  if (file.size > MAX_PHOTO_SIZE) {
    return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds ${MAX_PHOTO_SIZE / 1024 / 1024}MB limit`
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return `Invalid file type: ${file.type}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
  }

  return null
}

/**
 * Generate a unique, URL-safe filename for R2 storage.
 * Format: {jobId}/{type}/{timestamp}-{randomId}.{ext}
 */
export function generatePhotoKey(
  jobId: string,
  type: 'before' | 'after',
  originalFilename: string
): string {
  const timestamp = Date.now()
  const randomId = crypto.randomUUID().split('-')[0]
  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'jpg'
  return `cleaning/${jobId}/${type}/${timestamp}-${randomId}.${ext}`
}
