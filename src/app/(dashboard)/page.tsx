import { Suspense } from "react"
import { SyncButton } from "@/components/dashboard/sync-button"
import { KpiStatsGrid } from "@/components/dashboard/kpi-stats-grid"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { OccupancyChart } from "@/components/dashboard/occupancy-chart"
import { BookingSourcesChart } from "@/components/dashboard/booking-sources-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { PropertyPerformanceChart } from "@/components/dashboard/property-performance-chart"
import { CleaningSchedule } from "@/components/dashboard/cleaning-schedule"
import { UpcomingCheckIns } from "@/components/dashboard/upcoming-check-ins"
import { TaskPriorityMatrix } from "@/components/dashboard/task-priority-matrix"
import { AlertsBanner } from "@/components/dashboard/alerts-banner"
import { KpiCardsSkeleton } from "@/components/skeleton/dashboard-skeleton"

// ============================================================================
// Dashboard Page
// ============================================================================

export default async function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* ============================================================ */}
            {/* Section 1: Alert Notifications Banner - Full Width Top       */}
            {/* Task: P7-S9-11                                               */}
            {/* ============================================================ */}
            <section aria-label="Alert notifications">
                <AlertsBanner />
            </section>

            {/* ============================================================ */}
            {/* Section 2: Page Header with Sync                             */}
            {/* ============================================================ */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard Overview
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Real-time property management insights
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <SyncButton />
                </div>
            </div>

            {/* ============================================================ */}
            {/* Section 3: KPI Stat Cards - 4 columns                        */}
            {/* Task: P7-S9-02                                               */}
            {/* Responsive: 1 col mobile, 2 col tablet, 4 col desktop       */}
            {/* ============================================================ */}
            <section id="kpi-cards" aria-label="Key performance indicators">
                <Suspense fallback={<KpiCardsSkeleton />}>
                    <KpiStatsGrid />
                </Suspense>
            </section>

            {/* ============================================================ */}
            {/* Section 4: Main Charts Row - Large Charts                    */}
            {/* Tasks: P7-S9-03 (Occupancy) + P7-S9-04 (Revenue)           */}
            {/* Responsive: 1 col mobile/tablet, 2 col desktop              */}
            {/* ============================================================ */}
            <section
                aria-label="Primary charts"
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                <OccupancyChart />
                <RevenueChart />
            </section>

            {/* ============================================================ */}
            {/* Section 5: Secondary Charts Row - Medium Widgets             */}
            {/* Tasks: P7-S9-05 (Booking Pie) + P7-S9-06 (Property Bar)    */}
            {/* Responsive: 1 col mobile/tablet, 2 col desktop              */}
            {/* ============================================================ */}
            <section
                aria-label="Secondary charts"
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                <BookingSourcesChart />
                <PropertyPerformanceChart />
            </section>

            {/* ============================================================ */}
            {/* Section 6: Widgets Grid - Activity + Timelines               */}
            {/* Tasks: P7-S9-07 (Activity) + P7-S9-08 (Check-ins)          */}
            {/*        + P7-S9-09 (Cleaning)                                */}
            {/* Responsive: 1 col mobile, 3 col desktop                     */}
            {/* ============================================================ */}
            <section
                aria-label="Activity and timelines"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <ActivityFeed />
                <UpcomingCheckIns />
                <CleaningSchedule />
            </section>

            {/* ============================================================ */}
            {/* Section 7: Priority Matrix Widget - Full Width               */}
            {/* Task: P7-S9-10                                               */}
            {/* ============================================================ */}
            <section aria-label="Priority matrix">
                <TaskPriorityMatrix />
            </section>
        </div>
    )
}
