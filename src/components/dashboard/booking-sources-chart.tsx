import { getBookingSources } from "@/lib/data/dashboard"
import { BookingSourcesChartClient } from "./booking-sources-chart-client"

// ============================================================================
// BookingSourcesChart Component (Server Component)
// ============================================================================

export async function BookingSourcesChart() {
  const sources = await getBookingSources()

  // Pass raw data to client component for color assignment
  return <BookingSourcesChartClient sources={sources} />
}
