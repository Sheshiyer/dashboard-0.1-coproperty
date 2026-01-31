import type { Bindings } from '../index'

export interface CleaningJob {
    id: string
    turno_id: string
    property_id: string
    reservation_id?: string
    next_reservation_id?: string
    scheduled_date: string
    scheduled_time?: string
    deadline_time?: string
    cleaner_name?: string
    cleaner_phone?: string
    status: 'pending' | 'in_progress' | 'completed' | 'verified'
    started_at?: string
    completed_at?: string
    verified_at?: string
    checklist_completed?: boolean
    photo_count?: number
    issues_reported?: string[]
}

/**
 * Turno API Service
 * Handles all interactions with the Turno cleaning management API
 */
export class TurnoService {
    private apiKey: string
    private cache: KVNamespace
    private baseUrl: string

    constructor(env: Bindings) {
        this.apiKey = env.TURNO_API_KEY
        this.cache = env.CACHE
        this.baseUrl = env.TURNO_BASE_URL || 'https://api.turno.com/v1'
    }

    private async fetch<T>(
        endpoint: string,
        options: { method?: string; body?: any; ttl?: number; skipCache?: boolean } = {}
    ): Promise<T> {
        const { method = 'GET', body, ttl = 60, skipCache = false } = options
        const cacheKey = `turno:${endpoint}`

        // Only cache GET requests
        if (method === 'GET' && !skipCache) {
            const cached = await this.cache.get(cacheKey, 'json')
            if (cached) {
                return cached as T
            }
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Origin': 'https://app.turnoverbnb.com',
                'Referer': 'https://app.turnoverbnb.com/',
            },
            body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Turno API error (${response.status}): ${error}`)
        }

        const data = (await response.json()) as T

        // Cache GET responses
        if (method === 'GET') {
            await this.cache.put(cacheKey, JSON.stringify(data), {
                expirationTtl: ttl,
            })
        }

        return data
    }

    async getCleaningJobs(params?: {
        date?: string
        property_id?: string
        status?: string
    }): Promise<CleaningJob[]> {
        const queryParams = new URLSearchParams()
        if (params?.date) queryParams.set('date', params.date)
        if (params?.property_id) queryParams.set('property_id', params.property_id)
        if (params?.status) queryParams.set('status', params.status)

        const query = queryParams.toString()
        const endpoint = `/jobs${query ? `?${query}` : ''}`

        try {
            const response = await this.fetch<{ data: any[] }>(endpoint, { ttl: 60 })

            return response.data.map((job: any) => this.mapJob(job))
        } catch (err) {
            // If Turno API is not configured, return empty array
            console.error('Turno API error:', err)
            return []
        }
    }

    async getCleaningJob(id: string): Promise<CleaningJob | null> {
        try {
            const response = await this.fetch<{ data: any }>(`/jobs/${id}`, { ttl: 60 })
            return this.mapJob(response.data)
        } catch {
            return null
        }
    }

    async updateJobStatus(
        id: string,
        status: CleaningJob['status']
    ): Promise<CleaningJob | null> {
        try {
            // Invalidate cache
            await this.cache.delete(`turno:/jobs/${id}`)
            await this.cache.delete('turno:/jobs')

            const response = await this.fetch<{ data: any }>(`/jobs/${id}`, {
                method: 'PATCH',
                body: { status },
                skipCache: true,
            })

            return this.mapJob(response.data)
        } catch {
            return null
        }
    }

    private mapJob(job: any): CleaningJob {
        return {
            id: job.id || job.job_id,
            turno_id: job.id || job.job_id,
            property_id: job.property_id || job.property_external_id,
            reservation_id: job.reservation_id,
            next_reservation_id: job.next_reservation_id,
            scheduled_date: job.date || job.scheduled_date,
            scheduled_time: job.time || job.scheduled_time,
            deadline_time: job.deadline || job.deadline_time,
            cleaner_name: job.cleaner?.name || job.cleaner_name,
            cleaner_phone: job.cleaner?.phone || job.cleaner_phone,
            status: this.mapStatus(job.status),
            started_at: job.started_at,
            completed_at: job.completed_at,
            verified_at: job.verified_at,
            checklist_completed: job.checklist_complete || job.checklist_completed,
            photo_count: job.photos_count || job.photo_count || 0,
            issues_reported: job.issues || job.issues_reported || [],
        }
    }

    private mapStatus(status: string): CleaningJob['status'] {
        const statusMap: Record<string, CleaningJob['status']> = {
            pending: 'pending',
            scheduled: 'pending',
            in_progress: 'in_progress',
            started: 'in_progress',
            completed: 'completed',
            done: 'completed',
            verified: 'verified',
            approved: 'verified',
        }
        return statusMap[status?.toLowerCase()] || 'pending'
    }
}
