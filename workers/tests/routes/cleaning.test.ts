/**
 * Unit Tests for Cleaning API Routes
 *
 * Tests cover:
 * - GET /api/cleaning - List cleaning jobs with filters
 * - GET /api/cleaning/:id - Get single cleaning job
 * - PATCH /api/cleaning/:id/status - Update job status
 * - Error handling and validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import app from '../../src/index'
import {
    MockKVNamespace,
    MockFetch,
    createMockEnv,
    mockCleaningJob,
    turnoJobsResponse,
    turnoSingleJobResponse,
} from '../mocks'
import type { Bindings } from '../../src/index'

describe('Cleaning Routes', () => {
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

    describe('GET /api/cleaning', () => {
        it('should return cleaning jobs', async () => {
            const jobs = [
                mockCleaningJob({ id: 'job-001', property_id: 'prop-001' }),
                mockCleaningJob({ id: 'job-002', property_id: 'prop-002' }),
            ]

            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse(jobs),
            }))

            const req = makeRequest('/api/cleaning')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data).toHaveLength(2)
            expect(body.count).toBe(2)
        })

        it('should filter by date', async () => {
            const jobs = [mockCleaningJob({ id: 'job-001', date: '2026-02-01' })]

            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse(jobs),
            }))

            const req = makeRequest('/api/cleaning?date=2026-02-01')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)

            const call = mockFetch.getCalls()[0]
            expect(call.url).toContain('date=2026-02-01')
        })

        it('should filter by property_id', async () => {
            const jobs = [mockCleaningJob({ id: 'job-001', property_id: 'prop-001' })]

            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse(jobs),
            }))

            const req = makeRequest('/api/cleaning?property_id=prop-001')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)

            const call = mockFetch.getCalls()[0]
            expect(call.url).toContain('property_id=prop-001')
        })

        it('should filter by status', async () => {
            const jobs = [mockCleaningJob({ id: 'job-001', status: 'pending' })]

            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse(jobs),
            }))

            const req = makeRequest('/api/cleaning?status=pending')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)

            const call = mockFetch.getCalls()[0]
            expect(call.url).toContain('status=pending')
        })

        it('should return empty array on API error', async () => {
            mockFetch.register('/jobs', () => ({
                status: 500,
                ok: false,
                body: { error: 'Server error' },
            }))

            const req = makeRequest('/api/cleaning')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data).toEqual([])
            expect(body.count).toBe(0)
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/cleaning')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/cleaning/:id', () => {
        it('should return a single cleaning job', async () => {
            const job = mockCleaningJob({
                id: 'job-001',
                property_id: 'prop-001',
                date: '2026-02-01',
                time: '10:00',
                status: 'pending',
            })

            mockFetch.register('/jobs/job-001', () => ({
                status: 200,
                body: turnoSingleJobResponse(job),
            }))

            const req = makeRequest('/api/cleaning/job-001')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data.id).toBe('job-001')
            expect(body.data.property_id).toBe('prop-001')
            expect(body.data.status).toBe('pending')
        })

        it('should return 404 for non-existent job', async () => {
            mockFetch.register('/jobs/nonexistent', () => ({
                status: 404,
                ok: false,
                body: { error: 'Not found' },
            }))

            const req = makeRequest('/api/cleaning/nonexistent')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(404)
            const body = await res.json() as any
            expect(body.error).toBe('Cleaning job not found')
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/cleaning/job-001')
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('PATCH /api/cleaning/:id/status', () => {
        it('should update job status to in_progress', async () => {
            const updatedJob = mockCleaningJob({
                id: 'job-001',
                status: 'in_progress',
                started_at: '2026-02-01T10:30:00Z',
            })

            mockFetch.register('/jobs/job-001', () => ({
                status: 200,
                body: turnoSingleJobResponse(updatedJob),
            }))

            const req = makeRequest('/api/cleaning/job-001/status', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'in_progress' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data.status).toBe('in_progress')
        })

        it('should update job status to completed', async () => {
            const updatedJob = mockCleaningJob({
                id: 'job-001',
                status: 'completed',
                completed_at: '2026-02-01T14:00:00Z',
            })

            mockFetch.register('/jobs/job-001', () => ({
                status: 200,
                body: turnoSingleJobResponse(updatedJob),
            }))

            const req = makeRequest('/api/cleaning/job-001/status', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'completed' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data.status).toBe('completed')
        })

        it('should update job status to verified', async () => {
            const updatedJob = mockCleaningJob({
                id: 'job-001',
                status: 'verified',
                verified_at: '2026-02-01T15:00:00Z',
            })

            mockFetch.register('/jobs/job-001', () => ({
                status: 200,
                body: turnoSingleJobResponse(updatedJob),
            }))

            const req = makeRequest('/api/cleaning/job-001/status', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'verified' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(200)
            const body = await res.json() as any
            expect(body.data.status).toBe('verified')
        })

        it('should return 400 when status is missing', async () => {
            const req = makeRequest('/api/cleaning/job-001/status', {
                method: 'PATCH',
                body: JSON.stringify({}),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(400)
            const body = await res.json() as any
            expect(body.error).toBe('Status is required')
        })

        it('should return 400 for invalid status', async () => {
            const req = makeRequest('/api/cleaning/job-001/status', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'invalid_status' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(400)
            const body = await res.json() as any
            expect(body.error).toBe('Invalid status')
        })

        it('should return 500 on update failure', async () => {
            mockFetch.register('/jobs/job-001', () => ({
                status: 500,
                ok: false,
                body: { error: 'Update failed' },
            }))

            const req = makeRequest('/api/cleaning/job-001/status', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'completed' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(500)
            const body = await res.json() as any
            expect(body.error).toBe('Failed to update cleaning job')
        })

        it('should require authentication', async () => {
            const req = new Request('http://localhost/api/cleaning/job-001/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' }),
            })
            const res = await app.fetch(req, mockEnv)

            expect(res.status).toBe(401)
        })
    })

    describe('status validation', () => {
        const validStatuses = ['pending', 'in_progress', 'completed', 'verified']

        validStatuses.forEach((status) => {
            it(`should accept valid status: ${status}`, async () => {
                const updatedJob = mockCleaningJob({ id: 'job-001', status })

                mockFetch.register('/jobs/job-001', () => ({
                    status: 200,
                    body: turnoSingleJobResponse(updatedJob),
                }))

                const req = makeRequest('/api/cleaning/job-001/status', {
                    method: 'PATCH',
                    body: JSON.stringify({ status }),
                })
                const res = await app.fetch(req, mockEnv)

                expect(res.status).toBe(200)
            })
        })

        const invalidStatuses = ['invalid', 'cancelled', 'done', 'started', '']

        invalidStatuses.forEach((status) => {
            it(`should reject invalid status: "${status}"`, async () => {
                const req = makeRequest('/api/cleaning/job-001/status', {
                    method: 'PATCH',
                    body: JSON.stringify({ status }),
                })
                const res = await app.fetch(req, mockEnv)

                expect(res.status).toBe(400)
            })
        })
    })

    describe('response format', () => {
        it('should include data wrapper and count for list', async () => {
            const jobs = [mockCleaningJob()]

            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse(jobs),
            }))

            const req = makeRequest('/api/cleaning')
            const res = await app.fetch(req, mockEnv)

            const body = await res.json() as any
            expect(body).toHaveProperty('data')
            expect(body).toHaveProperty('count')
        })

        it('should include data wrapper for single job', async () => {
            const job = mockCleaningJob()

            mockFetch.register('/jobs/job-001', () => ({
                status: 200,
                body: turnoSingleJobResponse(job),
            }))

            const req = makeRequest('/api/cleaning/job-001')
            const res = await app.fetch(req, mockEnv)

            const body = await res.json() as any
            expect(body).toHaveProperty('data')
            expect(body.data).toHaveProperty('id')
        })
    })
})
