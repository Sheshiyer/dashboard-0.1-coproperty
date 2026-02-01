"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    X,
    Search,
    SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/ui/date-picker"
import { GlassCard } from "@/components/ui/glass"
import { cn } from "@/lib/utils"
import { useTaskStore, type TaskFilters } from "@/lib/stores/task-store"
import type { Property, Task } from "@/types/api"

const STATUS_OPTIONS: { value: Task["status"]; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
]

const PRIORITY_OPTIONS: { value: Task["priority"]; label: string }[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
]

const CATEGORY_OPTIONS: { value: Task["category"]; label: string }[] = [
    { value: "maintenance", label: "Maintenance" },
    { value: "inspection", label: "Inspection" },
    { value: "inventory", label: "Inventory" },
    { value: "general", label: "General" },
]

interface TaskFilterBarProps {
    tasks: Task[]
    properties: Property[]
    className?: string
}

// Multi-select toggle chip
function FilterChip({
    label,
    active,
    onClick,
}: {
    label: string
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200",
                active
                    ? "bg-property-primary text-white border-property-primary shadow-sm"
                    : "bg-muted/30 text-muted-foreground border-transparent hover:border-border hover:bg-muted/50"
            )}
        >
            {label}
        </button>
    )
}

export function TaskFilterBar({ tasks, properties, className }: TaskFilterBarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { filters, setFilter, clearFilters, hasActiveFilters } = useTaskStore()
    const [expanded, setExpanded] = React.useState(false)

    // Derive unique assignees from tasks
    const assignees = React.useMemo(() => {
        const set = new Set<string>()
        tasks.forEach((t) => {
            if (t.assigned_to) set.add(t.assigned_to)
        })
        return Array.from(set).sort()
    }, [tasks])

    // Sync URL params on mount
    React.useEffect(() => {
        const status = searchParams.get("status")
        const priority = searchParams.get("priority")
        const assignee = searchParams.get("assignee")
        const property = searchParams.get("property")
        const category = searchParams.get("category")
        const search = searchParams.get("search")
        const dateFrom = searchParams.get("dateFrom")
        const dateTo = searchParams.get("dateTo")

        if (status) setFilter("status", status.split(",") as Task["status"][])
        if (priority) setFilter("priority", priority.split(",") as Task["priority"][])
        if (assignee) setFilter("assignee", assignee.split(","))
        if (property) setFilter("property", property.split(","))
        if (category) setFilter("category", category.split(",") as Task["category"][])
        if (search) setFilter("search", search)
        if (dateFrom || dateTo) setFilter("dateRange", { from: dateFrom || undefined, to: dateTo || undefined })
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Persist filters to URL
    React.useEffect(() => {
        const params = new URLSearchParams()
        if (filters.status.length) params.set("status", filters.status.join(","))
        if (filters.priority.length) params.set("priority", filters.priority.join(","))
        if (filters.assignee.length) params.set("assignee", filters.assignee.join(","))
        if (filters.property.length) params.set("property", filters.property.join(","))
        if (filters.category.length) params.set("category", filters.category.join(","))
        if (filters.search) params.set("search", filters.search)
        if (filters.dateRange.from) params.set("dateFrom", filters.dateRange.from)
        if (filters.dateRange.to) params.set("dateTo", filters.dateRange.to)

        const paramString = params.toString()
        const newUrl = paramString ? `?${paramString}` : window.location.pathname
        router.replace(newUrl, { scroll: false })
    }, [filters, router])

    function toggleArrayFilter<K extends keyof TaskFilters>(
        key: K,
        value: string
    ) {
        const current = filters[key] as string[]
        const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value]
        setFilter(key, next as TaskFilters[K])
    }

    const activeFilterCount = [
        filters.status.length,
        filters.priority.length,
        filters.assignee.length,
        filters.property.length,
        filters.category.length,
        filters.dateRange.from || filters.dateRange.to ? 1 : 0,
    ].reduce((a, b) => a + b, 0)

    return (
        <div className={cn("space-y-3", className)}>
            {/* Search + Toggle Row */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        value={filters.search}
                        onChange={(e) => setFilter("search", e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className={cn(
                        "gap-1.5",
                        expanded && "bg-property-primary/5 border-property-primary/30"
                    )}
                >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                    {activeFilterCount > 0 && (
                        <Badge variant="default" size="sm" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
                {hasActiveFilters() && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-foreground gap-1"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <GlassCard intensity="light" className="p-4 space-y-4">
                            {/* Status */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Status
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <FilterChip
                                            key={opt.value}
                                            label={opt.label}
                                            active={filters.status.includes(opt.value)}
                                            onClick={() => toggleArrayFilter("status", opt.value)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Priority */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Priority
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {PRIORITY_OPTIONS.map((opt) => (
                                        <FilterChip
                                            key={opt.value}
                                            label={opt.label}
                                            active={filters.priority.includes(opt.value)}
                                            onClick={() => toggleArrayFilter("priority", opt.value)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Category */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Category
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <FilterChip
                                            key={opt.value}
                                            label={opt.label}
                                            active={filters.category.includes(opt.value)}
                                            onClick={() => toggleArrayFilter("category", opt.value)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Assignee */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Assignee
                                    </label>
                                    {assignees.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {assignees.map((a) => (
                                                <FilterChip
                                                    key={a}
                                                    label={a}
                                                    active={filters.assignee.includes(a)}
                                                    onClick={() => toggleArrayFilter("assignee", a)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">No assignees found</p>
                                    )}
                                </div>

                                {/* Property */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Property
                                    </label>
                                    {properties.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {properties.map((p) => (
                                                <FilterChip
                                                    key={p.id}
                                                    label={p.building_name || p.name || p.internal_code}
                                                    active={filters.property.includes(p.id)}
                                                    onClick={() => toggleArrayFilter("property", p.id)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">No properties found</p>
                                    )}
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Due Date Range
                                </label>
                                <DateRangePicker
                                    from={filters.dateRange.from ? new Date(filters.dateRange.from) : undefined}
                                    to={filters.dateRange.to ? new Date(filters.dateRange.to) : undefined}
                                    onSelect={(range) =>
                                        setFilter("dateRange", {
                                            from: range.from?.toISOString(),
                                            to: range.to?.toISOString(),
                                        })
                                    }
                                    className="max-w-sm"
                                />
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
