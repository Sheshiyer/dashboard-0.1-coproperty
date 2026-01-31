import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { GlassCard } from "@/components/ui/glass"
import { getTaskPriorityBreakdown, type TaskPriorityItem } from "@/lib/data/dashboard"

// ============================================================================
// Types
// ============================================================================

interface MatrixQuadrant extends TaskPriorityItem {
    colorBg: string
    colorBorder: string
    colorText: string
}

// ============================================================================
// Color Mapping (API doesn't return colors)
// ============================================================================

const colorMapping: Record<string, { colorBg: string; colorBorder: string; colorText: string }> = {
    "urgent-important": {
        colorBg: "bg-error-500/10 hover:bg-error-500/20",
        colorBorder: "border-error-500/20",
        colorText: "text-error-500",
    },
    "important": {
        colorBg: "bg-warning-500/10 hover:bg-warning-500/20",
        colorBorder: "border-warning-500/20",
        colorText: "text-warning-500",
    },
    "urgent": {
        colorBg: "bg-info-500/10 hover:bg-info-500/20",
        colorBorder: "border-info-500/20",
        colorText: "text-info-500",
    },
    "low": {
        colorBg: "bg-muted/50 hover:bg-muted/80",
        colorBorder: "border-muted-foreground/20",
        colorText: "text-muted-foreground",
    },
}

const defaultColors = {
    colorBg: "bg-muted/50 hover:bg-muted/80",
    colorBorder: "border-muted-foreground/20",
    colorText: "text-muted-foreground",
}

// ============================================================================
// Component
// ============================================================================

export async function TaskPriorityMatrix() {
    const taskData = await getTaskPriorityBreakdown()

    // Map API data with colors
    const taskMatrix: MatrixQuadrant[] = taskData.map((item) => ({
        ...item,
        ...(colorMapping[item.filterParam] || defaultColors),
    }))

    const totalTasks = taskMatrix.reduce((sum, q) => sum + q.count, 0)

    return (
        <GlassCard id="priority-matrix" className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-heading font-semibold text-sm leading-none tracking-tight">
                            Task Priority Matrix
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalTasks} tasks across all properties
                        </p>
                    </div>
                </div>
                <Link
                    href="/tasks"
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                    View all tasks
                </Link>
            </div>

            {/* Axis Labels */}
            <div className="relative">
                {/* Y-axis label */}
                <div className="absolute -left-0 top-1/2 -translate-y-1/2 -translate-x-full hidden xl:flex">
                    <span className="text-[10px] text-muted-foreground/60 font-medium -rotate-90 whitespace-nowrap">
                        IMPORTANCE
                    </span>
                </div>

                {/* 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {taskMatrix.map((quadrant) => (
                        <Link
                            key={quadrant.filterParam}
                            href={`/tasks?priority=${quadrant.filterParam}`}
                            className={`
                                group relative p-4 rounded-lg border transition-all duration-200
                                ${quadrant.colorBg}
                                ${quadrant.colorBorder}
                                cursor-pointer
                                hover:scale-[1.02] hover:shadow-md
                                active:scale-[0.98]
                            `}
                        >
                            <p className={`text-sm font-medium ${quadrant.colorText}`}>
                                {quadrant.label}
                            </p>
                            <p className="text-3xl font-bold font-heading mt-2 tracking-tight">
                                {quadrant.count}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                                {quadrant.count === 1 ? "task" : "tasks"}
                            </p>
                        </Link>
                    ))}
                </div>

                {/* X-axis label */}
                <div className="flex justify-center mt-2">
                    <span className="text-[10px] text-muted-foreground/60 font-medium tracking-wider">
                        URGENCY
                    </span>
                </div>
            </div>
        </GlassCard>
    )
}
