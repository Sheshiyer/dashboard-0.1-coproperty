import { Sparkles, Clock, User } from "lucide-react"
import { GlassCard } from "@/components/ui/glass"
import { Badge } from "@/components/ui/badge"
import { getTodayCleaning, type CleaningJobWithProperty } from "@/lib/data/dashboard"

// ============================================================================
// Types
// ============================================================================

interface CleaningTask {
    property: string
    time: string
    cleaner: string
}

interface CleaningTasks {
    pending: CleaningTask[]
    inProgress: CleaningTask[]
    completed: CleaningTask[]
}

// ============================================================================
// Column Configuration
// ============================================================================

interface ColumnConfig {
    key: keyof CleaningTasks
    label: string
    badgeVariant: "warning" | "default" | "success"
    dotColor: string
}

const columns: ColumnConfig[] = [
    {
        key: "pending",
        label: "Pending",
        badgeVariant: "warning",
        dotColor: "bg-warning-500",
    },
    {
        key: "inProgress",
        label: "In Progress",
        badgeVariant: "default",
        dotColor: "bg-property-primary",
    },
    {
        key: "completed",
        label: "Completed",
        badgeVariant: "success",
        dotColor: "bg-success-500",
    },
]

// ============================================================================
// Helper Functions
// ============================================================================

function formatTime(timeString?: string): string {
    if (!timeString) return "TBD"

    // Handle various time formats
    // If it's already in HH:MM format, convert to 12h
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
        const [hours, minutes] = timeString.split(':').map(Number)
        const period = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
    }

    // If it's an ISO timestamp, extract and format time
    if (timeString.includes('T')) {
        const date = new Date(timeString)
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    return timeString
}

function groupJobsByStatus(jobs: CleaningJobWithProperty[]): CleaningTasks {
    const tasks: CleaningTasks = {
        pending: [],
        inProgress: [],
        completed: [],
    }

    for (const job of jobs) {
        const task: CleaningTask = {
            property: job.property_name,
            time: formatTime(job.scheduled_time),
            cleaner: job.cleaner_name || "Unassigned",
        }

        switch (job.status) {
            case 'pending':
                tasks.pending.push(task)
                break
            case 'in_progress':
                tasks.inProgress.push(task)
                break
            case 'completed':
            case 'verified':
                tasks.completed.push(task)
                break
        }
    }

    return tasks
}

// ============================================================================
// Task Card Sub-Component
// ============================================================================

function CleaningTaskCard({
    task,
    dotColor,
}: {
    task: CleaningTask
    dotColor: string
}) {
    return (
        <GlassCard intensity="light" className="p-3">
            <div className="flex items-start gap-2.5">
                <div
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor}`}
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="text-sm font-medium leading-none truncate">
                        {task.property}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.time}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.cleaner}
                        </span>
                    </div>
                </div>
            </div>
        </GlassCard>
    )
}

// ============================================================================
// Cleaning Schedule Widget (Async Server Component)
// ============================================================================

export async function CleaningSchedule() {
    const jobs = await getTodayCleaning()
    const cleaningTasks = groupJobsByStatus(jobs)

    return (
        <GlassCard id="cleaning" className="p-6">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm leading-none tracking-tight">
                            Today&apos;s Cleaning
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Cleaning task mini-board
                        </p>
                    </div>
                </div>

                {/* 3-Column Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {columns.map((col) => {
                        const tasks = cleaningTasks[col.key]
                        return (
                            <div key={col.key}>
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        {col.label}
                                    </span>
                                    <Badge variant={col.badgeVariant} size="sm">
                                        {tasks.length}
                                    </Badge>
                                </div>

                                {/* Task Cards */}
                                <div className="space-y-2">
                                    {tasks.map((task) => (
                                        <CleaningTaskCard
                                            key={task.property}
                                            task={task}
                                            dotColor={col.dotColor}
                                        />
                                    ))}
                                    {tasks.length === 0 && (
                                        <div className="rounded-lg border border-dashed border-muted-foreground/20 p-4 text-center">
                                            <p className="text-xs text-muted-foreground/50">
                                                No tasks
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </GlassCard>
    )
}
