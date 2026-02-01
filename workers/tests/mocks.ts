/**
 * Test Mocks and Utilities for Workers Unit Tests
 *
 * This file provides mock implementations for:
 * - KV Namespace (Cloudflare Workers KV)
 * - External API responses (Hospitable, Turno)
 * - Environment bindings
 */

import type { Bindings } from '../src/index'

// ============================================================================
// Mock KV Namespace
// ============================================================================

export class MockKVNamespace implements KVNamespace {
    private store: Map<string, { value: string; metadata: any; expiration?: number }> = new Map()

    async get(key: string, options?: any): Promise<any> {
        const item = this.store.get(key)
        if (!item) return null

        // Check expiration
        if (item.expiration && Date.now() / 1000 > item.expiration) {
            this.store.delete(key)
            return null
        }

        if (options === 'json' || options?.type === 'json') {
            try {
                return JSON.parse(item.value)
            } catch {
                return null
            }
        }
        if (options === 'text' || options?.type === 'text') {
            return item.value
        }
        if (options === 'arrayBuffer' || options?.type === 'arrayBuffer') {
            return new TextEncoder().encode(item.value).buffer
        }
        if (options === 'stream' || options?.type === 'stream') {
            return new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode(item.value))
                    controller.close()
                }
            })
        }
        return item.value
    }

    async put(key: string, value: string | ArrayBuffer | ReadableStream, options?: any): Promise<void> {
        let stringValue: string
        if (typeof value === 'string') {
            stringValue = value
        } else if (value instanceof ArrayBuffer) {
            stringValue = new TextDecoder().decode(value)
        } else {
            // Handle ReadableStream
            stringValue = ''
        }

        const expiration = options?.expiration
            ? options.expiration
            : options?.expirationTtl
                ? Math.floor(Date.now() / 1000) + options.expirationTtl
                : undefined

        this.store.set(key, {
            value: stringValue,
            metadata: options?.metadata,
            expiration,
        })
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key)
    }

    async list(options?: any): Promise<KVNamespaceListResult<unknown, string>> {
        const prefix = options?.prefix || ''
        const limit = options?.limit || 1000
        const cursor = options?.cursor || '0'

        const startIndex = parseInt(cursor, 10)
        const keys: KVNamespaceListKey<unknown, string>[] = []

        let count = 0
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                if (count >= startIndex && keys.length < limit) {
                    const item = this.store.get(key)
                    keys.push({
                        name: key,
                        expiration: item?.expiration,
                        metadata: item?.metadata,
                    })
                }
                count++
            }
        }

        const hasMore = count > startIndex + limit
        return {
            keys,
            list_complete: !hasMore,
            cursor: hasMore ? String(startIndex + limit) : undefined,
            cacheStatus: null,
        }
    }

    async getWithMetadata<T = unknown>(key: string, options?: any): Promise<KVNamespaceGetWithMetadataResult<string, T>> {
        const item = this.store.get(key)
        if (!item) {
            return { value: null, metadata: null, cacheStatus: null }
        }

        let value: any = item.value
        if (options === 'json' || options?.type === 'json') {
            try {
                value = JSON.parse(item.value)
            } catch {
                value = null
            }
        }

        return {
            value,
            metadata: item.metadata as T,
            cacheStatus: null,
        }
    }

    // Utility methods for testing
    clear(): void {
        this.store.clear()
    }

    getStore(): Map<string, { value: string; metadata: any; expiration?: number }> {
        return this.store
    }

    // Seed the store with test data
    seed(data: Record<string, any>): void {
        for (const [key, value] of Object.entries(data)) {
            this.store.set(key, {
                value: typeof value === 'string' ? value : JSON.stringify(value),
                metadata: null,
            })
        }
    }
}

// ============================================================================
// Mock Fetch for External APIs
// ============================================================================

export interface MockFetchResponse {
    status?: number
    ok?: boolean
    body?: any
    headers?: Record<string, string>
}

export type MockFetchHandler = (url: string, options?: RequestInit) => MockFetchResponse | Promise<MockFetchResponse>

export class MockFetch {
    private handlers: Map<string, MockFetchHandler> = new Map()
    private defaultHandler: MockFetchHandler | null = null
    private calls: Array<{ url: string; options?: RequestInit }> = []

    register(urlPattern: string | RegExp, handler: MockFetchHandler): void {
        if (urlPattern instanceof RegExp) {
            this.handlers.set(urlPattern.source, handler)
        } else {
            this.handlers.set(urlPattern, handler)
        }
    }

    setDefault(handler: MockFetchHandler): void {
        this.defaultHandler = handler
    }

    async fetch(url: string | URL | Request, options?: RequestInit): Promise<Response> {
        const urlString = url instanceof Request ? url.url : url.toString()
        this.calls.push({ url: urlString, options })

        // Find matching handler
        let handler: MockFetchHandler | undefined

        for (const [pattern, h] of this.handlers) {
            const regex = new RegExp(pattern)
            if (regex.test(urlString) || urlString.includes(pattern)) {
                handler = h
                break
            }
        }

        if (!handler && this.defaultHandler) {
            handler = this.defaultHandler
        }

        if (!handler) {
            throw new Error(`No mock handler for URL: ${urlString}`)
        }

        const result = await handler(urlString, options)

        return new Response(
            result.body !== undefined ? JSON.stringify(result.body) : null,
            {
                status: result.status ?? 200,
                headers: {
                    'Content-Type': 'application/json',
                    ...(result.headers || {}),
                },
            }
        )
    }

    getCalls(): Array<{ url: string; options?: RequestInit }> {
        return this.calls
    }

    getCallCount(): number {
        return this.calls.length
    }

    clear(): void {
        this.calls = []
    }

    reset(): void {
        this.handlers.clear()
        this.defaultHandler = null
        this.calls = []
    }
}

// ============================================================================
// Mock Environment Bindings
// ============================================================================

export function createMockEnv(overrides?: Partial<Bindings>): Bindings {
    return {
        CACHE: new MockKVNamespace(),
        TASKS: new MockKVNamespace(),
        HOSPITABLE_API_TOKEN: 'test-hospitable-token',
        TURNO_API_KEY: 'test-turno-key',
        API_KEY: 'test-api-key',
        HOSPITABLE_BASE_URL: 'https://test.hospitable.com/v2',
        TURNO_BASE_URL: 'https://test.turno.com/v1',
        ...overrides,
    }
}

// ============================================================================
// Test Data Factories
// ============================================================================

export const mockProperty = (overrides?: Partial<any>) => ({
    id: 'prop-001',
    name: '001-BKK-Test Property',
    nickname: '001-BKK-Test Property',
    internal_code: 'BKK001',
    address: {
        street: '123 Test Street',
        city: 'Bangkok',
        state: 'Bangkok',
        country: 'Thailand',
        building: 'Test Building',
        room: '101',
    },
    bedrooms: 2,
    bathrooms: 1,
    guests: { max: 4 },
    max_guests: 4,
    check_in_time: '15:00',
    check_out_time: '11:00',
    status: 'active',
    segment: 'standard',
    picture: 'https://example.com/image.jpg',
    ...overrides,
})

export const mockReservation = (overrides?: Partial<any>) => ({
    id: 'res-001',
    property_id: 'prop-001',
    code: 'ABC123',
    confirmation_code: 'ABC123',
    platform: 'airbnb',
    arrival_date: '2026-02-01',
    departure_date: '2026-02-05',
    check_in_date: '2026-02-01',
    check_out_date: '2026-02-05',
    guest: {
        name: 'John Doe',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
    },
    guests_count: 2,
    guest_count: 2,
    financials: {
        guest_total: 5000,
        host_payout: 4500,
        currency: 'THB',
    },
    total_price: 5000,
    payout_amount: 4500,
    status: 'confirmed',
    special_requests: 'Late check-in requested',
    ...overrides,
})

export const mockCleaningJob = (overrides?: Partial<any>) => ({
    id: 'job-001',
    job_id: 'job-001',
    property_id: 'prop-001',
    property_external_id: 'prop-001',
    reservation_id: 'res-001',
    next_reservation_id: 'res-002',
    date: '2026-02-01',
    scheduled_date: '2026-02-01',
    time: '10:00',
    scheduled_time: '10:00',
    deadline: '14:00',
    deadline_time: '14:00',
    cleaner: {
        name: 'Jane Cleaner',
        phone: '+1987654321',
    },
    cleaner_name: 'Jane Cleaner',
    cleaner_phone: '+1987654321',
    status: 'pending',
    started_at: null,
    completed_at: null,
    verified_at: null,
    checklist_complete: false,
    checklist_completed: false,
    photos_count: 0,
    photo_count: 0,
    issues: [],
    issues_reported: [],
    ...overrides,
})

export const mockTask = (overrides?: Partial<any>) => ({
    id: 'task-001',
    property_id: 'prop-001',
    reservation_id: null,
    title: 'Fix broken lamp',
    description: 'The bedroom lamp is not working',
    category: 'maintenance',
    priority: 'medium',
    status: 'pending',
    assigned_to: null,
    due_date: '2026-02-10',
    completed_at: null,
    created_by: 'system',
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T10:00:00Z',
    ...overrides,
})

// ============================================================================
// API Response Factories
// ============================================================================

export const hospitablePropertiesResponse = (properties: any[] = [mockProperty()]) => ({
    data: properties,
    links: {},
})

export const hospitableReservationsResponse = (reservations: any[] = [mockReservation()]) => ({
    data: reservations,
    links: {},
})

export const hospitableSingleResponse = (item: any) => ({
    data: item,
})

export const turnoJobsResponse = (jobs: any[] = [mockCleaningJob()]) => ({
    data: jobs,
})

export const turnoSingleJobResponse = (job: any) => ({
    data: job,
})
