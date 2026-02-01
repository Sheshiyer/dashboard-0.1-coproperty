/**
 * Unit Tests for Main App (index.ts)
 *
 * Tests cover:
 * - Health check endpoint
 * - Auth verify endpoint
 * - CORS configuration
 * - 404 handler
 * - Error handler
 * - Route mounting
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import app from '../src/index'
import {
    MockKVNamespace,
    MockFetch,
    createMockEnv,
} from './mocks'
import type { Bindings } from '../src/index'

describe('App (index.ts)', () => {
    let mockEnv: Bindings
    let mockCache: MockKVNamespace
    let mockTasks: MockKVNamespace
    let mockFetch: MockFetch
    let originalFetch: typeof globalThis.fetch

    beforeEach(() => {
        mockCache = new MockKVNamespace()
        mockTasks = new MockKVNamespace()
        mockFetch = new MockFetch()
        mockEnv = createMockEnv({ CACHE: mockCache, TASKS: mockTasks })

        originalFetch = globalThis.fetch
        globalThis.fetch = mockFetch.fetch.bind(mockFetch) as typeof fetch
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
        mockFetch.reset()
    })

    describe('GET /api/health', () => {
        it('should return health status without authentication', async () => {
            const req = new Request('http://localhost/api/health')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any

            expect(body.status).toBe('ok')
            expect(body.service).toBe('co-property-api')
            expect(body.timestamp).toBeDefined()
        })

        it('should return valid ISO timestamp', async () => {
            const req = new Request('http://localhost/api/health')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            const timestamp = new Date(body.timestamp)
            expect(timestamp.getTime()).not.toBeNaN()
        })

        it('should work with authentication header', async () => {
            const req = new Request('http://localhost/api/health', {
                headers: {
                    Authorization: `Bearer ${mockEnv.API_KEY}`,
                },
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
        })
    })

    describe('GET /api/auth/verify', () => {
        it('should return authenticated: true with valid API key', async () => {
            const req = new Request('http://localhost/api/auth/verify', {
                headers: {
                    Authorization: `Bearer ${mockEnv.API_KEY}`,
                },
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.authenticated).toBe(true)
        })

        it('should return 401 without authentication', async () => {
            const req = new Request('http://localhost/api/auth/verify')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })

        it('should return 401 with invalid API key', async () => {
            const req = new Request('http://localhost/api/auth/verify', {
                headers: {
                    Authorization: 'Bearer invalid-key',
                },
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('CORS', () => {
        it('should include CORS headers in response', async () => {
            const req = new Request('http://localhost/api/health')
            const res = await app.fetch(req, mockEnv)

            expect(res.headers.get('access-control-allow-origin')).toBe('*')
        })

        it('should handle OPTIONS preflight request', async () => {
            const req = new Request('http://localhost/api/test', {
                method: 'OPTIONS',
                headers: {
                    Origin: 'http://localhost:3000',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type, Authorization',
                },
            })
            const res = await app.fetch(req, mockEnv)

            // Should return 204 or 200 for OPTIONS
            expect([200, 204]).toContain(res.status)
            expect(res.headers.get('access-control-allow-origin')).toBe('*')
            expect(res.headers.get('access-control-allow-methods')).toContain('GET')
            expect(res.headers.get('access-control-allow-methods')).toContain('POST')
        })

        it('should allow specified methods', async () => {
            const req = new Request('http://localhost/api/health', {
                method: 'OPTIONS',
            })
            const res = await app.fetch(req, mockEnv)

            const allowedMethods = res.headers.get('access-control-allow-methods')
            expect(allowedMethods).toContain('GET')
            expect(allowedMethods).toContain('POST')
            expect(allowedMethods).toContain('PATCH')
            expect(allowedMethods).toContain('DELETE')
            expect(allowedMethods).toContain('OPTIONS')
        })

        it('should allow specified headers', async () => {
            const req = new Request('http://localhost/api/health', {
                method: 'OPTIONS',
            })
            const res = await app.fetch(req, mockEnv)

            const allowedHeaders = res.headers.get('access-control-allow-headers')
            expect(allowedHeaders).toContain('Content-Type')
            expect(allowedHeaders).toContain('Authorization')
        })
    })

    describe('404 Handler', () => {
        it('should return 404 for unknown routes', async () => {
            const req = new Request('http://localhost/api/nonexistent-route', {
                headers: {
                    Authorization: `Bearer ${mockEnv.API_KEY}`,
                },
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(404)
            const body = await res.json() as any
            expect(body.error).toBe('Not Found')
        })

        it('should return 404 for unknown non-API routes', async () => {
            const req = new Request('http://localhost/random-path')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(404)
        })
    })

    describe('Route Mounting', () => {
        it('should mount properties routes at /api/properties', async () => {
            mockCache.seed({ 'properties:bkk:filtered': [] })

            const req = new Request('http://localhost/api/properties', {
                headers: { Authorization: `Bearer ${mockEnv.API_KEY}` },
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
        })

        it('should mount reservations routes at /api/reservations', async () => {
            mockCache.seed({ 'properties:bkk:filtered': [] })
            mockFetch.register('/reservations', () => ({
                status: 200,
                body: { data: [] },
            }))

            const req = new Request('http://localhost/api/reservations', {
                headers: { Authorization: `Bearer ${mockEnv.API_KEY}` },
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
        })

        it('should mount cleaning routes at /api/cleaning', async () => {
            mockFetch.register('/jobs', () => ({
                status: 200,
                body: { data: [] },
            }))

            const req = new Request('http://localhost/api/cleaning', {
                headers: { Authorization: `Bearer ${mockEnv.API_KEY}` },
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
        })

        it('should mount tasks routes at /api/tasks', async () => {
            const req = new Request('http://localhost/api/tasks', {
                headers: { Authorization: `Bearer ${mockEnv.API_KEY}` },
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
        })

        it('should mount dashboard routes at /api/dashboard', async () => {
            mockCache.seed({ 'properties:bkk:filtered': [] })
            mockFetch.register('/reservations', () => ({ status: 200, body: { data: [] } }))
            mockFetch.register('/jobs', () => ({ status: 200, body: { data: [] } }))

            const req = new Request('http://localhost/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${mockEnv.API_KEY}` },
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
        })
    })

    describe('Response Format', () => {
        it('should return JSON content type', async () => {
            const req = new Request('http://localhost/api/health')
            const res = await app.fetch(req, mockEnv)

            expect(res.headers.get('content-type')).toContain('application/json')
        })
    })

    describe('API Key Protection', () => {
        const protectedRoutes = [
            '/api/properties',
            '/api/reservations',
            '/api/cleaning',
            '/api/tasks',
            '/api/dashboard/stats',
            '/api/auth/verify',
        ]

        protectedRoutes.forEach((route) => {
            it(`should protect ${route}`, async () => {
                const req = new Request(`http://localhost${route}`)
                const res = await app.fetch(req, mockEnv)

                expect(res.status).toBe(401)
            })
        })

        it('should NOT protect /api/health', async () => {
            const req = new Request('http://localhost/api/health')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
        })
    })
})
