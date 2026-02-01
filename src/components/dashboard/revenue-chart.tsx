import dynamic from "next/dynamic"
import { format, parseISO } from "date-fns"
import { getRevenueTrends } from "@/lib/data/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import the recharts-heavy client component to reduce initial JS
const RevenueChartClient = dynamic(
    () => import("./revenue-chart-client").then(m => ({ default: m.RevenueChartClient })),
    {
        loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
    }
)

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
