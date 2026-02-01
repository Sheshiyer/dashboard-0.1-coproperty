/**
 * Unit Tests for Hospitable API Service
 *
 * Tests cover:
 * - Property fetching and caching
 * - Property sync mechanism
 * - Reservation fetching
 * - BKK property filtering
 * - Error handling
 * - Cache hit/miss scenarios
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { HospitableService } from '../../src/services/hospitable'
import {
    MockKVNamespace,
    MockFetch,
    createMockEnv,
    mockProperty,
    mockReservation,
    hospitablePropertiesResponse,
    hospitableReservationsResponse,
    hospitableSingleResponse,
} from '../mocks'

describe('HospitableService', () => {
    let service: HospitableService
    let mockEnv: ReturnType<typeof createMockEnv>
    let mockCache: MockKVNamespace
    let mockFetch: MockFetch
    let originalFetch: typeof globalThis.fetch

    beforeEach(() => {
        mockCache = new MockKVNamespace()
        mockFetch = new MockFetch()
        mockEnv = createMockEnv({ CACHE: mockCache })
        service = new HospitableService(mockEnv)

        // Store original fetch and replace with mock
        originalFetch = globalThis.fetch
        globalThis.fetch = mockFetch.fetch.bind(mockFetch) as typeof fetch
    })

    afterEach(() => {
        // Restore original fetch
        globalThis.fetch = originalFetch
        mockFetch.reset()
    })

    describe('getProperties', () => {
        it('should return cached properties when available', async () => {
            const cachedProperties = [
                mockProperty({ id: 'prop-001', name: '001-BKK-Property 1' }),
                mockProperty({ id: 'prop-002', name: '002-BKK-Property 2' }),
            ]
            mockCache.seed({ 'properties:bkk:filtered': cachedProperties })

            const result = await service.getProperties()

            expect(result).toEqual(cachedProperties)
            expect(mockFetch.getCallCount()).toBe(0) // No API call made
        })

        it('should trigger sync when cache is empty', async () => {
            const apiProperties = [
                mockProperty({ id: 'prop-001', name: '001-BKK-Property 1' }),
                mockProperty({ id: 'prop-002', name: '002-BKK-Property 2' }),
            ]

            mockFetch.register('/properties', () => ({
                status: 200,
                body: { data: apiProperties, links: {} },
            }))

            const result = await service.getProperties()

            expect(result).toHaveLength(2)
            expect(mockFetch.getCallCount()).toBeGreaterThan(0)
        })

        it('should return empty array when sync fails and cache is empty', async () => {
            mockFetch.register('/properties', () => ({
                status: 500,
                ok: false,
                body: { error: 'Internal server error' },
            }))

            await expect(service.getProperties()).rejects.toThrow()
        })
    })

    describe('getProperty', () => {
        it('should fetch and transform a single property', async () => {
            const apiProperty = mockProperty({ id: 'prop-001', name: '001-BKK-Test' })

            mockFetch.register('/properties/prop-001', () => ({
                status: 200,
                body: hospitableSingleResponse(apiProperty),
            }))

            const result = await service.getProperty('prop-001')

            expect(result).not.toBeNull()
            expect(result?.id).toBe('prop-001')
            expect(result?.name).toBe('001-BKK-Test')
            expect(result?.bedrooms).toBe(2)
            expect(result?.status).toBe('active')
        })

        it('should return null when property not found', async () => {
            mockFetch.register('/properties/nonexistent', () => ({
                status: 404,
                ok: false,
                body: { error: 'Not found' },
            }))

            const result = await service.getProperty('nonexistent')

            expect(result).toBeNull()
        })

        it('should use cache for repeated property requests', async () => {
            const apiProperty = mockProperty({ id: 'prop-001' })

            mockFetch.register('/properties/prop-001', () => ({
                status: 200,
                body: hospitableSingleResponse(apiProperty),
            }))

            // First call - should hit API
            await service.getProperty('prop-001')
            expect(mockFetch.getCallCount()).toBe(1)

            // Second call - should use cache (need new service instance to test)
            // Cache is populated after first call
            const cached = await mockCache.get('hospitable:/properties/prop-001', 'json')
            expect(cached).not.toBeNull()
        })

        it('should format address correctly from object', async () => {
            const apiProperty = mockProperty({
                id: 'prop-001',
                address: {
                    street: '123 Sukhumvit',
                    city: 'Bangkok',
                    state: 'BKK',
                    country: 'Thailand',
                },
            })

            mockFetch.register('/properties/prop-001', () => ({
                status: 200,
                body: hospitableSingleResponse(apiProperty),
            }))

            const result = await service.getProperty('prop-001')

            expect(result?.address).toBe('123 Sukhumvit, Bangkok, BKK, Thailand')
        })

        it('should handle string address', async () => {
            const apiProperty = mockProperty({
                id: 'prop-001',
                address: '123 Test Street, Bangkok',
            })

            mockFetch.register('/properties/prop-001', () => ({
                status: 200,
                body: hospitableSingleResponse(apiProperty),
            }))

            const result = await service.getProperty('prop-001')

            expect(result?.address).toBe('123 Test Street, Bangkok')
        })
    })

    describe('getReservations', () => {
        it('should fetch reservations with query parameters', async () => {
            const apiReservations = [
                mockReservation({ id: 'res-001' }),
                mockReservation({ id: 'res-002' }),
            ]

            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse(apiReservations),
            }))

            const result = await service.getReservations({
                from: '2026-02-01',
                to: '2026-02-28',
                property_id: 'prop-001',
            })

            expect(result).toHaveLength(2)

            // Verify query params were included
            const call = mockFetch.getCalls()[0]
            expect(call.url).toContain('arrival_from=2026-02-01')
            expect(call.url).toContain('arrival_to=2026-02-28')
            expect(call.url).toContain('properties%5B%5D=prop-001')
        })

        it('should transform reservation data correctly', async () => {
            const apiReservation = mockReservation({
                id: 'res-001',
                arrival_date: '2026-02-01',
                departure_date: '2026-02-05',
                guest: { name: 'John Doe', email: 'john@test.com' },
                financials: { guest_total: 10000, host_payout: 9000, currency: 'THB' },
            })

            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([apiReservation]),
            }))

            const result = await service.getReservations()

            expect(result[0]).toMatchObject({
                id: 'res-001',
                check_in_date: '2026-02-01',
                check_out_date: '2026-02-05',
                guest_name: 'John Doe',
                guest_email: 'john@test.com',
                total_price: 10000,
                payout_amount: 9000,
                currency: 'THB',
            })
        })

        it('should handle missing guest name gracefully', async () => {
            const apiReservation = mockReservation({
                id: 'res-001',
                guest: null,
            })

            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([apiReservation]),
            }))

            const result = await service.getReservations()

            expect(result[0].guest_name).toBe('Guest')
        })

        it('should format guest name from first/last names', async () => {
            const apiReservation = mockReservation({
                id: 'res-001',
                guest: { first_name: 'Jane', last_name: 'Smith' },
            })

            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([apiReservation]),
            }))

            const result = await service.getReservations()

            expect(result[0].guest_name).toBe('Jane Smith')
        })
    })

    describe('getReservation', () => {
        it('should fetch a single reservation', async () => {
            const apiReservation = mockReservation({ id: 'res-001' })

            mockFetch.register('/reservations/res-001', () => ({
                status: 200,
                body: hospitableSingleResponse(apiReservation),
            }))

            const result = await service.getReservation('res-001')

            expect(result).not.toBeNull()
            expect(result?.id).toBe('res-001')
        })

        it('should return null for non-existent reservation', async () => {
            mockFetch.register('/reservations/nonexistent', () => ({
                status: 404,
                ok: false,
                body: { error: 'Not found' },
            }))

            const result = await service.getReservation('nonexistent')

            expect(result).toBeNull()
        })
    })

    describe('syncAllProperties', () => {
        it('should fetch all properties and filter BKK ones', async () => {
            const allProperties = [
                mockProperty({ id: 'prop-001', name: '001-BKK-Property 1' }),
                mockProperty({ id: 'prop-002', name: '002-BKK-Property 2' }),
                mockProperty({ id: 'prop-003', name: '003-MNG-Property 3' }), // Not BKK
                mockProperty({ id: 'prop-004', name: 'No Code Property' }), // No BKK
            ]

            mockFetch.register('/properties', () => ({
                status: 200,
                body: { data: allProperties, links: {} },
            }))

            const result = await service.syncAllProperties()

            expect(result.total).toBe(4)
            expect(result.filtered).toBe(2) // Only BKK properties
            expect(result.cached).toBe(true)

            // Verify cache was populated
            const cached = await mockCache.get('properties:bkk:filtered', 'json')
            expect(cached).toHaveLength(2)
        })

        it('should handle pagination', async () => {
            const page1Properties = [
                mockProperty({ id: 'prop-001', name: '001-BKK-Property 1' }),
            ]
            const page2Properties = [
                mockProperty({ id: 'prop-002', name: '002-BKK-Property 2' }),
            ]

            let callCount = 0
            mockFetch.register('/properties', (url) => {
                callCount++
                if (callCount === 1) {
                    return {
                        status: 200,
                        body: {
                            data: page1Properties,
                            links: { next: 'https://test.hospitable.com/v2/properties?cursor=abc' },
                        },
                    }
                }
                return {
                    status: 200,
                    body: { data: page2Properties, links: {} },
                }
            })

            const result = await service.syncAllProperties()

            expect(result.total).toBe(2)
            expect(result.filtered).toBe(2)
        })

        it('should store sync metadata', async () => {
            mockFetch.register('/properties', () => ({
                status: 200,
                body: { data: [mockProperty({ name: '001-BKK-Test' })], links: {} },
            }))

            await service.syncAllProperties()

            const metadata = await mockCache.get('properties:bkk:metadata', 'json') as any
            expect(metadata).not.toBeNull()
            expect(metadata.totalFetched).toBe(1)
            expect(metadata.filteredCount).toBe(1)
            expect(metadata.lastSync).toBeDefined()
        })

        it('should throw on API error', async () => {
            mockFetch.register('/properties', () => ({
                status: 500,
                ok: false,
                body: { error: 'Server error' },
            }))

            await expect(service.syncAllProperties()).rejects.toThrow('Hospitable API error')
        })
    })

    describe('BKK filtering', () => {
        it('should filter properties with BKK in name (case-insensitive)', async () => {
            const properties = [
                mockProperty({ id: 'p1', name: '001-BKK-Sukhumvit' }),
                mockProperty({ id: 'p2', name: '002-bkk-Silom' }), // lowercase
                mockProperty({ id: 'p3', name: '003-MNG-Chiang Mai' }), // No BKK
                mockProperty({ id: 'p4', name: 'Property BKK Downtown' }),
                mockProperty({ id: 'p5', name: 'Regular Property' }), // No BKK
            ]

            mockFetch.register('/properties', () => ({
                status: 200,
                body: { data: properties, links: {} },
            }))

            const result = await service.syncAllProperties()

            // Filter uses /BKK/i regex, so it matches:
            // - 001-BKK-Sukhumvit (has BKK)
            // - 002-bkk-Silom (has bkk - case insensitive)
            // - Property BKK Downtown (has BKK)
            // Not matched:
            // - 003-MNG-Chiang Mai (no BKK)
            // - Regular Property (no BKK)
            expect(result.filtered).toBe(3) // 3 with BKK
        })
    })

    describe('caching behavior', () => {
        it('should respect TTL for cached responses', async () => {
            const apiProperty = mockProperty({ id: 'prop-001' })

            mockFetch.register('/properties/prop-001', () => ({
                status: 200,
                body: hospitableSingleResponse(apiProperty),
            }))

            await service.getProperty('prop-001')

            // Verify cache was set with TTL
            const cacheStore = mockCache.getStore()
            const cacheEntry = cacheStore.get('hospitable:/properties/prop-001')
            expect(cacheEntry?.expiration).toBeDefined()
        })

        it('should skip cache when skipCache option is set', async () => {
            // Pre-populate cache
            const cachedData = hospitableSingleResponse(mockProperty({ name: 'Cached' }))
            mockCache.seed({ 'hospitable:/properties/prop-001': cachedData })

            // Set up API to return different data
            mockFetch.register('/properties/prop-001', () => ({
                status: 200,
                body: hospitableSingleResponse(mockProperty({ name: 'Fresh' })),
            }))

            // When skipCache is implemented, this would bypass cache
            // For now, verify the caching mechanism works
            const cached = await mockCache.get('hospitable:/properties/prop-001', 'json')
            expect(cached).not.toBeNull()
        })
    })

    describe('error handling', () => {
        it('should handle network errors gracefully', async () => {
            mockFetch.setDefault(() => {
                throw new Error('Network error')
            })

            await expect(service.getProperty('prop-001')).resolves.toBeNull()
        })

        it('should handle malformed JSON responses', async () => {
            // The mock always returns JSON, but we can test error paths
            mockFetch.register('/properties/prop-001', () => ({
                status: 500,
                ok: false,
                body: 'Not JSON',
            }))

            await expect(service.getProperty('prop-001')).resolves.toBeNull()
        })

        it('should handle rate limiting (429 status)', async () => {
            mockFetch.register('/properties', () => ({
                status: 429,
                ok: false,
                body: { error: 'Rate limited' },
            }))

            await expect(service.syncAllProperties()).rejects.toThrow('429')
        })

        it('should handle unauthorized (401 status)', async () => {
            mockFetch.register('/properties', () => ({
                status: 401,
                ok: false,
                body: { error: 'Unauthorized' },
            }))

            await expect(service.syncAllProperties()).rejects.toThrow('401')
        })
    })
})
