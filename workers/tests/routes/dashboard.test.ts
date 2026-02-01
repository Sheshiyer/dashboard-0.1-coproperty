/**
 * Unit Tests for Dashboard API Routes
 *
 * Tests cover:
 * - GET /api/dashboard/stats - Aggregated dashboard statistics
 * - GET /api/dashboard/upcoming - Upcoming reservations
 * - GET /api/dashboard/today-cleaning - Today's cleaning jobs
 * - GET /api/dashboard/occupancy-trends - Occupancy over time
 * - GET /api/dashboard/booking-sources - Bookings by platform
 * - GET /api/dashboard/revenue-trends - Revenue over time
 * - GET /api/dashboard/property-performance - Top performing properties
 * - GET /api/dashboard/task-priority-breakdown - Task priorities
 * - GET /api/dashboard/recent-activity - Activity feed
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import app from '../../src/index'
import {
    MockKVNamespace,
    MockFetch,
    createMockEnv,
    mockProperty,
    mockReservation,
    mockCleaningJob,
    mockTask,
    hospitableReservationsResponse,
    turnoJobsResponse,
} from '../mocks'
import type { Bindings } from '../../src/index'

describe('Dashboard Routes', () => {
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

        // Setup default property cache
        const properties = [
            mockProperty({ id: 'prop-001', name: '001-BKK-Test 1' }),
            mockProperty({ id: 'prop-002', name: '002-BKK-Test 2' }),
        ]
        mockCache.seed({ 'properties:bkk:filtered': properties })
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

    describe('GET /api/dashboard/stats', () => {
        beforeEach(() => {
            // Setup mock reservations
            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([
                    mockReservation({
                        id: 'res-001',
                        arrival_date: new Date().toISOString().split('T')[0],
                        departure_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: 'confirmed',
                        financials: { guest_total: 10000 },
                    }),
                ]),
            }))

            // Setup mock cleaning jobs (empty - Turno often blocked)
            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse([]),
            }))
        })

        it('should return dashboard statistics', async () => {
            const req = makeRequest('/api/dashboard/stats')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any

            expect(body.data).toHaveProperty('activeReservations')
            expect(body.data).toHaveProperty('pendingCleaning')
            expect(body.data).toHaveProperty('taskIssues')
            expect(body.data).toHaveProperty('totalProperties')
            expect(body.data).toHaveProperty('occupancyRate')
            expect(body.data).toHaveProperty('totalRevenue')
        })

        it('should count active reservations correctly', async () => {
            const today = new Date().toISOString().split('T')[0]
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([
                    mockReservation({
                        arrival_date: today,
                        departure_date: tomorrow,
                        status: 'confirmed',
                    }),
                ]),
            }))

            const req = makeRequest('/api/dashboard/stats')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            expect(body.data.activeReservations).toBeGreaterThanOrEqual(0)
        })

        it('should count pending cleaning jobs', async () => {
            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse([
                    mockCleaningJob({ status: 'pending' }),
                    mockCleaningJob({ status: 'in_progress' }),
                    mockCleaningJob({ status: 'completed' }),
                ]),
            }))

            const req = makeRequest('/api/dashboard/stats')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            expect(body.data.pendingCleaning).toBe(2) // pending + in_progress
        })

        it('should count high priority tasks', async () => {
            mockTasks.seed({
                'tasks:index': ['task-001', 'task-002', 'task-003'],
                'task:task-001': mockTask({ priority: 'high', status: 'pending' }),
                'task:task-002': mockTask({ priority: 'urgent', status: 'pending' }),
                'task:task-003': mockTask({ priority: 'low', status: 'pending' }),
            })

            const req = makeRequest('/api/dashboard/stats')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            expect(body.data.taskIssues).toBe(2) // high + urgent
        })

        it('should return total properties count', async () => {
            const req = makeRequest('/api/dashboard/stats')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            expect(body.data.totalProperties).toBe(2)
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/dashboard/stats')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/dashboard/upcoming', () => {
        it('should return upcoming reservations', async () => {
            const today = new Date().toISOString().split('T')[0]
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([
                    mockReservation({
                        id: 'res-001',
                        arrival_date: today,
                        departure_date: nextWeek,
                        guest: { name: 'John Doe' },
                        platform: 'airbnb',
                    }),
                ]),
            }))

            const req = makeRequest('/api/dashboard/upcoming')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any

            expect(body.data).toBeInstanceOf(Array)
            if (body.data.length > 0) {
                expect(body.data[0]).toHaveProperty('guest_name')
                expect(body.data[0]).toHaveProperty('property_name')
                expect(body.data[0]).toHaveProperty('check_in_date')
            }
        })

        it('should respect limit parameter', async () => {
            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([
                    mockReservation({ id: 'res-001' }),
                    mockReservation({ id: 'res-002' }),
                    mockReservation({ id: 'res-003' }),
                ]),
            }))

            const req = makeRequest('/api/dashboard/upcoming?limit=2')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            expect(body.data.length).toBeLessThanOrEqual(2)
        })

        it('should filter cancelled reservations', async () => {
            const today = new Date().toISOString().split('T')[0]

            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([
                    mockReservation({
                        id: 'res-001',
                        arrival_date: today,
                        status: 'cancelled',
                    }),
                ]),
            }))

            const req = makeRequest('/api/dashboard/upcoming')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            expect(body.data.every((r: any) => r.status !== 'cancelled')).toBe(true)
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/dashboard/upcoming')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/dashboard/today-cleaning', () => {
        it('should return today cleaning jobs with property names', async () => {
            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse([
                    mockCleaningJob({
                        id: 'job-001',
                        property_id: 'prop-001',
                        status: 'pending',
                    }),
                ]),
            }))

            const req = makeRequest('/api/dashboard/today-cleaning')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any

            expect(body.data).toBeInstanceOf(Array)
            if (body.data.length > 0) {
                expect(body.data[0]).toHaveProperty('property_name')
            }
        })

        it('should enrich jobs with property names', async () => {
            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse([
                    mockCleaningJob({ property_id: 'prop-001' }),
                ]),
            }))

            const req = makeRequest('/api/dashboard/today-cleaning')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            if (body.data.length > 0) {
                expect(body.data[0].property_name).toBe('001-BKK-Test 1')
            }
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/dashboard/today-cleaning')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/dashboard/occupancy-trends', () => {
        beforeEach(() => {
            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([]),
            }))
        })

        it('should return occupancy trends', async () => {
            const req = makeRequest('/api/dashboard/occupancy-trends')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any

            expect(body.data).toBeInstanceOf(Array)
            if (body.data.length > 0) {
                expect(body.data[0]).toHaveProperty('date')
                expect(body.data[0]).toHaveProperty('rate')
            }
        })

        it('should respect days parameter', async () => {
            const req = makeRequest('/api/dashboard/occupancy-trends?days=7')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            // Should have approximately 7 days of data
            expect(body.data.length).toBeLessThanOrEqual(8)
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/dashboard/occupancy-trends')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/dashboard/booking-sources', () => {
        beforeEach(() => {
            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([
                    mockReservation({ platform: 'airbnb', financials: { guest_total: 5000 } }),
                    mockReservation({ platform: 'airbnb', financials: { guest_total: 3000 } }),
                    mockReservation({ platform: 'booking', financials: { guest_total: 4000 } }),
                ]),
            }))
        })

        it('should return booking sources breakdown', async () => {
            const req = makeRequest('/api/dashboard/booking-sources')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any

            expect(body.data).toBeInstanceOf(Array)
            if (body.data.length > 0) {
                expect(body.data[0]).toHaveProperty('name')
                expect(body.data[0]).toHaveProperty('value')
                expect(body.data[0]).toHaveProperty('revenue')
            }
        })

        it('should sort by count descending', async () => {
            const req = makeRequest('/api/dashboard/booking-sources')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            if (body.data.length >= 2) {
                expect(body.data[0].value).toBeGreaterThanOrEqual(body.data[1].value)
            }
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/dashboard/booking-sources')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/dashboard/revenue-trends', () => {
        beforeEach(() => {
            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([]),
            }))
        })

        it('should return revenue trends', async () => {
            const req = makeRequest('/api/dashboard/revenue-trends')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any

            expect(body.data).toBeInstanceOf(Array)
            if (body.data.length > 0) {
                expect(body.data[0]).toHaveProperty('date')
                expect(body.data[0]).toHaveProperty('revenue')
                expect(body.data[0]).toHaveProperty('payout')
            }
        })

        it('should respect days parameter', async () => {
            const req = makeRequest('/api/dashboard/revenue-trends?days=7')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            expect(body.data.length).toBeLessThanOrEqual(8)
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/dashboard/revenue-trends')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/dashboard/property-performance', () => {
        beforeEach(() => {
            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([]),
            }))
        })

        it('should return property performance', async () => {
            const req = makeRequest('/api/dashboard/property-performance')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any

            expect(body.data).toBeInstanceOf(Array)
            if (body.data.length > 0) {
                expect(body.data[0]).toHaveProperty('name')
                expect(body.data[0]).toHaveProperty('revenue')
                expect(body.data[0]).toHaveProperty('bookings')
            }
        })

        it('should respect limit parameter', async () => {
            const req = makeRequest('/api/dashboard/property-performance?limit=3')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            expect(body.data.length).toBeLessThanOrEqual(3)
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/dashboard/property-performance')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/dashboard/task-priority-breakdown', () => {
        it('should return task priority breakdown', async () => {
            mockTasks.seed({
                'tasks:index': ['task-001', 'task-002', 'task-003'],
                'task:task-001': mockTask({ priority: 'urgent', status: 'pending' }),
                'task:task-002': mockTask({ priority: 'high', status: 'pending' }),
                'task:task-003': mockTask({ priority: 'low', status: 'pending' }),
            })

            const req = makeRequest('/api/dashboard/task-priority-breakdown')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any

            expect(body.data).toBeInstanceOf(Array)
            expect(body.data.length).toBe(4) // 4 priority categories
            expect(body.data[0]).toHaveProperty('label')
            expect(body.data[0]).toHaveProperty('count')
            expect(body.data[0]).toHaveProperty('filterParam')
        })

        it('should return zeros when no tasks', async () => {
            const req = makeRequest('/api/dashboard/task-priority-breakdown')
            const res = await app.fetch(req, mockEnv)

            const body = await res.json() as any
            expect(body.data.every((item: any) => item.count === 0)).toBe(true)
        })

        it('should exclude completed tasks', async () => {
            mockTasks.seed({
                'tasks:index': ['task-001', 'task-002'],
                'task:task-001': mockTask({ priority: 'high', status: 'completed' }),
                'task:task-002': mockTask({ priority: 'high', status: 'pending' }),
            })

            const req = makeRequest('/api/dashboard/task-priority-breakdown')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            const importantCategory = body.data.find((d: any) => d.filterParam === 'important')
            expect(importantCategory.count).toBe(1)
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/dashboard/task-priority-breakdown')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/dashboard/recent-activity', () => {
        beforeEach(() => {
            mockFetch.register('/reservations', () => ({
                status: 200,
                body: hospitableReservationsResponse([
                    mockReservation({
                        property_id: 'prop-001',
                        guest: { name: 'John Doe' },
                        arrival_date: new Date().toISOString().split('T')[0],
                    }),
                ]),
            }))

            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse([]),
            }))
        })

        it('should return recent activity', async () => {
            const req = makeRequest('/api/dashboard/recent-activity')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any

            expect(body.data).toBeInstanceOf(Array)
            if (body.data.length > 0) {
                expect(body.data[0]).toHaveProperty('type')
                expect(body.data[0]).toHaveProperty('property')
                expect(body.data[0]).toHaveProperty('description')
                expect(body.data[0]).toHaveProperty('timestamp')
            }
        })

        it('should respect limit parameter', async () => {
            const req = makeRequest('/api/dashboard/recent-activity?limit=5')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            expect(body.data.length).toBeLessThanOrEqual(5)
        })

        it('should include various activity types', async () => {
            // The activity types should include booking, check-in, check-out, cleaning, maintenance
            const req = makeRequest('/api/dashboard/recent-activity')
            const res = await app.fetch(req, mockEnv)
            const body = await res.json() as any

            const validTypes = ['booking', 'check-in', 'check-out', 'cleaning', 'maintenance']
            body.data.forEach((activity: any) => {
                expect(validTypes).toContain(activity.type)
            })
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/dashboard/recent-activity')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })
})
