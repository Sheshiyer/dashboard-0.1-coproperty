import { describe, it, expect, beforeEach } from 'vitest'
import app from '../../src/index'
import { createMockEnv, MockR2Bucket } from '../mocks'
import type { Bindings } from '../../src/index'

describe('Photo Routes - /api/photos', () => {
    let env: Bindings
    let r2Bucket: MockR2Bucket

    beforeEach(() => {
        r2Bucket = new MockR2Bucket()
        env = createMockEnv({
            PHOTOS: r2Bucket as unknown as R2Bucket,
            R2_PUBLIC_URL: 'https://test-photos.coproperty.com',
        })
    })

    function createJsonRequest(
        path: string,
        options: { method?: string; body?: Record<string, unknown> } = {}
    ): Request {
        const init: RequestInit = {
            method: options.method || 'GET',
            headers: {
                'Authorization': `Bearer ${env.API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
        if (options.body) {
            init.body = JSON.stringify(options.body)
        }
        return new Request(`http://localhost${path}`, init)
    }

    function createRequest(path: string, method: string = 'GET'): Request {
        return new Request(`http://localhost${path}`, {
            method,
            headers: {
                'Authorization': `Bearer ${env.API_KEY}`,
            },
        })
    }

    // Helper: base64 encode for JSON upload
    function toBase64(str: string): string {
        return btoa(str)
    }

    // ========================================================================
    // POST /api/photos/upload (JSON mode for testability)
    // ========================================================================

    describe('POST /api/photos/upload', () => {
        it('should upload a photo to R2 and return URL', async () => {
            const req = createJsonRequest('/api/photos/upload', {
                method: 'POST',
                body: {
                    filename: 'test-photo.jpg',
                    data: toBase64('fake-image-data'),
                    contentType: 'image/jpeg',
                    jobId: 'job-001',
                    type: 'before',
                },
            })

            const res = await app.fetch(req, env)
            expect(res.status).toBe(200)

            const body = await res.json() as {
                success: boolean
                url: string
                key: string
                filename: string
                size: number
            }
            expect(body.success).toBe(true)
            expect(body.url).toContain('https://test-photos.coproperty.com/')
            expect(body.key).toContain('cleaning/job-001/before/')
            expect(body.filename).toBe('test-photo.jpg')
            expect(body.size).toBeGreaterThan(0)

            // Verify R2 bucket has the file
            const keys = r2Bucket.getKeys()
            expect(keys.length).toBe(1)
            expect(keys[0]).toContain('cleaning/job-001/before/')
        })

        it('should reject upload without jobId', async () => {
            const req = createJsonRequest('/api/photos/upload', {
                method: 'POST',
                body: {
                    filename: 'photo.jpg',
                    data: toBase64('data'),
                    contentType: 'image/jpeg',
                    type: 'before',
                },
            })

            const res = await app.fetch(req, env)
            expect(res.status).toBe(400)

            const body = await res.json() as { error: string }
            expect(body.error).toBe('jobId is required')
        })

        it('should reject upload with invalid type', async () => {
            const req = createJsonRequest('/api/photos/upload', {
                method: 'POST',
                body: {
                    filename: 'photo.jpg',
                    data: toBase64('data'),
                    contentType: 'image/jpeg',
                    jobId: 'job-001',
                    type: 'invalid',
                },
            })

            const res = await app.fetch(req, env)
            expect(res.status).toBe(400)

            const body = await res.json() as { error: string }
            expect(body.error).toContain('type must be')
        })

        it('should organize photos by jobId and type in R2 keys', async () => {
            // Upload before photo
            const req1 = createJsonRequest('/api/photos/upload', {
                method: 'POST',
                body: {
                    filename: 'before.jpg',
                    data: toBase64('data1'),
                    contentType: 'image/jpeg',
                    jobId: 'job-123',
                    type: 'before',
                },
            })
            const res1 = await app.fetch(req1, env)
            expect(res1.status).toBe(200)

            // Upload after photo
            const req2 = createJsonRequest('/api/photos/upload', {
                method: 'POST',
                body: {
                    filename: 'after.jpg',
                    data: toBase64('data2'),
                    contentType: 'image/jpeg',
                    jobId: 'job-123',
                    type: 'after',
                },
            })
            const res2 = await app.fetch(req2, env)
            expect(res2.status).toBe(200)

            const keys = r2Bucket.getKeys()
            expect(keys.length).toBe(2)
            expect(keys.some(k => k.includes('cleaning/job-123/before/'))).toBe(true)
            expect(keys.some(k => k.includes('cleaning/job-123/after/'))).toBe(true)
        })

        it('should store custom metadata with the upload', async () => {
            const req = createJsonRequest('/api/photos/upload', {
                method: 'POST',
                body: {
                    filename: 'test.jpg',
                    data: toBase64('photo-data'),
                    contentType: 'image/jpeg',
                    jobId: 'job-meta',
                    type: 'after',
                },
            })

            await app.fetch(req, env)

            const keys = r2Bucket.getKeys()
            expect(keys.length).toBe(1)

            const stored = r2Bucket.getStore().get(keys[0])
            expect(stored).toBeDefined()
            expect(stored?.customMetadata?.jobId).toBe('job-meta')
            expect(stored?.customMetadata?.type).toBe('after')
            expect(stored?.customMetadata?.originalFilename).toBe('test.jpg')
        })
    })

    // ========================================================================
    // DELETE /api/photos/:key
    // ========================================================================

    describe('DELETE /api/photos/:key', () => {
        it('should delete a photo from R2', async () => {
            // First upload a photo directly to the mock bucket
            const key = 'cleaning/job-001/before/12345-abc.jpg'
            await r2Bucket.put(key, 'fake-image-data')
            expect(r2Bucket.getKeys().length).toBe(1)

            const req = createRequest(`/api/photos/${key}`, 'DELETE')
            const res = await app.fetch(req, env)
            expect(res.status).toBe(200)

            const body = await res.json() as { success: boolean }
            expect(body.success).toBe(true)
            expect(r2Bucket.getKeys().length).toBe(0)
        })
    })

    // ========================================================================
    // GET /api/photos/list/:jobId
    // ========================================================================

    describe('GET /api/photos/list/:jobId', () => {
        it('should list all photos for a job', async () => {
            // Seed some photos
            await r2Bucket.put('cleaning/job-001/before/1-abc.jpg', 'data1', {
                httpMetadata: { contentType: 'image/jpeg' },
            })
            await r2Bucket.put('cleaning/job-001/after/2-def.jpg', 'data2', {
                httpMetadata: { contentType: 'image/jpeg' },
            })
            // Different job - should not appear
            await r2Bucket.put('cleaning/job-002/before/3-ghi.jpg', 'data3', {
                httpMetadata: { contentType: 'image/jpeg' },
            })

            const req = createRequest('/api/photos/list/job-001')
            const res = await app.fetch(req, env)
            expect(res.status).toBe(200)

            const body = await res.json() as {
                data: Array<{
                    key: string
                    url: string
                    type: string
                }>
                count: number
            }
            expect(body.count).toBe(2)
            expect(body.data.length).toBe(2)
            expect(body.data[0].url).toContain('https://test-photos.coproperty.com/')
            expect(body.data.some(p => p.type === 'before')).toBe(true)
            expect(body.data.some(p => p.type === 'after')).toBe(true)
        })

        it('should return empty array for job with no photos', async () => {
            const req = createRequest('/api/photos/list/nonexistent-job')
            const res = await app.fetch(req, env)
            expect(res.status).toBe(200)

            const body = await res.json() as { data: unknown[]; count: number }
            expect(body.count).toBe(0)
            expect(body.data.length).toBe(0)
        })
    })
})
