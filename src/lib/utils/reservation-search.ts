import type { Reservation } from '@/types/api'

/**
 * Search reservations by guest name, confirmation code, email, or property name
 */
export function searchReservations(
    reservations: Reservation[],
    query: string
): Reservation[] {
    const trimmedQuery = query.trim()

    // Require minimum 2 characters
    if (trimmedQuery.length < 2) {
        return reservations
    }

    const lowerQuery = trimmedQuery.toLowerCase()

    return reservations.filter((r) => {
        // Search guest name
        if (r.guest_name.toLowerCase().includes(lowerQuery)) return true

        // Search confirmation code
        if (r.confirmation_code.toLowerCase().includes(lowerQuery)) return true

        // Search guest email
        if (r.guest_email?.toLowerCase().includes(lowerQuery)) return true

        // Search property name (if available)
        if (r.properties?.name.toLowerCase().includes(lowerQuery)) return true

        // Search platform
        if (r.platform.toLowerCase().includes(lowerQuery)) return true

        return false
    })
}

/**
 * Get search suggestions for autocomplete
 */
export function getSearchSuggestions(
    reservations: Reservation[],
    query: string,
    maxSuggestions: number = 8
): Reservation[] {
    const results = searchReservations(reservations, query)
    return results.slice(0, maxSuggestions)
}

/**
 * Extract initials from guest name for avatar display
 */
export function getGuestInitials(guestName: string): string {
    const parts = guestName.trim().split(' ')
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Highlight matching text in search results
 */
export function highlightMatch(text: string, query: string): { text: string; highlight: boolean }[] {
    if (!query.trim()) {
        return [{ text, highlight: false }]
    }

    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const index = lowerText.indexOf(lowerQuery)

    if (index === -1) {
        return [{ text, highlight: false }]
    }

    const parts: { text: string; highlight: boolean }[] = []

    if (index > 0) {
        parts.push({ text: text.substring(0, index), highlight: false })
    }

    parts.push({
        text: text.substring(index, index + query.length),
        highlight: true,
    })

    if (index + query.length < text.length) {
        parts.push({
            text: text.substring(index + query.length),
            highlight: false,
        })
    }

    return parts
}
