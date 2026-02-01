"use client"

import { useState, useMemo, useCallback } from "react"
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard, GlassPanel } from "@/components/ui/glass"
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CleaningJob } from "@/lib/data/cleaning"

// ============================================================================
// Types
// ============================================================================

interface CalendarViewProps {
    jobs: CleaningJob[]
    onDateClick?: (date: Date, jobs: CleaningJob[]) => void
    className?: string
}

// ============================================================================
// Status Color Map
// ============================================================================

const STATUS_COLORS: Record<CleaningJob["status"], { dot: string; bg: string; text: string }> = {
    pending: {
        dot: "bg-yellow-400",
        bg: "bg-yellow-50 dark:bg-yellow-500/10",
        text: "text-yellow-700 dark:text-yellow-300",
    },
    in_progress: {
        dot: "bg-blue-400",
        bg: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-700 dark:text-blue-300",
    },
    completed: {
        dot: "bg-green-400",
        bg: "bg-green-50 dark:bg-green-500/10",
        text: "text-green-700 dark:text-green-300",
    },
    verified: {
        dot: "bg-purple-400",
        bg: "bg-purple-50 dark:bg-purple-500/10",
        text: "text-purple-700 dark:text-purple-300",
    },
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// ============================================================================
// Calendar View Component
// ============================================================================

export function CalendarView({ jobs, onDateClick, className }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)
        const calStart = startOfWeek(monthStart)
        const calEnd = endOfWeek(monthEnd)
        return eachDayOfInterval({ start: calStart, end: calEnd })
    }, [currentMonth])

    // Group jobs by date string
    const jobsByDate = useMemo(() => {
        const map = new Map<string, CleaningJob[]>()
        for (const job of jobs) {
            const dateKey = format(new Date(job.scheduled_date), "yyyy-MM-dd")
            if (!map.has(dateKey)) map.set(dateKey, [])
            map.get(dateKey)!.push(job)
        }
        return map
    }, [jobs])

    const handlePrevMonth = useCallback(() => setCurrentMonth((m) => subMonths(m, 1)), [])
    const handleNextMonth = useCallback(() => setCurrentMonth((m) => addMonths(m, 1)), [])
    const handleToday = useCallback(() => setCurrentMonth(new Date()), [])

    const handleDateClick = useCallback(
        (date: Date) => {
            setSelectedDate(date)
            const dateKey = format(date, "yyyy-MM-dd")
            const dateJobs = jobsByDate.get(dateKey) || []
            onDateClick?.(date, dateJobs)
        },
        [jobsByDate, onDateClick]
    )

    const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null
    const selectedJobs = selectedDateKey ? jobsByDate.get(selectedDateKey) || [] : []

    // Stats for current month
    const monthStats = useMemo(() => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)
        const monthJobs = jobs.filter((j) => {
            const d = new Date(j.scheduled_date)
            return d >= monthStart && d <= monthEnd
        })
        const total = monthJobs.length
        const completed = monthJobs.filter((j) => j.status === "completed" || j.status === "verified").length
        const pending = monthJobs.filter((j) => j.status === "pending").length
        const inProgress = monthJobs.filter((j) => j.status === "in_progress").length
        return { total, completed, pending, inProgress }
    }, [jobs, currentMonth])

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">
                        {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    <div className="flex items-center gap-1">
                        <Badge variant="outline" size="sm">
                            {monthStats.total} jobs
                        </Badge>
                        {monthStats.completed > 0 && (
                            <Badge variant="success" size="sm">
                                {monthStats.completed} done
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleToday}>
                        Today
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 flex-col lg:flex-row">
                {/* Calendar Grid */}
                <GlassPanel intensity="light" className="flex-1 p-4">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {WEEKDAYS.map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs font-medium text-muted-foreground py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Day Cells */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day) => {
                            const dateKey = format(day, "yyyy-MM-dd")
                            const dayJobs = jobsByDate.get(dateKey) || []
                            const inMonth = isSameMonth(day, currentMonth)
                            const today = isToday(day)
                            const selected = selectedDate ? isSameDay(day, selectedDate) : false

                            return (
                                <button
                                    key={dateKey}
                                    onClick={() => handleDateClick(day)}
                                    className={cn(
                                        "relative flex flex-col items-center p-1.5 rounded-lg min-h-[72px] transition-all text-sm",
                                        inMonth ? "text-foreground" : "text-muted-foreground/40",
                                        today && "ring-2 ring-property-primary/50",
                                        selected && "bg-property-primary/10 dark:bg-property-primary/20",
                                        !selected && "hover:bg-muted/50",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                            today && "bg-property-primary text-white",
                                        )}
                                    >
                                        {format(day, "d")}
                                    </span>

                                    {/* Job indicators */}
                                    {dayJobs.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                                            {dayJobs.slice(0, 4).map((job) => (
                                                <span
                                                    key={job.id}
                                                    className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        STATUS_COLORS[job.status]?.dot ?? "bg-gray-400"
                                                    )}
                                                    title={`${job.properties?.building_name || "Job"} - ${job.status}`}
                                                />
                                            ))}
                                            {dayJobs.length > 4 && (
                                                <span className="text-[9px] text-muted-foreground">
                                                    +{dayJobs.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/50">
                        {(Object.entries(STATUS_COLORS) as [CleaningJob["status"], typeof STATUS_COLORS[CleaningJob["status"]]][]).map(
                            ([status, colors]) => (
                                <div key={status} className="flex items-center gap-1.5">
                                    <span className={cn("w-2 h-2 rounded-full", colors.dot)} />
                                    <span className="text-xs text-muted-foreground capitalize">
                                        {status.replace("_", " ")}
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                </GlassPanel>

                {/* Selected Date Detail */}
                {selectedDate && (
                    <GlassPanel intensity="light" className="w-full lg:w-80 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-property-primary" />
                            <h3 className="font-semibold text-sm">
                                {format(selectedDate, "EEEE, MMM d")}
                            </h3>
                        </div>

                        {selectedJobs.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                No jobs scheduled
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {selectedJobs.map((job) => {
                                    const colors = STATUS_COLORS[job.status]
                                    return (
                                        <GlassCard
                                            key={job.id}
                                            intensity="light"
                                            className={cn("p-3 space-y-1", colors?.bg)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium truncate">
                                                    {job.properties?.building_name || "Unknown"}
                                                </span>
                                                <Badge
                                                    variant={job.status === "verified" ? "success" : "outline"}
                                                    size="sm"
                                                >
                                                    {job.status.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            {job.cleaner_name && (
                                                <p className="text-xs text-muted-foreground">
                                                    Cleaner: {job.cleaner_name}
                                                </p>
                                            )}
                                            {job.scheduled_time && (
                                                <p className="text-xs text-muted-foreground">
                                                    Time: {job.scheduled_time}
                                                </p>
                                            )}
                                        </GlassCard>
                                    )
                                })}
                            </div>
                        )}
                    </GlassPanel>
                )}
            </div>
        </div>
    )
}
