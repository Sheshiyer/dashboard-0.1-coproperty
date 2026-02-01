import dynamic from "next/dynamic"
import { getPropertyPerformance } from "@/lib/data/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import the recharts-heavy client component to reduce initial JS
const PropertyPerformanceChartClient = dynamic(
    () => import("./property-performance-chart-client").then(m => ({ default: m.PropertyPerformanceChartClient })),
    {
        loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
    }
)

// ============================================================================
// PropertyPerformanceChart Component - Server Component (fetches data)
// ============================================================================

export async function PropertyPerformanceChart() {
  const data = await getPropertyPerformance(5, 30)
  return <PropertyPerformanceChartClient data={data} />
}
