import { Suspense } from "react"
import { SyncButton } from "@/components/dashboard/sync-button"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { getDashboardStats } from "@/lib/data/dashboard"

export default async function DashboardPage() {
    const stats = await getDashboardStats()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <div className="flex items-center gap-2">
                    <SyncButton />
                </div>
            </div>

            <Suspense fallback={<StatsGridSkeleton />}>
                <StatsGrid stats={stats} />
            </Suspense>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-4">Operations Overview</h3>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg">
                        Chart Placeholder
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow p-6">
                    <h3 className="font-semibold leading-none tracking-tight mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 text-sm">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <div className="flex-1 space-y-1">
                                    <p className="font-medium">New reservation confirmed</p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatsGridSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl border bg-muted/50 animate-pulse" />
            ))}
        </div>
    )
}
