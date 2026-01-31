import { getOccupancyTrends } from "@/lib/data/dashboard"
import { OccupancyChartClient } from "./occupancy-chart-client"

// ============================================================================
// OccupancyChart Component - Server Component (fetches data)
// ============================================================================

export async function OccupancyChart() {
    const data = await getOccupancyTrends(30)
    return <OccupancyChartClient data={data} />
}
