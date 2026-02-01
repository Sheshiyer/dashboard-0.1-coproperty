import { Suspense } from "react"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { SyncButton } from "@/components/dashboard/sync-button"
import { KpiStatsGrid } from "@/components/dashboard/kpi-stats-grid"
import { OccupancyChart } from "@/components/dashboard/occupancy-chart"
import { BookingSourcesChart } from "@/components/dashboard/booking-sources-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { PropertyPerformanceChart } from "@/components/dashboard/property-performance-chart"
import { CleaningSchedule } from "@/components/dashboard/cleaning-schedule"
import { UpcomingCheckIns } from "@/components/dashboard/upcoming-check-ins"
import { TaskPriorityMatrix } from "@/components/dashboard/task-priority-matrix"
import { AlertsBanner } from "@/components/dashboard/alerts-banner"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { KpiCardsSkeleton } from "@/components/skeleton/dashboard-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { queryKeys } from "@/lib/query-client"
import { getProperties } from "@/lib/data/properties"
import { getUpcomingCheckIns, getDashboardStats, getTodayCleaning } from "@/lib/data/dashboard"

// ============================================================================
// Dashboard Page
// Server-side prefetching hydrates the React Query cache so client components
// have data immediately without a loading flash on first render.
// ============================================================================

export default async function DashboardPage() {
    // Create a fresh QueryClient per request to avoid cross-request cache leaks
    const serverQueryClient = new QueryClient()

    // Prefetch critical dashboard data in parallel on the server.
    // Using allSettled so one failed prefetch does not block others.
    await Promise.allSettled([
        serverQueryClient.prefetchQuery({
            queryKey: queryKeys.properties.all(),
            queryFn: getProperties,
        }),
        serverQueryClient.prefetchQuery({
            queryKey: queryKeys.dashboard.upcomingCheckIns(),
            queryFn: () => getUpcomingCheckIns(50),
        }),
        serverQueryClient.prefetchQuery({
            queryKey: queryKeys.dashboard.stats(),
            queryFn: getDashboardStats,
        }),
        serverQueryClient.prefetchQuery({
            queryKey: queryKeys.dashboard.todayCleaning(),
            queryFn: getTodayCleaning,
        }),
    ])

    return (
    <HydrationBoundary state={dehydrate(serverQueryClient)}>
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
                <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
                    <OccupancyChart />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
                    <RevenueChart />
                </Suspense>
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
                <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
                    <BookingSourcesChart />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
                    <PropertyPerformanceChart />
                </Suspense>
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
                <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
                    <ActivityFeed />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
                    <UpcomingCheckIns />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
                    <CleaningSchedule />
                </Suspense>
            </section>

            {/* ============================================================ */}
            {/* Section 7: Priority Matrix Widget - Full Width               */}
            {/* Task: P7-S9-10                                               */}
            {/* ============================================================ */}
            <section aria-label="Priority matrix">
                <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
                    <TaskPriorityMatrix />
                </Suspense>
            </section>
        </div>
    </HydrationBoundary>
    )
}
