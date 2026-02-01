"use client"

import { useState, useCallback, useMemo } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass"
import {
    ChefHat,
    Bath,
    Bed,
    Sofa,
    Trees,
    CheckCircle2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface ChecklistItem {
    id: string
    label: string
    checked: boolean
}

export interface ChecklistCategory {
    id: string
    name: string
    icon: LucideIcon
    items: ChecklistItem[]
}

interface CleaningChecklistDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    jobId: string
    propertyName: string
    initialChecklist?: ChecklistCategory[]
    onSave: (jobId: string, checklist: ChecklistCategory[]) => Promise<void>
}

// ============================================================================
// Default Checklist Template
// ============================================================================

export const DEFAULT_CHECKLIST: ChecklistCategory[] = [
    {
        id: "kitchen",
        name: "Kitchen",
        icon: ChefHat,
        items: [
            { id: "k1", label: "Clean countertops and backsplash", checked: false },
            { id: "k2", label: "Wash and put away dishes", checked: false },
            { id: "k3", label: "Clean stovetop and oven", checked: false },
            { id: "k4", label: "Clean microwave inside and out", checked: false },
            { id: "k5", label: "Wipe refrigerator exterior", checked: false },
            { id: "k6", label: "Empty trash and replace liner", checked: false },
            { id: "k7", label: "Clean sink and faucet", checked: false },
            { id: "k8", label: "Sweep and mop floor", checked: false },
        ],
    },
    {
        id: "bathroom",
        name: "Bathroom",
        icon: Bath,
        items: [
            { id: "b1", label: "Scrub toilet inside and out", checked: false },
            { id: "b2", label: "Clean shower/tub and glass", checked: false },
            { id: "b3", label: "Clean sink and vanity", checked: false },
            { id: "b4", label: "Wipe mirror", checked: false },
            { id: "b5", label: "Replace towels", checked: false },
            { id: "b6", label: "Restock toiletries", checked: false },
            { id: "b7", label: "Empty trash", checked: false },
            { id: "b8", label: "Mop floor", checked: false },
        ],
    },
    {
        id: "bedroom",
        name: "Bedroom",
        icon: Bed,
        items: [
            { id: "br1", label: "Change bed linens", checked: false },
            { id: "br2", label: "Make bed with fresh sheets", checked: false },
            { id: "br3", label: "Dust nightstands and surfaces", checked: false },
            { id: "br4", label: "Empty and wipe drawers", checked: false },
            { id: "br5", label: "Vacuum carpet/mop floor", checked: false },
            { id: "br6", label: "Check under bed", checked: false },
            { id: "br7", label: "Clean mirrors", checked: false },
        ],
    },
    {
        id: "living",
        name: "Living Room",
        icon: Sofa,
        items: [
            { id: "l1", label: "Vacuum/mop floors", checked: false },
            { id: "l2", label: "Dust all surfaces", checked: false },
            { id: "l3", label: "Clean TV screen", checked: false },
            { id: "l4", label: "Fluff and arrange cushions", checked: false },
            { id: "l5", label: "Wipe light switches and handles", checked: false },
            { id: "l6", label: "Clean windows and sills", checked: false },
        ],
    },
    {
        id: "exterior",
        name: "Exterior",
        icon: Trees,
        items: [
            { id: "e1", label: "Sweep entrance/patio", checked: false },
            { id: "e2", label: "Clean outdoor furniture", checked: false },
            { id: "e3", label: "Check exterior lights", checked: false },
            { id: "e4", label: "Empty outdoor trash", checked: false },
            { id: "e5", label: "Lock check all entry points", checked: false },
        ],
    },
]

// ============================================================================
// Progress Indicator (exported for use in job card)
// ============================================================================

interface ChecklistProgressProps {
    checklist?: ChecklistCategory[]
    compact?: boolean
    className?: string
}

export function ChecklistProgress({ checklist, compact = false, className }: ChecklistProgressProps) {
    if (!checklist || checklist.length === 0) return null

    const total = checklist.reduce((sum, cat) => sum + cat.items.length, 0)
    const completed = checklist.reduce(
        (sum, cat) => sum + cat.items.filter((i) => i.checked).length,
        0
    )
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0

    if (compact) {
        return (
            <div className={cn("flex items-center gap-1.5", className)}>
                <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-300",
                            percent === 100
                                ? "bg-success-500"
                                : percent > 50
                                    ? "bg-property-secondary"
                                    : "bg-property-primary"
                        )}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                    {percent}%
                </span>
            </div>
        )
    }

    return (
        <div className={cn("space-y-1", className)}>
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                    {completed}/{total} tasks
                </span>
                <span className="font-medium">{percent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500",
                        percent === 100
                            ? "bg-success-500"
                            : percent > 50
                                ? "bg-property-secondary"
                                : "bg-property-primary"
                    )}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    )
}

// ============================================================================
// Checklist Dialog Component
// ============================================================================

export function CleaningChecklistDialog({
    open,
    onOpenChange,
    jobId,
    propertyName,
    initialChecklist,
    onSave,
}: CleaningChecklistDialogProps) {
    const [checklist, setChecklist] = useState<ChecklistCategory[]>(
        initialChecklist ?? DEFAULT_CHECKLIST
    )
    const [saving, setSaving] = useState(false)
    const [activeCategory, setActiveCategory] = useState<string>(checklist[0]?.id ?? "kitchen")

    const toggleItem = useCallback((categoryId: string, itemId: string) => {
        setChecklist((prev) =>
            prev.map((cat) =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        items: cat.items.map((item) =>
                            item.id === itemId
                                ? { ...item, checked: !item.checked }
                                : item
                        ),
                    }
                    : cat
            )
        )
    }, [])

    const handleSave = useCallback(async () => {
        setSaving(true)
        try {
            await onSave(jobId, checklist)
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to save checklist:", error)
        } finally {
            setSaving(false)
        }
    }, [jobId, checklist, onSave, onOpenChange])

    const stats = useMemo(() => {
        const total = checklist.reduce((sum, cat) => sum + cat.items.length, 0)
        const completed = checklist.reduce(
            (sum, cat) => sum + cat.items.filter((i) => i.checked).length,
            0
        )
        return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
    }, [checklist])

    const activeCat = checklist.find((c) => c.id === activeCategory)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-property-primary" />
                        Cleaning Checklist
                    </DialogTitle>
                    <DialogDescription>{propertyName}</DialogDescription>
                </DialogHeader>

                {/* Overall Progress */}
                <div className="px-1">
                    <ChecklistProgress checklist={checklist} />
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 px-1">
                    {checklist.map((cat) => {
                        const catCompleted = cat.items.filter((i) => i.checked).length
                        const catTotal = cat.items.length
                        const Icon = cat.icon
                        const isActive = activeCategory === cat.id
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                                    isActive
                                        ? "bg-property-primary text-white shadow-md"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {cat.name}
                                <Badge
                                    variant={catCompleted === catTotal ? "success" : "outline"}
                                    size="sm"
                                    className="ml-1"
                                >
                                    {catCompleted}/{catTotal}
                                </Badge>
                            </button>
                        )
                    })}
                </div>

                {/* Checklist Items */}
                <div className="flex-1 overflow-y-auto space-y-2 px-1 min-h-0">
                    {activeCat?.items.map((item) => (
                        <GlassCard
                            key={item.id}
                            intensity="light"
                            className={cn(
                                "flex items-center gap-3 p-3 cursor-pointer transition-all",
                                item.checked && "opacity-60"
                            )}
                            onClick={() => toggleItem(activeCategory, item.id)}
                        >
                            <Checkbox
                                checked={item.checked}
                                onCheckedChange={() => toggleItem(activeCategory, item.id)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <span
                                className={cn(
                                    "text-sm flex-1",
                                    item.checked && "line-through text-muted-foreground"
                                )}
                            >
                                {item.label}
                            </span>
                            {item.checked && (
                                <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0" />
                            )}
                        </GlassCard>
                    ))}
                </div>

                <DialogFooter className="pt-4">
                    <div className="flex items-center gap-2 mr-auto text-sm text-muted-foreground">
                        {stats.percent === 100 ? (
                            <span className="text-success-500 font-medium">All tasks complete!</span>
                        ) : (
                            <span>{stats.completed} of {stats.total} completed</span>
                        )}
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} loading={saving}>
                        {saving ? "Saving..." : "Save Checklist"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
