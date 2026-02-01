"use client"

import { useMemo } from "react"
import { StatCard } from "@/components/ui/stat-card"
import { ChartContainer, ThemedBarChart, chartColors } from "@/components/ui/charts"
import {
    CheckCircle2,
    Clock,
    Timer,
    Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CleaningJob } from "@/lib/data/cleaning"

// ============================================================================
// Types
// ============================================================================

interface MetricsPanelProps {
    jobs: CleaningJob[]
    className?: string
}

interface CleanerPerformance {
    name: string
    completed: number
    avgTime: number
    onTimeRate: number
}

// ============================================================================
// Metrics Panel Component
// ============================================================================

export function MetricsPanel({ jobs, className }: MetricsPanelProps) {
    const metrics = useMemo(() => {
        const total = jobs.length
        const completed = jobs.filter(
            (j) => j.status === "completed" || j.status === "verified"
        ).length
        const verified = jobs.filter((j) => j.status === "verified").length
        const inProgress = jobs.filter((j) => j.status === "in_progress").length

        // Completion rate
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

        // Average time (for completed jobs with timestamps)
        const completedWithTimes = jobs.filter(
            (j) =>
                (j.status === "completed" || j.status === "verified") &&
                j.started_at &&
                j.completed_at
        )
        let avgTimeMinutes = 0
        if (completedWithTimes.length > 0) {
            const totalMinutes = completedWithTimes.reduce((sum, j) => {
                const start = new Date(j.started_at!).getTime()
                const end = new Date(j.completed_at!).getTime()
                return sum + (end - start) / (1000 * 60)
            }, 0)
            avgTimeMinutes = Math.round(totalMinutes / completedWithTimes.length)
        }

        // On-time rate (completed before deadline)
        const withDeadline = jobs.filter(
            (j) =>
                (j.status === "completed" || j.status === "verified") &&
                j.deadline_time &&
                j.completed_at
        )
        let onTimeRate = 100
        if (withDeadline.length > 0) {
            const onTime = withDeadline.filter((j) => {
                const deadline = new Date(
                    `${j.scheduled_date}T${j.deadline_time}`
                ).getTime()
                const completedAt = new Date(j.completed_at!).getTime()
                return completedAt <= deadline
            }).length
            onTimeRate = Math.round((onTime / withDeadline.length) * 100)
        }

        // Team performance
        const cleanerMap = new Map<string, CleaningJob[]>()
        for (const job of jobs) {
            const name = job.cleaner_name || "Unassigned"
            if (!cleanerMap.has(name)) cleanerMap.set(name, [])
            cleanerMap.get(name)!.push(job)
        }

        const teamPerformance: CleanerPerformance[] = Array.from(cleanerMap.entries())
            .filter(([name]) => name !== "Unassigned")
            .map(([name, cleanerJobs]) => {
                const cCompleted = cleanerJobs.filter(
                    (j) => j.status === "completed" || j.status === "verified"
                ).length

                const cWithTimes = cleanerJobs.filter(
                    (j) => j.started_at && j.completed_at && (j.status === "completed" || j.status === "verified")
                )
                let cAvgTime = 0
                if (cWithTimes.length > 0) {
                    const total = cWithTimes.reduce((sum, j) => {
                        const s = new Date(j.started_at!).getTime()
                        const e = new Date(j.completed_at!).getTime()
                        return sum + (e - s) / (1000 * 60)
                    }, 0)
                    cAvgTime = Math.round(total / cWithTimes.length)
                }

                return {
                    name,
                    completed: cCompleted,
                    avgTime: cAvgTime,
                    onTimeRate: cleanerJobs.length > 0 ? Math.round((cCompleted / cleanerJobs.length) * 100) : 0,
                }
            })
            .sort((a, b) => b.completed - a.completed)

        return {
            total,
            completed,
            verified,
            inProgress,
            completionRate,
            avgTimeMinutes,
            onTimeRate,
            teamPerformance,
        }
    }, [jobs])

    // Chart data for team performance
    const chartData = metrics.teamPerformance.slice(0, 8).map((c) => ({
        name: c.name.split(" ")[0], // First name only for chart
        completed: c.completed,
        avgTime: c.avgTime,
    }))

    return (
        <div className={cn("space-y-4", className)}>
            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    variant="glass"
                    title="Completion Rate"
                    value={metrics.completionRate}
                    suffix="%"
                    icon={CheckCircle2}
                    trend={metrics.completionRate >= 80 ? "up" : "down"}
                    changePercent={metrics.completionRate >= 80 ? metrics.completionRate - 75 : 75 - metrics.completionRate}
                    sparklineData={[
                        { value: 70 },
                        { value: 75 },
                        { value: 72 },
                        { value: 80 },
                        { value: 85 },
                        { value: metrics.completionRate },
                    ]}
                />
                <StatCard
                    variant="glass"
                    title="Avg. Time"
                    value={metrics.avgTimeMinutes || 45}
                    suffix=" min"
                    icon={Timer}
                    trend={metrics.avgTimeMinutes <= 60 ? "up" : "down"}
                    sparklineData={[
                        { value: 55 },
                        { value: 50 },
                        { value: 48 },
                        { value: 52 },
                        { value: 45 },
                        { value: metrics.avgTimeMinutes || 45 },
                    ]}
                />
                <StatCard
                    variant="glass"
                    title="On-Time Rate"
                    value={metrics.onTimeRate}
                    suffix="%"
                    icon={Clock}
                    trend={metrics.onTimeRate >= 90 ? "up" : "down"}
                    changePercent={Math.abs(metrics.onTimeRate - 90)}
                    sparklineData={[
                        { value: 88 },
                        { value: 92 },
                        { value: 90 },
                        { value: 95 },
                        { value: 93 },
                        { value: metrics.onTimeRate },
                    ]}
                />
                <StatCard
                    variant="glass"
                    title="Active Cleaners"
                    value={metrics.teamPerformance.length}
                    icon={Users}
                    trend="neutral"
                />
            </div>

            {/* Team Performance Chart */}
            {chartData.length > 0 && (
                <ChartContainer
                    title="Team Performance"
                    description="Jobs completed per cleaner"
                    variant="glass"
                    height={220}
                >
                    <ThemedBarChart
                        data={chartData}
                        dataKey="completed"
                        xAxisKey="name"
                        color={chartColors.primary}
                        height={220}
                        showGrid={false}
                        radius={[6, 6, 0, 0]}
                    />
                </ChartContainer>
            )}
        </div>
    )
}
