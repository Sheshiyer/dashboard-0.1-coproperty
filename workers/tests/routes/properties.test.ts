/**
 * Unit Tests for Properties API Routes
 *
 * Tests cover:
 * - GET /api/properties - List all properties
 * - GET /api/properties/:id - Get single property
 * - POST /api/properties/sync - Manual sync trigger
 * - GET /api/properties/metadata - Get sync metadata
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import app from '../../src/index'
import {
    MockKVNamespace,
    MockFetch,
    createMockEnv,
    mockProperty,
    hospitablePropertiesResponse,
    hospitableSingleResponse,
} from '../mocks'
import type { Bindings } from '../../src/index'

describe('Properties Routes', () => {
    let mockEnv: Bindings
    let mockCache: MockKVNamespace
    let mockFetch: MockFetch
    let originalFetch: typeof globalThis.fetch

    beforeEach(() => {
        mockCache = new MockKVNamespace()
        mockFetch = new MockFetch()
        mockEnv = createMockEnv({ CACHE: mockCache })

        originalFetch = globalThis.fetch
        globalThis.fetch = mockFetch.fetch.bind(mockFetch) as typeof fetch
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
        mockFetch.reset()
    })

    const makeRequest = (path: string, options?: RequestInit) => {
        return new Request(`http://localhost${path}`, {
            headers: {
                Authorization: `Bearer ${mockEnv.API_KEY}`,
                'Content-Type': 'application/json',
            },
            ...options,
        })
    }

    describe('GET /api/properties', () => {
        it('should return cached properties', async () => {
            const properties = [
                mockProperty({ id: 'prop-001', name: '001-BKK-Test 1' }),
                mockProperty({ id: 'prop-002', name: '002-BKK-Test 2' }),
            ]
            mockCache.seed({ 'properties:bkk:filtered': properties })

            const req = makeRequest('/api/properties')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data).toHaveLength(2)
            expect(body.count).toBe(2)
        })

        it('should trigger sync when cache is empty', async () => {
            const properties = [mockProperty({ name: '001-BKK-Test' })]

            mockFetch.register('/properties', () => ({
                status: 200,
                body: { data: properties, links: {} },
            }))

            const req = makeRequest('/api/properties')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data).toHaveLength(1)
        })

        it('should return 500 on API error', async () => {
            mockFetch.register('/properties', () => ({
                status: 500,
                ok: false,
                body: { error: 'Server error' },
            }))

            const req = makeRequest('/api/properties')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(500)
            const body = await res.json() as any
            expect(body.error).toBe('Failed to fetch properties')
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/properties')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/properties/:id', () => {
        it('should return a single property', async () => {
            const property = mockProperty({ id: 'prop-001', name: '001-BKK-Test' })

            mockFetch.register('/properties/prop-001', () => ({
                status: 200,
                body: hospitableSingleResponse(property),
            }))

            const req = makeRequest('/api/properties/prop-001')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data.id).toBe('prop-001')
            expect(body.data.name).toBe('001-BKK-Test')
        })

        it('should return 404 for non-existent property', async () => {
            mockFetch.register('/properties/nonexistent', () => ({
                status: 404,
                ok: false,
                body: { error: 'Not found' },
            }))

            const req = makeRequest('/api/properties/nonexistent')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(404)
            const body = await res.json() as any
            expect(body.error).toBe('Property not found')
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/properties/prop-001')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('POST /api/properties/sync', () => {
        it('should trigger property sync', async () => {
            const properties = [
                mockProperty({ id: 'prop-001', name: '001-BKK-Test', nickname: '001-BKK-Test' }),
                mockProperty({ id: 'prop-002', name: '002-BKK-Another', nickname: '002-BKK-Another' }),
                mockProperty({ id: 'prop-003', name: '003-MNG-Chiang Mai', nickname: '003-MNG-Chiang Mai' }), // No BKK
            ]

            mockFetch.register('/properties', () => ({
                status: 200,
                body: { data: properties, links: {} },
            }))

            const req = makeRequest('/api/properties/sync', { method: 'POST' })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.success).toBe(true)
            expect(body.message).toBe('Properties synced successfully')
            expect(body.stats.total).toBe(3)
            expect(body.stats.filtered).toBe(2) // Only BKK properties
            expect(body.stats.cached).toBe(true)
        })

        it('should return 500 on sync failure', async () => {
            mockFetch.register('/properties', () => ({
                status: 500,
                ok: false,
                body: { error: 'API error' },
            }))

            const req = makeRequest('/api/properties/sync', { method: 'POST' })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(500)
            const body = await res.json() as any
            expect(body.success).toBe(false)
            expect(body.error).toBe('Failed to sync properties')
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/properties/sync', {
                method: 'POST',
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/properties/metadata', () => {
        it('should return sync metadata when available', async () => {
            const metadata = {
                lastSync: '2026-01-30T10:00:00Z',
                totalFetched: 100,
                filteredCount: 80,
            }
            mockCache.seed({ 'properties:bkk:metadata': metadata })

            const req = makeRequest('/api/properties/metadata')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data).toEqual(metadata)
        })

        it('should return 404 when no metadata exists', async () => {
            const req = makeRequest('/api/properties/metadata')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(404)
            const body = await res.json() as any
            expect(body.error).toBe('No sync metadata found')
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/properties/metadata')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('response format', () => {
        it('should include data wrapper in responses', async () => {
            const properties = [mockProperty()]
            mockCache.seed({ 'properties:bkk:filtered': properties })

            const req = makeRequest('/api/properties')
            const res = await app.fetch(req, mockEnv)

            const body = await res.json() as any
            expect(body).toHaveProperty('data')
            expect(body).toHaveProperty('count')
        })

        it('should return proper content-type', async () => {
            const properties = [mockProperty()]
            mockCache.seed({ 'properties:bkk:filtered': properties })

            const req = makeRequest('/api/properties')
            const res = await app.fetch(req, mockEnv)

            expect(res.headers.get('content-type')).toContain('application/json')
        })
    })
})
