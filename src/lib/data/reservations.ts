import { apiClient } from "@/lib/api-client"
import type { Reservation, ApiResponse, Property } from "@/types/api"
export type { Reservation }

export async function getReservations(): Promise<Reservation[]> {
    try {
        const [reservationsRes, propertiesRes] = await Promise.all([
            apiClient<ApiResponse<Reservation[]>>('/api/reservations'),
            apiClient<ApiResponse<Property[]>>('/api/properties')
        ])

        const reservations = reservationsRes.data || []
        const properties = propertiesRes.data || []

        return reservations.map(r => ({
            ...r,
            properties: properties.find(p => p.id === r.property_id)
        }))
    } catch (error) {
        console.error("Error fetching reservations:", error)
        return []
    }
}

export async function getReservationsByProperty(propertyId: string): Promise<Reservation[]> {
    try {
        const response = await apiClient<ApiResponse<Reservation[]>>(
            `/api/reservations?property_id=${propertyId}`
        )
        return response.data || []
    } catch (error) {
        console.error("Error fetching reservations for property:", error)
        return []
    }
}

export async function getReservationsByDateRange(
    from: string,
    to: string
): Promise<Reservation[]> {
    try {
        const response = await apiClient<ApiResponse<Reservation[]>>(
            `/api/reservations?from=${from}&to=${to}`
        )
        return response.data || []
    } catch (error) {
        console.error("Error fetching reservations by date range:", error)
        return []
    }
}

export async function getReservation(id: string): Promise<Reservation | null> {
    try {
        const response = await apiClient<ApiResponse<Reservation>>(`/api/reservations/${id}`)
        return response.data || null
    } catch (error) {
        console.error("Error fetching reservation:", error)
        return null
    }
}
