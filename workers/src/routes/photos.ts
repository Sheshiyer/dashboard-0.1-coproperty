import { Hono } from 'hono'
import type { Bindings } from '../index'
import {
  getR2Config,
  validatePhotoFile,
  generatePhotoKey,
} from '../config/r2'

const photos = new Hono<{ Bindings: Bindings }>()

// ============================================================================
// POST /api/photos/upload - Upload a photo to R2
// ============================================================================

photos.post('/upload', async (c) => {
  try {
    const { bucket, publicUrl } = getR2Config(c.env)

    let file: File | null = null
    let jobId: string | null = null
    let type: string | null = null

    const contentType = c.req.header('content-type') || ''

    if (contentType.includes('application/json')) {
      // JSON upload with base64 data (for testing or alternative clients)
      const body = await c.req.json<{
        filename: string
        data: string
        contentType: string
        jobId: string
        type: string
      }>()
      jobId = body.jobId
      type = body.type

      // Convert base64 to File
      const binaryString = atob(body.data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      file = new File([bytes], body.filename, { type: body.contentType })
    } else {
      // FormData upload (standard browser upload)
      const formData = await c.req.formData()
      file = formData.get('file') as File | null
      jobId = formData.get('jobId') as string | null
      type = formData.get('type') as string | null
    }

    // Validate required fields
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    if (!jobId) {
      return c.json({ error: 'jobId is required' }, 400)
    }

    if (!type || !['before', 'after'].includes(type)) {
      return c.json({ error: 'type must be "before" or "after"' }, 400)
    }

    // Validate the file
    const validationError = validatePhotoFile(file)
    if (validationError) {
      return c.json({ error: validationError }, 400)
    }

    // Generate unique key and upload to R2
    const key = generatePhotoKey(jobId, type, file.name)

    await bucket.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        jobId,
        type,
        originalFilename: file.name,
        uploadedAt: new Date().toISOString(),
      },
    })

    // Construct public URL
    const url = `${publicUrl}/${key}`

    return c.json({
      success: true,
      url,
      key,
      filename: file.name,
      size: file.size,
      contentType: file.type,
    })
  } catch (error) {
    console.error('Photo upload error:', error)
    return c.json({ error: 'Upload failed' }, 500)
  }
})

// ============================================================================
// DELETE /api/photos/:key+ - Delete a photo from R2
// ============================================================================

photos.delete('/*', async (c) => {
  try {
    const { bucket } = getR2Config(c.env)

    // The key is the full path after /api/photos/
    const url = new URL(c.req.url)
    const key = url.pathname.replace('/api/photos/', '')

    if (!key || key === '/') {
      return c.json({ error: 'No photo key provided' }, 400)
    }

    await bucket.delete(key)

    return c.json({ success: true })
  } catch (error) {
    console.error('Photo delete error:', error)
    return c.json({ error: 'Delete failed' }, 500)
  }
})

// ============================================================================
// GET /api/photos/list/:jobId - List all photos for a cleaning job
// ============================================================================

photos.get('/list/:jobId', async (c) => {
  try {
    const { bucket, publicUrl } = getR2Config(c.env)
    const jobId = c.req.param('jobId')

    const listed = await bucket.list({
      prefix: `cleaning/${jobId}/`,
    })

    const photoList = listed.objects.map((obj) => ({
      key: obj.key,
      url: `${publicUrl}/${obj.key}`,
      size: obj.size,
      uploaded: obj.uploaded.toISOString(),
      type: obj.key.includes('/before/') ? 'before' : 'after',
      contentType: obj.httpMetadata?.contentType || 'image/jpeg',
    }))

    return c.json({
      data: photoList,
      count: photoList.length,
    })
  } catch (error) {
    console.error('Photo list error:', error)
    return c.json({ error: 'Failed to list photos' }, 500)
  }
})

export default photos
