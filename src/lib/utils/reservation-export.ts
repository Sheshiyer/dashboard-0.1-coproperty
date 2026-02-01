import type { Reservation } from '@/types/api'
import { format, parseISO, differenceInDays } from 'date-fns'

/**
 * Escape CSV special characters
 */
function escapeCsvValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return ''
    const stringValue = String(value)
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
}

/**
 * Calculate number of nights for a reservation
 */
function calculateNights(checkIn: string, checkOut: string): number {
    try {
        const checkInDate = parseISO(checkIn)
        const checkOutDate = parseISO(checkOut)
        return differenceInDays(checkOutDate, checkInDate)
    } catch {
        return 0
    }
}

/**
 * Format date for CSV export
 */
function formatDateForCsv(dateString: string): string {
    try {
        return format(parseISO(dateString), 'yyyy-MM-dd')
    } catch {
        return dateString
    }
}

/**
 * Generate CSV content from reservations
 */
export function generateReservationCSV(reservations: Reservation[]): string {
    // CSV headers
    const headers = [
        'ID',
        'Confirmation Code',
        'Guest Name',
        'Guest Email',
        'Guest Phone',
        'Property',
        'Check In',
        'Check Out',
        'Nights',
        'Guests',
        'Status',
        'Platform',
        'Total Price',
        'Payout Amount',
        'Currency',
        'Special Requests',
    ]

    const rows = reservations.map((r) => {
        const nights = calculateNights(r.check_in_date, r.check_out_date)
        return [
            escapeCsvValue(r.id),
            escapeCsvValue(r.confirmation_code),
            escapeCsvValue(r.guest_name),
            escapeCsvValue(r.guest_email),
            escapeCsvValue(r.guest_phone),
            escapeCsvValue(r.properties?.name || r.property_id),
            escapeCsvValue(formatDateForCsv(r.check_in_date)),
            escapeCsvValue(formatDateForCsv(r.check_out_date)),
            escapeCsvValue(nights),
            escapeCsvValue(r.guest_count),
            escapeCsvValue(r.status),
            escapeCsvValue(r.platform),
            escapeCsvValue(r.total_price),
            escapeCsvValue(r.payout_amount),
            escapeCsvValue(r.currency),
            escapeCsvValue(r.special_requests),
        ].join(',')
    })

    return [headers.join(','), ...rows].join('\n')
}

/**
 * Download CSV file
 */
export function downloadReservationCSV(csvContent: string, filename?: string): void {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
    const defaultFilename = `reservations_${timestamp}.csv`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename || defaultFilename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Export reservations to CSV
 */
export function exportReservationsToCSV(
    reservations: Reservation[],
    filename?: string
): void {
    const csvContent = generateReservationCSV(reservations)
    downloadReservationCSV(csvContent, filename)
}
