// Shared API Types matching Cloudflare Workers responses

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
    picture?: string
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
    properties?: Property
}

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
    properties?: Property
}

export interface Task {
    id: string
    property_id?: string
    reservation_id?: string
    title: string
    description?: string
    category: 'maintenance' | 'inspection' | 'inventory' | 'general'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'pending' | 'in_progress' | 'completed'
    assigned_to?: string
    due_date?: string
    completed_at?: string
    created_by: string
    created_at: string
    updated_at: string
    properties?: Property
}

export type PropertyWithDetails = Property & {
    reservations?: Reservation[]
    cleaning_jobs?: CleaningJob[]
    tasks?: Task[]
}

// API Response Wrappers
export interface ApiResponse<T> {
    data: T
    count?: number
    error?: string
}
