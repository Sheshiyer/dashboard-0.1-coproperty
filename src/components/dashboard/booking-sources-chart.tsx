import dynamic from "next/dynamic"
import { getBookingSources } from "@/lib/data/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import the recharts-heavy client component to reduce initial JS
const BookingSourcesChartClient = dynamic(
    () => import("./booking-sources-chart-client").then(m => ({ default: m.BookingSourcesChartClient })),
    {
        loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
    }
)

// ============================================================================
// BookingSourcesChart Component (Server Component)
// ============================================================================

export async function BookingSourcesChart() {
  const sources = await getBookingSources()

  // Pass raw data to client component for color assignment
  return <BookingSourcesChartClient sources={sources} />
}
