/**
 * Unit Tests for Turno API Service
 *
 * Tests cover:
 * - Cleaning job fetching
 * - Job status updates
 * - Caching behavior
 * - Status mapping
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { TurnoService } from '../../src/services/turno'
import {
    MockKVNamespace,
    MockFetch,
    createMockEnv,
    mockCleaningJob,
    turnoJobsResponse,
    turnoSingleJobResponse,
} from '../mocks'

describe('TurnoService', () => {
    let service: TurnoService
    let mockEnv: ReturnType<typeof createMockEnv>
    let mockCache: MockKVNamespace
    let mockFetch: MockFetch
    let originalFetch: typeof globalThis.fetch

    beforeEach(() => {
        mockCache = new MockKVNamespace()
        mockFetch = new MockFetch()
        mockEnv = createMockEnv({ CACHE: mockCache })
        service = new TurnoService(mockEnv)

        originalFetch = globalThis.fetch
        globalThis.fetch = mockFetch.fetch.bind(mockFetch) as typeof fetch
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
        mockFetch.reset()
    })

    describe('getCleaningJobs', () => {
        it('should fetch cleaning jobs without filters', async () => {
            const jobs = [
                mockCleaningJob({ id: 'job-001' }),
                mockCleaningJob({ id: 'job-002' }),
            ]

            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse(jobs),
            }))

            const result = await service.getCleaningJobs()

            expect(result).toHaveLength(2)
            expect(result[0].id).toBe('job-001')
            expect(result[1].id).toBe('job-002')
        })

        it('should fetch cleaning jobs with date filter', async () => {
            const jobs = [mockCleaningJob({ id: 'job-001', date: '2026-02-01' })]

            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse(jobs),
            }))

            const result = await service.getCleaningJobs({ date: '2026-02-01' })

            expect(result).toHaveLength(1)

            const call = mockFetch.getCalls()[0]
            expect(call.url).toContain('date=2026-02-01')
        })

        it('should fetch cleaning jobs with property_id filter', async () => {
            const jobs = [mockCleaningJob({ id: 'job-001', property_id: 'prop-001' })]

            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse(jobs),
            }))

            const result = await service.getCleaningJobs({ property_id: 'prop-001' })

            expect(result).toHaveLength(1)

            const call = mockFetch.getCalls()[0]
            expect(call.url).toContain('property_id=prop-001')
        })

        it('should fetch cleaning jobs with status filter', async () => {
            const jobs = [mockCleaningJob({ id: 'job-001', status: 'pending' })]

            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse(jobs),
            }))

            const result = await service.getCleaningJobs({ status: 'pending' })

            expect(result).toHaveLength(1)

            const call = mockFetch.getCalls()[0]
            expect(call.url).toContain('status=pending')
        })

        it('should return empty array on API error', async () => {
            mockFetch.register('/jobs', () => ({
                status: 500,
                ok: false,
                body: { error: 'Server error' },
            }))

            const result = await service.getCleaningJobs()

            expect(result).toEqual([])
        })

        it('should use cache for repeated requests', async () => {
            const jobs = [mockCleaningJob()]

            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse(jobs),
            }))

            // First call
            await service.getCleaningJobs()
            expect(mockFetch.getCallCount()).toBe(1)

            // Verify cache was populated
            const cached = await mockCache.get('turno:/jobs', 'json')
            expect(cached).not.toBeNull()
        })
    })

    describe('getCleaningJob', () => {
        it('should fetch a single cleaning job', async () => {
            const job = mockCleaningJob({
                id: 'job-001',
                property_id: 'prop-001',
                status: 'in_progress',
            })

            mockFetch.register('/jobs/job-001', () => ({
                status: 200,
                body: turnoSingleJobResponse(job),
            }))

            const result = await service.getCleaningJob('job-001')

            expect(result).not.toBeNull()
            expect(result?.id).toBe('job-001')
            expect(result?.property_id).toBe('prop-001')
            expect(result?.status).toBe('in_progress')
        })

        it('should return null for non-existent job', async () => {
            mockFetch.register('/jobs/nonexistent', () => ({
                status: 404,
                ok: false,
                body: { error: 'Not found' },
            }))

            const result = await service.getCleaningJob('nonexistent')

            expect(result).toBeNull()
        })

        it('should transform job data correctly', async () => {
            const job = mockCleaningJob({
                id: 'job-001',
                date: '2026-02-01',
                time: '10:00',
                deadline: '14:00',
                cleaner: { name: 'Jane', phone: '+123' },
                checklist_complete: true,
                photos_count: 5,
                issues: ['Broken window'],
            })

            mockFetch.register('/jobs/job-001', () => ({
                status: 200,
                body: turnoSingleJobResponse(job),
            }))

            const result = await service.getCleaningJob('job-001')

            expect(result).toMatchObject({
                id: 'job-001',
                scheduled_date: '2026-02-01',
                scheduled_time: '10:00',
                deadline_time: '14:00',
                cleaner_name: 'Jane',
                cleaner_phone: '+123',
                checklist_completed: true,
                photo_count: 5,
                issues_reported: ['Broken window'],
            })
        })
    })

    describe('updateJobStatus', () => {
        it('should update job status successfully', async () => {
            const updatedJob = mockCleaningJob({
                id: 'job-001',
                status: 'completed',
                completed_at: '2026-02-01T15:00:00Z',
            })

            mockFetch.register('/jobs/job-001', () => ({
                status: 200,
                body: turnoSingleJobResponse(updatedJob),
            }))

            const result = await service.updateJobStatus('job-001', 'completed')

            expect(result).not.toBeNull()
            expect(result?.status).toBe('completed')

            // Verify PATCH method was used
            const call = mockFetch.getCalls()[0]
            expect(call.options?.method).toBe('PATCH')
        })

        it('should include status in request body', async () => {
            const updatedJob = mockCleaningJob({ id: 'job-001', status: 'in_progress' })

            mockFetch.register('/jobs/job-001', () => ({
                status: 200,
                body: turnoSingleJobResponse(updatedJob),
            }))

            await service.updateJobStatus('job-001', 'in_progress')

            const call = mockFetch.getCalls()[0]
            const body = JSON.parse(call.options?.body as string)
            expect(body.status).toBe('in_progress')
        })

        it('should invalidate cache on status update', async () => {
            // Pre-populate cache
            mockCache.seed({
                'turno:/jobs/job-001': turnoSingleJobResponse(mockCleaningJob()),
                'turno:/jobs': turnoJobsResponse([mockCleaningJob()]),
            })

            mockFetch.register('/jobs/job-001', () => ({
                status: 200,
                body: turnoSingleJobResponse(mockCleaningJob({ status: 'completed' })),
            }))

            await service.updateJobStatus('job-001', 'completed')

            // Verify cache was invalidated
            const cachedJob = await mockCache.get('turno:/jobs/job-001', 'json')
            const cachedJobs = await mockCache.get('turno:/jobs', 'json')
            expect(cachedJob).toBeNull()
            expect(cachedJobs).toBeNull()
        })

        it('should return null on update failure', async () => {
            mockFetch.register('/jobs/job-001', () => ({
                status: 500,
                ok: false,
                body: { error: 'Update failed' },
            }))

            const result = await service.updateJobStatus('job-001', 'completed')

            expect(result).toBeNull()
        })
    })

    describe('status mapping', () => {
        const statusTests = [
            { input: 'pending', expected: 'pending' },
            { input: 'scheduled', expected: 'pending' },
            { input: 'in_progress', expected: 'in_progress' },
            { input: 'started', expected: 'in_progress' },
            { input: 'completed', expected: 'completed' },
            { input: 'done', expected: 'completed' },
            { input: 'verified', expected: 'verified' },
            { input: 'approved', expected: 'verified' },
            { input: 'PENDING', expected: 'pending' }, // case insensitive
            { input: 'unknown', expected: 'pending' }, // fallback
            { input: '', expected: 'pending' }, // empty
        ]

        statusTests.forEach(({ input, expected }) => {
            it(`should map status "${input}" to "${expected}"`, async () => {
                const job = mockCleaningJob({ id: 'job-001', status: input })

                mockFetch.register('/jobs/job-001', () => ({
                    status: 200,
                    body: turnoSingleJobResponse(job),
                }))

                const result = await service.getCleaningJob('job-001')

                expect(result?.status).toBe(expected)
            })
        })
    })

    describe('job mapping', () => {
        it('should handle alternative field names', async () => {
            const job = {
                job_id: 'job-alt-001',
                property_external_id: 'prop-ext-001',
                scheduled_date: '2026-02-01',
                scheduled_time: '11:00',
                deadline_time: '15:00',
                cleaner_name: 'Direct Name',
                cleaner_phone: '+999',
                checklist_completed: true,
                photo_count: 3,
                issues_reported: ['Issue 1'],
                status: 'pending',
            }

            mockFetch.register('/jobs/job-alt-001', () => ({
                status: 200,
                body: turnoSingleJobResponse(job),
            }))

            const result = await service.getCleaningJob('job-alt-001')

            expect(result).toMatchObject({
                id: 'job-alt-001',
                turno_id: 'job-alt-001',
                property_id: 'prop-ext-001',
                scheduled_date: '2026-02-01',
                scheduled_time: '11:00',
                deadline_time: '15:00',
                cleaner_name: 'Direct Name',
                cleaner_phone: '+999',
                checklist_completed: true,
                photo_count: 3,
                issues_reported: ['Issue 1'],
            })
        })

        it('should handle missing optional fields', async () => {
            const job = {
                id: 'job-minimal',
                property_id: 'prop-001',
                date: '2026-02-01',
                status: 'pending',
            }

            mockFetch.register('/jobs/job-minimal', () => ({
                status: 200,
                body: turnoSingleJobResponse(job),
            }))

            const result = await service.getCleaningJob('job-minimal')

            expect(result).toMatchObject({
                id: 'job-minimal',
                property_id: 'prop-001',
                scheduled_date: '2026-02-01',
                status: 'pending',
                cleaner_name: undefined,
                cleaner_phone: undefined,
                checklist_completed: undefined,
                photo_count: 0,
                issues_reported: [],
            })
        })
    })

    describe('caching behavior', () => {
        it('should not cache non-GET requests', async () => {
            const job = mockCleaningJob({ id: 'job-001', status: 'completed' })

            mockFetch.register('/jobs/job-001', () => ({
                status: 200,
                body: turnoSingleJobResponse(job),
            }))

            // PATCH request
            await service.updateJobStatus('job-001', 'completed')

            // Verify no cache entry was created for the PATCH request
            // (cache was actually deleted, not created)
            const cached = await mockCache.get('turno:/jobs/job-001', 'json')
            expect(cached).toBeNull()
        })

        it('should respect TTL for cached responses', async () => {
            const jobs = [mockCleaningJob()]

            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse(jobs),
            }))

            await service.getCleaningJobs()

            // Verify cache was set with expiration
            const cacheStore = mockCache.getStore()
            const cacheEntry = cacheStore.get('turno:/jobs')
            expect(cacheEntry?.expiration).toBeDefined()
        })
    })

    describe('error handling', () => {
        it('should handle network errors gracefully for getCleaningJobs', async () => {
            mockFetch.setDefault(() => {
                throw new Error('Network error')
            })

            const result = await service.getCleaningJobs()

            expect(result).toEqual([])
        })

        it('should handle network errors gracefully for getCleaningJob', async () => {
            mockFetch.setDefault(() => {
                throw new Error('Network error')
            })

            const result = await service.getCleaningJob('job-001')

            expect(result).toBeNull()
        })

        it('should handle rate limiting (429 status)', async () => {
            mockFetch.register('/jobs', () => ({
                status: 429,
                ok: false,
                body: { error: 'Rate limited' },
            }))

            const result = await service.getCleaningJobs()

            expect(result).toEqual([])
        })

        it('should handle Cloudflare blocking', async () => {
            mockFetch.register('/jobs', () => ({
                status: 403,
                ok: false,
                body: { error: 'Forbidden' },
            }))

            const result = await service.getCleaningJobs()

            expect(result).toEqual([])
        })
    })

    describe('request headers', () => {
        it('should include required headers', async () => {
            mockFetch.register('/jobs', () => ({
                status: 200,
                body: turnoJobsResponse([]),
            }))

            await service.getCleaningJobs()

            const call = mockFetch.getCalls()[0]
            expect(call.options?.headers).toBeDefined()

            // Since we're using RequestInit, headers might be an object
            const headers = call.options?.headers as Record<string, string>
            expect(headers['Authorization']).toContain('Bearer')
            expect(headers['Content-Type']).toBe('application/json')
            expect(headers['User-Agent']).toBeDefined()
        })
    })
})
