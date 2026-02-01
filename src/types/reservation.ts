import type { Reservation } from './api'
import type { VariantProps } from 'class-variance-authority'
import type { badgeVariants } from '@/components/ui/badge'

// Extended reservation data for card display
export interface ReservationCardData extends Reservation {
    nightsCount?: number
    statusVariant?: VariantProps<typeof badgeVariants>['variant']
    platformColor?: string
    guestInitials?: string
}

// View mode options for reservation display
export type ReservationViewMode = 'table' | 'timeline' | 'calendar'

// Filter state for reservations
export interface ReservationFilterState {
    status: string[]
    property: string[]
    platform: string[]
    dateRange: string
    customFrom?: string
    customTo?: string
}

// Initial filter state
export const initialReservationFilters: ReservationFilterState = {
    status: [],
    property: [],
    platform: [],
    dateRange: 'upcoming',
    customFrom: undefined,
    customTo: undefined,
}

// Status configuration mapping
export const RESERVATION_STATUS_CONFIG: Record<
    string,
    { label: string; variant: VariantProps<typeof badgeVariants>['variant'] }
> = {
    confirmed: { label: 'Confirmed', variant: 'success' },
    checked_in: { label: 'Checked In', variant: 'default' },
    checked_out: { label: 'Checked Out', variant: 'secondary' },
    cancelled: { label: 'Cancelled', variant: 'error' },
    pending: { label: 'Pending', variant: 'warning' },
}

// Platform configuration mapping
export const PLATFORM_CONFIG: Record<string, { label: string; color: string }> = {
    airbnb: { label: 'Airbnb', color: '#FF5A5F' },
    booking: { label: 'Booking.com', color: '#003580' },
    vrbo: { label: 'Vrbo', color: '#006BB6' },
    direct: { label: 'Direct', color: '#10B981' },
}

// Date range presets
export const DATE_RANGE_PRESETS = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'past', label: 'Past' },
    { value: 'custom', label: 'Custom Range' },
] as const

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number]['value']
