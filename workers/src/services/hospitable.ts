import type { Bindings } from '../index'

export interface Property {
    id: string
    hospitable_id: string
    name: string
    internal_code: string
    address: string
    building_name?: string
    room_number?: string
    bedrooms: number
    bathrooms: number
    max_guests: number
    check_in_time: string
    check_out_time: string
    status: 'active' | 'inactive'
    segment?: string
}

export interface Reservation {
    id: string
    property_id: string
    hospitable_id: string
    confirmation_code: string
    platform: string
    check_in_date: string
    check_out_date: string
    guest_name: string
    guest_email?: string
    guest_phone?: string
    guest_count: number
    total_price: number
    payout_amount: number
    currency: string
    status: string
    special_requests?: string
}

interface HospitableResponse<T> {
    data: T[]
    links?: {
        next?: string
    }
}

/**
 * Hospitable API Service
 * Handles all interactions with the Hospitable API v2
 */
export class HospitableService {
    private token: string
    private cache: KVNamespace
    private baseUrl: string

    constructor(env: Bindings) {
        this.token = env.HOSPITABLE_API_TOKEN
        this.cache = env.CACHE
        this.baseUrl = env.HOSPITABLE_BASE_URL || 'https://public.api.hospitable.com/v2'
    }

    private async fetch<T>(
        endpoint: string,
        options: { ttl?: number; skipCache?: boolean } = {}
    ): Promise<T> {
        const { ttl = 300, skipCache = false } = options
        const cacheKey = `hospitable:${endpoint}`

        // Check cache first
        if (!skipCache) {
            const cached = await this.cache.get(cacheKey, 'json')
            if (cached) {
                return cached as T
            }
        }

        // Fetch from API
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Hospitable API error (${response.status}): ${error}`)
        }

        const data = (await response.json()) as T

        // Cache the response
        await this.cache.put(cacheKey, JSON.stringify(data), {
            expirationTtl: ttl,
        })

        return data
    }

    async getProperties(): Promise<Property[]> {
        const response = await this.fetch<HospitableResponse<any>>('/properties', { ttl: 300 })

        return response.data.map((p: any) => ({
            id: p.id,
            hospitable_id: p.id,
            name: p.name || p.nickname || 'Unnamed Property',
            internal_code: p.internal_code || p.id.slice(0, 8),
            address: this.formatAddress(p.address),
            building_name: p.address?.building,
            room_number: p.address?.room,
            bedrooms: p.bedrooms || 0,
            bathrooms: p.bathrooms || 0,
            max_guests: p.guests?.max || p.max_guests || 0,
            check_in_time: p.check_in_time || '15:00',
            check_out_time: p.check_out_time || '11:00',
            status: p.status === 'active' ? 'active' : 'inactive',
            segment: p.segment,
        }))
    }

    async getProperty(id: string): Promise<Property | null> {
        try {
            const response = await this.fetch<{ data: any }>(`/properties/${id}`, { ttl: 300 })
            const p = response.data

            return {
                id: p.id,
                hospitable_id: p.id,
                name: p.name || p.nickname || 'Unnamed Property',
                internal_code: p.internal_code || p.id.slice(0, 8),
                address: this.formatAddress(p.address),
                building_name: p.address?.building,
                room_number: p.address?.room,
                bedrooms: p.bedrooms || 0,
                bathrooms: p.bathrooms || 0,
                max_guests: p.guests?.max || p.max_guests || 0,
                check_in_time: p.check_in_time || '15:00',
                check_out_time: p.check_out_time || '11:00',
                status: p.status === 'active' ? 'active' : 'inactive',
                segment: p.segment,
            }
        } catch {
            return null
        }
    }

    async getReservations(params?: {
        from?: string
        to?: string
        property_id?: string
    }): Promise<Reservation[]> {
        const queryParams = new URLSearchParams()
        if (params?.from) queryParams.set('arrival_from', params.from)
        if (params?.to) queryParams.set('arrival_to', params.to)
        if (params?.property_id) queryParams.set('property_id', params.property_id)

        const query = queryParams.toString()
        const endpoint = `/reservations${query ? `?${query}` : ''}`

        const response = await this.fetch<HospitableResponse<any>>(endpoint, { ttl: 120 })

        return response.data.map((r: any) => ({
            id: r.id,
            property_id: r.property_id,
            hospitable_id: r.id,
            confirmation_code: r.code || r.confirmation_code || '',
            platform: r.platform?.toLowerCase() || 'direct',
            check_in_date: r.arrival_date || r.check_in_date,
            check_out_date: r.departure_date || r.check_out_date,
            guest_name: this.formatGuestName(r.guest),
            guest_email: r.guest?.email,
            guest_phone: r.guest?.phone,
            guest_count: r.guests_count || r.guest_count || 1,
            total_price: r.financials?.guest_total || r.total_price || 0,
            payout_amount: r.financials?.host_payout || r.payout_amount || 0,
            currency: r.financials?.currency || 'THB',
            status: r.status || 'confirmed',
            special_requests: r.special_requests,
        }))
    }

    async getReservation(id: string): Promise<Reservation | null> {
        try {
            const response = await this.fetch<{ data: any }>(`/reservations/${id}`, { ttl: 120 })
            const r = response.data

            return {
                id: r.id,
                property_id: r.property_id,
                hospitable_id: r.id,
                confirmation_code: r.code || r.confirmation_code || '',
                platform: r.platform?.toLowerCase() || 'direct',
                check_in_date: r.arrival_date || r.check_in_date,
                check_out_date: r.departure_date || r.check_out_date,
                guest_name: this.formatGuestName(r.guest),
                guest_email: r.guest?.email,
                guest_phone: r.guest?.phone,
                guest_count: r.guests_count || r.guest_count || 1,
                total_price: r.financials?.guest_total || r.total_price || 0,
                payout_amount: r.financials?.host_payout || r.payout_amount || 0,
                currency: r.financials?.currency || 'THB',
                status: r.status || 'confirmed',
                special_requests: r.special_requests,
            }
        } catch {
            return null
        }
    }

    private formatAddress(address: any): string {
        if (!address) return ''
        if (typeof address === 'string') return address

        const parts = [
            address.street,
            address.city,
            address.state,
            address.country,
        ].filter(Boolean)

        return parts.join(', ')
    }

    private formatGuestName(guest: any): string {
        if (!guest) return 'Guest'
        if (guest.name) return guest.name
        return [guest.first_name, guest.last_name].filter(Boolean).join(' ') || 'Guest'
    }
}
