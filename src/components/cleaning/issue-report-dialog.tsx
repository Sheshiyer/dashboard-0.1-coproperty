"use client"

import { useState, useCallback, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    AlertTriangle,
    Camera,
    X,
    Wrench,
    Package,
    HelpCircle,
    ShieldAlert,
    AlertCircle,
    Info,
    Flame,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export type IssueType = "damage" | "missing_items" | "maintenance" | "other"
export type IssueSeverity = "low" | "medium" | "high" | "critical"

export interface CleaningIssue {
    id: string
    jobId: string
    propertyId: string
    type: IssueType
    severity: IssueSeverity
    title: string
    description: string
    photos: string[]  // base64 data URLs
    reportedBy?: string
    reportedAt: string
    status: "open" | "acknowledged" | "resolved"
}

interface IssueReportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    jobId: string
    propertyId: string
    propertyName: string
    onSubmit: (issue: Omit<CleaningIssue, "id" | "status">) => Promise<void>
}

// ============================================================================
// Constants
// ============================================================================

const ISSUE_TYPES: { value: IssueType; label: string; icon: LucideIcon; description: string }[] = [
    {
        value: "damage",
        label: "Damage",
        icon: AlertTriangle,
        description: "Broken, scratched, or damaged items",
    },
    {
        value: "missing_items",
        label: "Missing Items",
        icon: Package,
        description: "Amenities, linens, or supplies missing",
    },
    {
        value: "maintenance",
        label: "Maintenance Needed",
        icon: Wrench,
        description: "Repairs or upkeep required",
    },
    {
        value: "other",
        label: "Other",
        icon: HelpCircle,
        description: "General issue or observation",
    },
]

const SEVERITY_LEVELS: {
    value: IssueSeverity
    label: string
    icon: LucideIcon
    color: string
    bgColor: string
    description: string
}[] = [
    {
        value: "low",
        label: "Low",
        icon: Info,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
        description: "Minor issue, no impact on guest experience",
    },
    {
        value: "medium",
        label: "Medium",
        icon: AlertCircle,
        color: "text-warning-600 dark:text-warning-400",
        bgColor: "bg-warning-50 dark:bg-warning-500/10 border-warning-200 dark:border-warning-500/20",
        description: "Should be addressed before next guest",
    },
    {
        value: "high",
        label: "High",
        icon: ShieldAlert,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20",
        description: "Needs immediate attention, creates task automatically",
    },
    {
        value: "critical",
        label: "Critical",
        icon: Flame,
        color: "text-error-600 dark:text-error-400",
        bgColor: "bg-error-50 dark:bg-error-500/10 border-error-200 dark:border-error-500/20",
        description: "Property cannot be used, urgent task created",
    },
]

// ============================================================================
// Issue Count Badge (exported for job card)
// ============================================================================

interface IssueCountBadgeProps {
    issues: string[]
    className?: string
}

export function IssueCountBadge({ issues, className }: IssueCountBadgeProps) {
    if (!issues || issues.length === 0) return null
    return (
        <div className={cn("flex items-center gap-1", className)}>
            <AlertTriangle className="h-3 w-3 text-warning-500" />
            <span className="text-[10px] text-warning-600 dark:text-warning-400 font-medium tabular-nums">
                {issues.length}
            </span>
        </div>
    )
}

// ============================================================================
// Issue Report Dialog
// ============================================================================

export function IssueReportDialog({
    open,
    onOpenChange,
    jobId,
    propertyId,
    propertyName,
    onSubmit,
}: IssueReportDialogProps) {
    const [issueType, setIssueType] = useState<IssueType | null>(null)
    const [severity, setSeverity] = useState<IssueSeverity | null>(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [photos, setPhotos] = useState<string[]>([])
    const [submitting, setSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const isHighSeverity = severity === "high" || severity === "critical"

    const handleFileSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files
            if (!files) return

            for (const file of Array.from(files)) {
                if (!file.type.startsWith("image/")) continue
                if (file.size > 10 * 1024 * 1024) continue

                const dataUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader()
                    reader.onload = () => resolve(reader.result as string)
                    reader.readAsDataURL(file)
                })
                setPhotos((prev) => [...prev, dataUrl])
            }

            if (fileInputRef.current) fileInputRef.current.value = ""
        },
        []
    )

    const removePhoto = useCallback((idx: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== idx))
    }, [])

    const handleSubmit = useCallback(async () => {
        if (!issueType || !severity || !title.trim()) return

        setSubmitting(true)
        try {
            await onSubmit({
                jobId,
                propertyId,
                type: issueType,
                severity,
                title: title.trim(),
                description: description.trim(),
                photos,
                reportedAt: new Date().toISOString(),
            })

            // Reset form
            setIssueType(null)
            setSeverity(null)
            setTitle("")
            setDescription("")
            setPhotos([])
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to submit issue:", error)
        } finally {
            setSubmitting(false)
        }
    }, [issueType, severity, title, description, photos, jobId, propertyId, onSubmit, onOpenChange])

    const isValid = issueType && severity && title.trim().length > 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning-500" />
                        Report Issue
                    </DialogTitle>
                    <DialogDescription>{propertyName}</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 px-1 min-h-0">
                    {/* Issue Type */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Issue Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {ISSUE_TYPES.map((type) => {
                                const Icon = type.icon
                                const isSelected = issueType === type.value
                                return (
                                    <button
                                        key={type.value}
                                        onClick={() => setIssueType(type.value)}
                                        className={cn(
                                            "flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all text-sm",
                                            isSelected
                                                ? "border-property-primary bg-property-primary/5 dark:bg-property-primary/10"
                                                : "border-input hover:border-property-primary/50 hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className={cn("h-4 w-4", isSelected ? "text-property-primary" : "text-muted-foreground")} />
                                            <span className="font-medium">{type.label}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{type.description}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Severity */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Severity</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {SEVERITY_LEVELS.map((level) => {
                                const Icon = level.icon
                                const isSelected = severity === level.value
                                return (
                                    <button
                                        key={level.value}
                                        onClick={() => setSeverity(level.value)}
                                        className={cn(
                                            "flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all text-sm",
                                            isSelected
                                                ? cn(level.bgColor)
                                                : "border-input hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className={cn("h-4 w-4", isSelected ? level.color : "text-muted-foreground")} />
                                            <span className="font-medium">{level.label}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{level.description}</span>
                                    </button>
                                )
                            })}
                        </div>
                        {isHighSeverity && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-warning-50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-500/20">
                                <AlertTriangle className="h-4 w-4 text-warning-500 shrink-0" />
                                <p className="text-xs text-warning-700 dark:text-warning-300">
                                    A task will be automatically created in the Tasks module for this issue.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="issue-title" className="text-sm font-medium">
                            Title
                        </Label>
                        <input
                            id="issue-title"
                            type="text"
                            placeholder="Brief description of the issue"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-property-primary focus:ring-offset-2"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="issue-desc" className="text-sm font-medium">
                            Details (optional)
                        </Label>
                        <Textarea
                            id="issue-desc"
                            placeholder="Describe the issue in more detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Photo Attachments */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Photos (optional)</Label>
                        {photos.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {photos.map((photo, idx) => (
                                    <div key={idx} className="relative group w-16 h-16">
                                        <img
                                            src={photo}
                                            alt={`Issue photo ${idx + 1}`}
                                            className="w-full h-full object-cover rounded-lg border"
                                        />
                                        <button
                                            onClick={() => removePhoto(idx)}
                                            aria-label={`Remove photo ${idx + 1}`}
                                            className="absolute -top-1.5 -right-1.5 bg-error-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            aria-label="Upload issue photos"
                            tabIndex={-1}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Camera className="h-4 w-4" />
                            Attach Photos
                        </Button>
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant={isHighSeverity ? "destructive" : "default"}
                        onClick={handleSubmit}
                        disabled={!isValid}
                        loading={submitting}
                    >
                        {submitting
                            ? "Submitting..."
                            : isHighSeverity
                                ? "Report & Create Task"
                                : "Report Issue"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
