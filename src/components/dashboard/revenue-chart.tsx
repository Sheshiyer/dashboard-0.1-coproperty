import { format, parseISO } from "date-fns"
import { getRevenueTrends } from "@/lib/data/dashboard"
import { RevenueChartClient } from "./revenue-chart-client"

// ============================================================================
// RevenueChart Server Component
// Fetches 90 days of data and passes to client component for filtering
// ============================================================================

export async function RevenueChart() {
    // Fetch 90 days of data to cover all date range options
    const rawData = await getRevenueTrends(90)

    // Format dates for display (from "2024-01-15" to "Jan 15")
    const formattedData = rawData.map(item => ({
        ...item,
        date: format(parseISO(item.date), "MMM dd")
    }))

    return <RevenueChartClient data={formattedData} />
}
