/**
 * Unit Tests for Authentication Middleware
 *
 * Tests cover:
 * - API key validation
 * - Missing authorization header
 * - Invalid API key
 * - Health check bypass
 * - Bearer token parsing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'
import { authMiddleware } from '../../src/middleware/auth'
import type { Bindings } from '../../src/index'
import { createMockEnv } from '../mocks'

describe('authMiddleware', () => {
    let app: Hono<{ Bindings: Bindings }>
    let mockEnv: ReturnType<typeof createMockEnv>

    beforeEach(() => {
        mockEnv = createMockEnv()

        // Create a test app with the middleware
        app = new Hono<{ Bindings: Bindings }>()
        app.use('*', authMiddleware)

        // Add test endpoints
        app.get('/api/test', (c) => c.json({ success: true }))
        app.get('/api/health', (c) => c.json({ status: 'ok' }))
        app.post('/api/data', (c) => c.json({ created: true }))
    })

    describe('valid authentication', () => {
        it('should allow request with valid API key', async () => {
            const req = new Request('http://localhost/api/test', {
                headers: {
                    Authorization: `Bearer ${mockEnv.API_KEY}`,
                },
            })

            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json()
            expect(body).toEqual({ success: true })
        })

        it('should allow POST request with valid API key', async () => {
            const req = new Request('http://localhost/api/data', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${mockEnv.API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: 'test' }),
            })

            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json()
            expect(body).toEqual({ created: true })
        })
    })

    describe('missing authorization', () => {
        it('should reject request without Authorization header', async () => {
            const req = new Request('http://localhost/api/test')

            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
            const body = await res.json()
            expect(body.error).toBe('Missing Authorization header')
        })

        it('should reject request with empty Authorization header', async () => {
            const req = new Request('http://localhost/api/test', {
                headers: {
                    Authorization: '',
                },
            })

            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('invalid API key', () => {
        it('should reject request with wrong API key', async () => {
            const req = new Request('http://localhost/api/test', {
                headers: {
                    Authorization: 'Bearer wrong-api-key',
                },
            })

            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
            const body = await res.json()
            expect(body.error).toBe('Invalid API key')
        })

        it('should accept request with API key even without Bearer prefix', async () => {
            // Note: The middleware uses simple replace('Bearer ', ''), so if the API key
            // itself is passed without the prefix, and it matches after the replace
            // (which becomes a no-op), it will be accepted
            const req = new Request('http://localhost/api/test', {
                headers: {
                    Authorization: mockEnv.API_KEY, // No "Bearer " prefix, but key matches
                },
            })

            const res = await app.fetch(req, mockEnv)

            // The replace('Bearer ', '') doesn't change the string if it doesn't start with 'Bearer '
            // So the key is compared directly - this matches the actual behavior
            expect(res.status).toBe(200)
        })

        it('should reject request with only Bearer prefix', async () => {
            const req = new Request('http://localhost/api/test', {
                headers: {
                    Authorization: 'Bearer ',
                },
            })

            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('health check bypass', () => {
        it('should allow health check without authentication', async () => {
            const req = new Request('http://localhost/api/health')

            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json()
            expect(body.status).toBe('ok')
        })

        it('should still allow health check with authentication', async () => {
            const req = new Request('http://localhost/api/health', {
                headers: {
                    Authorization: `Bearer ${mockEnv.API_KEY}`,
                },
            })

            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
        })
    })

    describe('Bearer token parsing', () => {
        it('should correctly extract API key from Bearer token', async () => {
            // Test with various whitespace scenarios
            const req = new Request('http://localhost/api/test', {
                headers: {
                    Authorization: `Bearer ${mockEnv.API_KEY}`,
                },
            })

            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
        })

        it('should handle Bearer with extra spaces (edge case)', async () => {
            const req = new Request('http://localhost/api/test', {
                headers: {
                    Authorization: `Bearer  ${mockEnv.API_KEY}`, // Extra space
                },
            })

            const res = await app.fetch(req, mockEnv)

            // The middleware uses simple replace, so this should fail
            expect(res.status).toBe(401)
        })
    })

    describe('path matching', () => {
        it('should protect all /api/* routes except health', async () => {
            const protectedPaths = [
                '/api/test',
                '/api/properties',
                '/api/reservations',
                '/api/cleaning',
                '/api/tasks',
                '/api/dashboard/stats',
            ]

            for (const path of protectedPaths) {
                const req = new Request(`http://localhost${path}`)
                const res = await app.fetch(req, mockEnv)

                // Should be 401 or 404 (if route doesn't exist)
                // We only check that it's not 200 without auth
                if (res.status !== 404) {
                    expect(res.status).toBe(401)
                }
            }
        })
    })

    describe('multiple requests', () => {
        it('should handle multiple sequential requests correctly', async () => {
            // First request - valid
            const req1 = new Request('http://localhost/api/test', {
                headers: { Authorization: `Bearer ${mockEnv.API_KEY}` },
            })
            const res1 = await app.fetch(req1, mockEnv)
            expect(res1.status).toBe(200)

            // Second request - invalid
            const req2 = new Request('http://localhost/api/test', {
                headers: { Authorization: 'Bearer wrong-key' },
            })
            const res2 = await app.fetch(req2, mockEnv)
            expect(res2.status).toBe(401)

            // Third request - no auth
            const req3 = new Request('http://localhost/api/test')
            const res3 = await app.fetch(req3, mockEnv)
            expect(res3.status).toBe(401)

            // Fourth request - valid again
            const req4 = new Request('http://localhost/api/test', {
                headers: { Authorization: `Bearer ${mockEnv.API_KEY}` },
            })
            const res4 = await app.fetch(req4, mockEnv)
            expect(res4.status).toBe(200)
        })
    })

    describe('environment configuration', () => {
        it('should work with different API keys', async () => {
            const customEnv = createMockEnv({ API_KEY: 'custom-secret-key-123' })

            const req = new Request('http://localhost/api/test', {
                headers: { Authorization: 'Bearer custom-secret-key-123' },
            })

            const res = await app.fetch(req, customEnv)

            expect(res.status).toBe(200)
        })

        it('should reject when API_KEY env is empty', async () => {
            const emptyKeyEnv = createMockEnv({ API_KEY: '' })

            const req = new Request('http://localhost/api/test', {
                headers: { Authorization: 'Bearer ' },
            })

            const res = await app.fetch(req, emptyKeyEnv)

            expect(res.status).toBe(401)
        })
    })
})
