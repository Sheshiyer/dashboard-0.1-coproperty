import { getPropertyPerformance } from "@/lib/data/dashboard"
import { PropertyPerformanceChartClient } from "./property-performance-chart-client"

// ============================================================================
// PropertyPerformanceChart Component - Server Component (fetches data)
// ============================================================================

export async function PropertyPerformanceChart() {
  const data = await getPropertyPerformance(5, 30)
  return <PropertyPerformanceChartClient data={data} />
}
