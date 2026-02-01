import type { Reservation } from '@/types/api'
import type { ReservationFilterState } from '@/types/reservation'
import { isAfter, isBefore, isToday, isThisWeek, isThisMonth, parseISO, startOfDay, endOfDay } from 'date-fns'

/**
 * Filter reservations based on the current filter state
 */
export function filterReservations(
    reservations: Reservation[],
    filters: ReservationFilterState
): Reservation[] {
    let filtered = [...reservations]

    // Filter by status (multi-select AND logic)
    if (filters.status.length > 0) {
        filtered = filtered.filter((r) => filters.status.includes(r.status))
    }

    // Filter by property (multi-select AND logic)
    if (filters.property.length > 0) {
        filtered = filtered.filter((r) => filters.property.includes(r.property_id))
    }

    // Filter by platform (multi-select AND logic)
    if (filters.platform.length > 0) {
        filtered = filtered.filter((r) =>
            filters.platform.includes(r.platform.toLowerCase())
        )
    }

    // Filter by date range
    if (filters.dateRange) {
        const now = new Date()
        filtered = filtered.filter((r) => {
            const checkInDate = parseISO(r.check_in_date)
            const checkOutDate = parseISO(r.check_out_date)

            switch (filters.dateRange) {
                case 'upcoming':
                    return isAfter(checkInDate, now) || isAfter(checkOutDate, now)
                case 'today':
                    return isToday(checkInDate) || isToday(checkOutDate)
                case 'this_week':
                    return isThisWeek(checkInDate, { weekStartsOn: 1 }) ||
                           isThisWeek(checkOutDate, { weekStartsOn: 1 })
                case 'this_month':
                    return isThisMonth(checkInDate) || isThisMonth(checkOutDate)
                case 'past':
                    return isBefore(checkOutDate, now)
                case 'custom':
                    if (filters.customFrom && filters.customTo) {
                        const fromDate = startOfDay(parseISO(filters.customFrom))
                        const toDate = endOfDay(parseISO(filters.customTo))
                        return (
                            (isAfter(checkInDate, fromDate) || checkInDate.getTime() === fromDate.getTime()) &&
                            (isBefore(checkOutDate, toDate) || checkOutDate.getTime() === toDate.getTime())
                        )
                    }
                    return true
                default:
                    return true
            }
        })
    }

    return filtered
}

/**
 * Get active filter count (for badge display)
 */
export function getActiveFilterCount(filters: ReservationFilterState): number {
    let count = 0
    if (filters.status.length > 0) count += filters.status.length
    if (filters.property.length > 0) count += filters.property.length
    if (filters.platform.length > 0) count += filters.platform.length
    if (filters.dateRange && filters.dateRange !== 'upcoming') count += 1
    return count
}

/**
 * Clear all filters
 */
export function clearAllFilters(): ReservationFilterState {
    return {
        status: [],
        property: [],
        platform: [],
        dateRange: 'upcoming',
        customFrom: undefined,
        customTo: undefined,
    }
}

/**
 * Parse filters from URL search params
 */
export function parseFiltersFromUrl(searchParams: URLSearchParams): Partial<ReservationFilterState> {
    const filters: Partial<ReservationFilterState> = {}

    const status = searchParams.get('status')
    if (status) filters.status = status.split(',')

    const property = searchParams.get('property')
    if (property) filters.property = property.split(',')

    const platform = searchParams.get('platform')
    if (platform) filters.platform = platform.split(',')

    const dateRange = searchParams.get('dateRange')
    if (dateRange) filters.dateRange = dateRange

    const customFrom = searchParams.get('customFrom')
    if (customFrom) filters.customFrom = customFrom

    const customTo = searchParams.get('customTo')
    if (customTo) filters.customTo = customTo

    return filters
}

/**
 * Convert filters to URL search params
 */
export function filtersToUrlParams(filters: ReservationFilterState): URLSearchParams {
    const params = new URLSearchParams()

    if (filters.status.length > 0) {
        params.set('status', filters.status.join(','))
    }

    if (filters.property.length > 0) {
        params.set('property', filters.property.join(','))
    }

    if (filters.platform.length > 0) {
        params.set('platform', filters.platform.join(','))
    }

    if (filters.dateRange && filters.dateRange !== 'upcoming') {
        params.set('dateRange', filters.dateRange)
    }

    if (filters.customFrom) {
        params.set('customFrom', filters.customFrom)
    }

    if (filters.customTo) {
        params.set('customTo', filters.customTo)
    }

    return params
}
