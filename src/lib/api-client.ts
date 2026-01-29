/**
 * Workers API Client
 * 
 * This client fetches data from Cloudflare Workers endpoints
 * which in turn fetch from Hospitable and Turno APIs.
 */

const WORKERS_URL = process.env.NEXT_PUBLIC_WORKERS_URL || 'http://localhost:8787'
const API_KEY = process.env.API_KEY || ''

interface ApiClientOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: unknown
}

interface ApiError {
    message: string
    code?: string
}

class WorkersApiError extends Error {
    code?: string
    status: number

    constructor(message: string, status: number, code?: string) {
        super(message)
        this.name = 'WorkersApiError'
        this.status = status
        this.code = code
    }
}

async function apiClient<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
    const { method = 'GET', body } = options

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    }


    // Server-side authentication
    if (typeof window === 'undefined' && API_KEY) {
        headers['Authorization'] = `Bearer ${API_KEY}`
    }

    // Client-side authentication (overrides server-side if present, though rare overlap)
    if (typeof window !== 'undefined') {
        const apiKey = localStorage.getItem('api_key')
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`
        }
    }

    const response = await fetch(`${WORKERS_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        cache: 'no-store',
    })

    if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
            message: 'Unknown error'
        }))
        throw new WorkersApiError(
            error.message || 'API request failed',
            response.status,
            error.code
        )
    }

    return response.json()
}

export { apiClient, WorkersApiError }
export type { ApiClientOptions, ApiError }
