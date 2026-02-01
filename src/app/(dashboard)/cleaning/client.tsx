"use client"

import { useState } from "react"
import { CleaningJob } from "@/lib/data/cleaning"
import { KanbanBoard } from "@/components/cleaning/kanban-board"
import { CalendarView } from "@/components/cleaning/calendar-view"
import { MetricsPanel } from "@/components/cleaning/metrics-panel"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Calendar, BarChart3, SprayCan } from "lucide-react"
import { cn } from "@/lib/utils"

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
                    >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Metrics
                    </Button>

                    {/* View Toggle */}
                    <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
                        <button
                            onClick={() => setViewMode("kanban")}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                viewMode === "kanban"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Kanban
                        </button>
                        <button
                            onClick={() => setViewMode("calendar")}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                viewMode === "calendar"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Calendar className="h-4 w-4" />
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
            <div className="flex-1 overflow-hidden">
                {viewMode === "kanban" ? (
                    <KanbanBoard initialJobs={initialJobs} />
                ) : (
                    <CalendarView jobs={initialJobs} />
                )}
            </div>
        </>
    )
}
