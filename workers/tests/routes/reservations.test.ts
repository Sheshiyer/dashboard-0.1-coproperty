/**
 * Unit Tests for Reservations API Routes
 *
 * Tests cover:
 * - GET /api/reservations - List reservations with filters
 * - GET /api/reservations/:id - Get single reservation
 * - Batch fetching for all properties
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import app from '../../src/index'
import {
    MockKVNamespace,
    MockFetch,
    createMockEnv,
    mockProperty,
    mockReservation,
    hospitableReservationsResponse,
    hospitableSingleResponse,
} from '../mocks'
import type { Bindings } from '../../src/index'

describe('Reservations Routes', () => {
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

    describe('GET /api/reservations', () => {
        it('should return reservations for specific property', async () => {
            const reservations = [
                mockReservation({ id: 'res-001', property_id: 'prop-001' }),
                mockReservation({ id: 'res-002', property_id: 'prop-001' }),
            ]

            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse(reservations),
            }))

            const req = makeRequest('/api/reservations?property_id=prop-001')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data).toHaveLength(2)
            expect(body.count).toBe(2)
        })

        it('should fetch reservations for all properties when no property_id', async () => {
            const properties = [
                mockProperty({ id: 'prop-001', name: '001-BKK-Test 1' }),
                mockProperty({ id: 'prop-002', name: '002-BKK-Test 2' }),
            ]
            mockCache.seed({ 'properties:bkk:filtered': properties })

            const res1 = [mockReservation({ id: 'res-001' })]
            const res2 = [mockReservation({ id: 'res-002' })]

            let callCount = 0
            mockFetch.register('/reservations', (url) => {
                callCount++
                if (url.includes('prop-001')) {
                    return { status: 200, body: hospitableReservationsResponse(res1) }
                }
                return { status: 200, body: hospitableReservationsResponse(res2) }
            })

            const req = makeRequest('/api/reservations')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data).toHaveLength(2)
        })

        it('should apply date filters', async () => {
            const reservations = [mockReservation({ id: 'res-001' })]

            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse(reservations),
            }))

            const req = makeRequest('/api/reservations?from=2026-02-01&to=2026-02-28&property_id=prop-001')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)

            const call = mockFetch.getCalls()[0]
            expect(call.url).toContain('arrival_from=2026-02-01')
            expect(call.url).toContain('arrival_to=2026-02-28')
        })

        it('should handle API errors gracefully for individual properties', async () => {
            const properties = [
                mockProperty({ id: 'prop-001', name: '001-BKK-Test 1' }),
                mockProperty({ id: 'prop-002', name: '002-BKK-Test 2' }),
            ]
            mockCache.seed({ 'properties:bkk:filtered': properties })

            mockFetch.register('/reservations', (url) => {
                if (url.includes('prop-001')) {
                    return { status: 500, ok: false, body: { error: 'Error' } }
                }
                return {
                    status: 200,
                    body: hospitableReservationsResponse([mockReservation({ id: 'res-002' })]),
                }
            })

            const req = makeRequest('/api/reservations')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            // Should still return reservations from prop-002
            expect(body.data).toHaveLength(1)
        })

        it('should return 500 on complete failure', async () => {
            // No properties cached and API fails
            mockFetch.register('/properties', () => ({
                status: 500,
                ok: false,
                body: { error: 'Server error' },
            }))

            const req = makeRequest('/api/reservations')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(500)
            const body = await res.json() as any
            expect(body.error).toBe('Failed to fetch reservations')
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/reservations')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/reservations/:id', () => {
        it('should return a single reservation', async () => {
            const reservation = mockReservation({
                id: 'res-001',
                arrival_date: '2026-02-01',
                departure_date: '2026-02-05',
                guest: { name: 'John Doe' },
            })

            mockFetch.register('/reservations/res-001', () => ({
                status: 200,
                body: hospitableSingleResponse(reservation),
            }))

            const req = makeRequest('/api/reservations/res-001')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data.id).toBe('res-001')
            expect(body.data.guest_name).toBe('John Doe')
        })

        it('should return 404 for non-existent reservation', async () => {
            mockFetch.register('/reservations/nonexistent', () => ({
                status: 404,
                ok: false,
                body: { error: 'Not found' },
            }))

            const req = makeRequest('/api/reservations/nonexistent')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(404)
            const body = await res.json() as any
            expect(body.error).toBe('Reservation not found')
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/reservations/res-001')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('batch processing', () => {
        it('should process properties in batches of 10', async () => {
            // Create 25 properties to test batching
            const properties = Array.from({ length: 25 }, (_, i) =>
                mockProperty({ id: `prop-${i.toString().padStart(3, '0')}`, name: `00${i}-BKK-Test` })
            )
            mockCache.seed({ 'properties:bkk:filtered': properties })

            const reservations = [mockReservation()]
            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse(reservations),
            }))

            const req = makeRequest('/api/reservations')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)

            // Should have made calls for all 25 properties
            // (25 calls, processed in batches of 10)
            expect(mockFetch.getCallCount()).toBe(25)
        })
    })

    describe('response format', () => {
        it('should include data wrapper and count', async () => {
            const reservations = [mockReservation()]

            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse(reservations),
            }))

            const req = makeRequest('/api/reservations?property_id=prop-001')
            const res = await app.fetch(req, mockEnv)

            const body = await res.json() as any
            expect(body).toHaveProperty('data')
            expect(body).toHaveProperty('count')
            expect(body.count).toBe(1)
        })

        it('should transform reservation data correctly', async () => {
            const reservation = mockReservation({
                id: 'res-001',
                code: 'ABC123',
                platform: 'Airbnb',
                arrival_date: '2026-02-01',
                departure_date: '2026-02-05',
                guest: { name: 'Jane Doe', email: 'jane@test.com', phone: '+123' },
                guests_count: 3,
                financials: { guest_total: 10000, host_payout: 9000, currency: 'THB' },
                status: 'confirmed',
            })

            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([reservation]),
            }))

            const req = makeRequest('/api/reservations?property_id=prop-001')
            const res = await app.fetch(req, mockEnv)

            const body = await res.json() as any
            const data = body.data[0]

            expect(data.confirmation_code).toBe('ABC123')
            expect(data.platform).toBe('airbnb') // lowercased
            expect(data.check_in_date).toBe('2026-02-01')
            expect(data.check_out_date).toBe('2026-02-05')
            expect(data.guest_name).toBe('Jane Doe')
            expect(data.guest_email).toBe('jane@test.com')
            expect(data.guest_phone).toBe('+123')
            expect(data.guest_count).toBe(3)
            expect(data.total_price).toBe(10000)
            expect(data.payout_amount).toBe(9000)
            expect(data.currency).toBe('THB')
            expect(data.status).toBe('confirmed')
        })
    })
})
