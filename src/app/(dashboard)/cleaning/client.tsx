"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { CleaningJob } from "@/lib/data/cleaning"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Calendar, BarChart3, SprayCan } from "lucide-react"
import { cn } from "@/lib/utils"
import { CleaningSkeleton } from "@/components/skeleton/cleaning-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

// ---------------------------------------------------------------------------
// Dynamic imports - KanbanBoard uses @dnd-kit (heavy), CalendarView is
// only needed when that tab is active, MetricsPanel can load lazily.
// ---------------------------------------------------------------------------
const KanbanBoard = dynamic(
    () => import("@/components/cleaning/kanban-board").then(m => ({ default: m.KanbanBoard })),
    {
        loading: () => <CleaningSkeleton />,
        ssr: false,
    }
)
const CalendarView = dynamic(
    () => import("@/components/cleaning/calendar-view").then(m => ({ default: m.CalendarView })),
    {
        loading: () => <Skeleton className="h-96 w-full rounded-xl" />,
        ssr: false,
    }
)
const MetricsPanel = dynamic(
    () => import("@/components/cleaning/metrics-panel").then(m => ({ default: m.MetricsPanel })),
    {
        loading: () => <Skeleton className="h-24 w-full rounded-xl" />,
        ssr: false,
    }
)

interface CleaningPageClientProps {
    initialJobs: CleaningJob[]
}

type ViewMode = "kanban" | "calendar"

export function CleaningPageClient({ initialJobs }: CleaningPageClientProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("kanban")
    const [showMetrics, setShowMetrics] = useState(true)

    // Show empty state if no jobs
    if (!initialJobs || initialJobs.length === 0) {
        return (
            <EmptyState
                icon={SprayCan}
                title="No cleanings scheduled"
                description="Schedule cleaning jobs for your properties. Drag and drop cards between columns to track progress from pending to verified."
                actionLabel="Schedule Cleaning"
                size="lg"
            />
        )
    }

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Cleaning Schedule</h1>

                <div className="flex items-center gap-2">
                    {/* Metrics Toggle */}
                    <Button
                        variant={showMetrics ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowMetrics(!showMetrics)}
                        aria-pressed={showMetrics}
                        aria-label={showMetrics ? "Hide metrics panel" : "Show metrics panel"}
                    >
                        <BarChart3 className="h-4 w-4 mr-1" aria-hidden="true" />
                        Metrics
                    </Button>

                    {/* View Toggle */}
                    <div role="tablist" aria-label="View mode" className="flex items-center rounded-lg border bg-muted/50 p-0.5">
                        <button
                            role="tab"
                            aria-selected={viewMode === "kanban"}
                            aria-controls="cleaning-view-panel"
                            onClick={() => setViewMode("kanban")}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                viewMode === "kanban"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                            Kanban
                        </button>
                        <button
                            role="tab"
                            aria-selected={viewMode === "calendar"}
                            aria-controls="cleaning-view-panel"
                            onClick={() => setViewMode("calendar")}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                viewMode === "calendar"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Calendar className="h-4 w-4" aria-hidden="true" />
                            Calendar
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Panel */}
            {showMetrics && (
                <MetricsPanel jobs={initialJobs} />
            )}

            {/* Main Content Area */}
            <div id="cleaning-view-panel" role="tabpanel" aria-label={`${viewMode} view`} className="flex-1 overflow-hidden">
                {viewMode === "kanban" ? (
                    <KanbanBoard initialJobs={initialJobs} />
                ) : (
                    <CalendarView jobs={initialJobs} />
                )}
            </div>
        </>
    )
}
