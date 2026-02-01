import { describe, it, expect } from 'vitest'
import {
    getR2Config,
    validatePhotoFile,
    generatePhotoKey,
    MAX_PHOTO_SIZE,
    ALLOWED_MIME_TYPES,
} from '../../src/config/r2'
import { MockR2Bucket } from '../mocks'

describe('R2 Configuration', () => {
    describe('getR2Config', () => {
        it('should return bucket and public URL from env', () => {
            const mockBucket = new MockR2Bucket() as unknown as R2Bucket
            const config = getR2Config({
                PHOTOS: mockBucket,
                R2_PUBLIC_URL: 'https://custom-photos.example.com',
            })

            expect(config.bucket).toBe(mockBucket)
            expect(config.publicUrl).toBe('https://custom-photos.example.com')
        })

        it('should use default public URL when not provided', () => {
            const mockBucket = new MockR2Bucket() as unknown as R2Bucket
            const config = getR2Config({
                PHOTOS: mockBucket,
            })

            expect(config.publicUrl).toBe('https://photos.coproperty.com')
        })
    })

    describe('validatePhotoFile', () => {
        it('should accept valid JPEG files', () => {
            const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
            expect(validatePhotoFile(file)).toBeNull()
        })

        it('should accept valid PNG files', () => {
            const file = new File(['data'], 'photo.png', { type: 'image/png' })
            expect(validatePhotoFile(file)).toBeNull()
        })

        it('should accept valid WebP files', () => {
            const file = new File(['data'], 'photo.webp', { type: 'image/webp' })
            expect(validatePhotoFile(file)).toBeNull()
        })

        it('should reject non-image files', () => {
            const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' })
            const error = validatePhotoFile(file)
            expect(error).toBeTruthy()
            expect(error).toContain('Invalid file type')
        })

        it('should reject files exceeding size limit', () => {
            // Create a file that reports as too large
            const largeData = new Uint8Array(MAX_PHOTO_SIZE + 1)
            const file = new File([largeData], 'huge.jpg', { type: 'image/jpeg' })
            const error = validatePhotoFile(file)
            expect(error).toBeTruthy()
            expect(error).toContain('too large')
        })
    })

    describe('generatePhotoKey', () => {
        it('should generate a key with jobId and type prefix', () => {
            const key = generatePhotoKey('job-001', 'before', 'photo.jpg')
            expect(key).toMatch(/^cleaning\/job-001\/before\/\d+-[a-f0-9]+\.jpg$/)
        })

        it('should generate unique keys for same input', () => {
            const key1 = generatePhotoKey('job-001', 'before', 'photo.jpg')
            const key2 = generatePhotoKey('job-001', 'before', 'photo.jpg')
            expect(key1).not.toBe(key2)
        })

        it('should preserve file extension', () => {
            const jpgKey = generatePhotoKey('job-001', 'after', 'photo.jpg')
            const pngKey = generatePhotoKey('job-001', 'after', 'image.png')
            const webpKey = generatePhotoKey('job-001', 'after', 'pic.webp')

            expect(jpgKey).toMatch(/\.jpg$/)
            expect(pngKey).toMatch(/\.png$/)
            expect(webpKey).toMatch(/\.webp$/)
        })

        it('should separate before and after photos', () => {
            const beforeKey = generatePhotoKey('job-001', 'before', 'photo.jpg')
            const afterKey = generatePhotoKey('job-001', 'after', 'photo.jpg')

            expect(beforeKey).toContain('/before/')
            expect(afterKey).toContain('/after/')
        })
    })

    describe('constants', () => {
        it('should have MAX_PHOTO_SIZE at 10MB', () => {
            expect(MAX_PHOTO_SIZE).toBe(10 * 1024 * 1024)
        })

        it('should include standard image types', () => {
            expect(ALLOWED_MIME_TYPES).toContain('image/jpeg')
            expect(ALLOWED_MIME_TYPES).toContain('image/png')
            expect(ALLOWED_MIME_TYPES).toContain('image/webp')
        })
    })
})
