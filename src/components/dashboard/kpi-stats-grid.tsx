import { getDashboardStats } from "@/lib/data/dashboard"
import { KpiStatsGridClient } from "./kpi-stats-grid-client"

// ============================================================================
// KPI Stats Grid Component - Server Component (fetches data)
// ============================================================================

export async function KpiStatsGrid() {
  const stats = await getDashboardStats()
  return <KpiStatsGridClient stats={stats} />
}
