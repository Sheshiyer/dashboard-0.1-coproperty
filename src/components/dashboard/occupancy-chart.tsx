import dynamic from "next/dynamic"
import { getOccupancyTrends } from "@/lib/data/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import the recharts-heavy client component to reduce initial JS
const OccupancyChartClient = dynamic(
    () => import("./occupancy-chart-client").then(m => ({ default: m.OccupancyChartClient })),
    {
        loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
    }
)

// ============================================================================
// OccupancyChart Component - Server Component (fetches data)
// ============================================================================

export async function OccupancyChart() {
    const data = await getOccupancyTrends(30)
    return <OccupancyChartClient data={data} />
}
