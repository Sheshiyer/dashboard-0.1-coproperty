"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    Edit3,
    Loader2,
    MapPin,
    Save,
    Tag,
    Trash2,
    User,
    X,
} from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useTaskStore } from "@/lib/stores/task-store"
import { updateTask as updateTaskAction, deleteTask as deleteTaskAction } from "@/lib/actions/tasks"
import { TaskComments } from "./task-comments"
import type { Task } from "@/types/api"

const statusFlow: Task["status"][] = ["pending", "in_progress", "completed"]

const statusConfig: Record<
    Task["status"],
    { label: string; icon: React.ReactNode; color: string }
> = {
    pending: {
        label: "Pending",
        icon: <Clock className="h-4 w-4" />,
        color: "bg-warning-500/10 text-warning-600 dark:text-warning-500 border-warning-500/20",
    },
    in_progress: {
        label: "In Progress",
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        color: "bg-info-500/10 text-info-600 dark:text-info-500 border-info-500/20",
    },
    completed: {
        label: "Completed",
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "bg-success-500/10 text-success-600 dark:text-success-500 border-success-500/20",
    },
}

const priorityConfig: Record<
    Task["priority"],
    { label: string; color: string }
> = {
    low: { label: "Low", color: "bg-muted text-muted-foreground" },
    medium: { label: "Medium", color: "bg-secondary text-secondary-foreground" },
    high: { label: "High", color: "bg-warning-500/10 text-warning-600 border-warning-500/20" },
    urgent: { label: "Urgent", color: "bg-error-500/10 text-error-600 border-error-500/20" },
}

export function TaskDetailSidebar() {
    const { selectedTask, sidebarOpen, closeSidebar, selectTask } = useTaskStore()
    const [isEditing, setIsEditing] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)
    const [editForm, setEditForm] = React.useState({
        title: "",
        description: "",
        priority: "" as Task["priority"],
        assigned_to: "",
    })

    // Sync form with selected task
    React.useEffect(() => {
        if (selectedTask) {
            setEditForm({
                title: selectedTask.title,
                description: selectedTask.description || "",
                priority: selectedTask.priority,
                assigned_to: selectedTask.assigned_to || "",
            })
            setIsEditing(false)
        }
    }, [selectedTask])

    async function handleStatusChange(newStatus: Task["status"]) {
        if (!selectedTask) return
        setIsSaving(true)
        const result = await updateTaskAction(selectedTask.id, { status: newStatus })
        if (result.success) {
            selectTask({ ...selectedTask, status: newStatus })
        }
        setIsSaving(false)
    }

    async function handleSave() {
        if (!selectedTask) return
        setIsSaving(true)
        const updates: Partial<Task> = {
            title: editForm.title,
            description: editForm.description || undefined,
            priority: editForm.priority,
            assigned_to: editForm.assigned_to || undefined,
        }
        const result = await updateTaskAction(selectedTask.id, updates)
        if (result.success) {
            selectTask({ ...selectedTask, ...updates })
            setIsEditing(false)
        }
        setIsSaving(false)
    }

    async function handleDelete() {
        if (!selectedTask) return
        if (!confirm("Are you sure you want to delete this task?")) return
        setIsSaving(true)
        const result = await deleteTaskAction(selectedTask.id)
        if (result.success) {
            closeSidebar()
        }
        setIsSaving(false)
    }

    function getNextStatus(): Task["status"] | null {
        if (!selectedTask) return null
        const idx = statusFlow.indexOf(selectedTask.status)
        return idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null
    }

    const nextStatus = getNextStatus()

    return (
        <Sheet open={sidebarOpen} onOpenChange={(open) => !open && closeSidebar()}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <AnimatePresence mode="wait">
                    {selectedTask && (
                        <motion.div
                            key={selectedTask.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-6 pt-2"
                        >
                            {/* Header */}
                            <SheetHeader className="space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                    <SheetTitle className="text-xl leading-tight">
                                        {isEditing ? (
                                            <Input
                                                value={editForm.title}
                                                onChange={(e) =>
                                                    setEditForm((f) => ({
                                                        ...f,
                                                        title: e.target.value,
                                                    }))
                                                }
                                                className="text-lg font-semibold"
                                            />
                                        ) : (
                                            selectedTask.title
                                        )}
                                    </SheetTitle>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {isEditing ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setIsEditing(false)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleSave}
                                                    loading={isSaving}
                                                >
                                                    <Save className="h-4 w-4 mr-1" />
                                                    Save
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setIsEditing(true)}
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={handleDelete}
                                                    loading={isSaving}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <SheetDescription>
                                    Created{" "}
                                    {selectedTask.created_at
                                        ? format(new Date(selectedTask.created_at), "MMM d, yyyy")
                                        : "N/A"}
                                </SheetDescription>
                            </SheetHeader>

                            {/* Status workflow */}
                            <div className="space-y-3">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Status
                                </Label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {statusFlow.map((status) => {
                                        const config = statusConfig[status]
                                        const isCurrent = selectedTask.status === status
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(status)}
                                                disabled={isSaving}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                                                    isCurrent
                                                        ? config.color
                                                        : "bg-muted/30 text-muted-foreground border-transparent hover:border-border",
                                                    isCurrent && "ring-2 ring-offset-2 ring-offset-background",
                                                    isCurrent && status === "pending" && "ring-warning-500/30",
                                                    isCurrent && status === "in_progress" && "ring-info-500/30",
                                                    isCurrent && status === "completed" && "ring-success-500/30"
                                                )}
                                            >
                                                {config.icon}
                                                {config.label}
                                            </button>
                                        )
                                    })}
                                </div>
                                {nextStatus && (
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={() => handleStatusChange(nextStatus)}
                                        loading={isSaving}
                                    >
                                        Move to {statusConfig[nextStatus].label}
                                        <ArrowRight className="h-4 w-4 ml-1" />
                                    </Button>
                                )}
                            </div>

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Priority */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <Tag className="h-3 w-3" />
                                        Priority
                                    </Label>
                                    {isEditing ? (
                                        <Select
                                            value={editForm.priority}
                                            onValueChange={(v) =>
                                                setEditForm((f) => ({
                                                    ...f,
                                                    priority: v as Task["priority"],
                                                }))
                                            }
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge
                                            className={cn(
                                                "capitalize",
                                                priorityConfig[selectedTask.priority]?.color
                                            )}
                                        >
                                            {selectedTask.priority}
                                        </Badge>
                                    )}
                                </div>

                                {/* Category */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <Tag className="h-3 w-3" />
                                        Category
                                    </Label>
                                    <Badge variant="outline" className="capitalize">
                                        {selectedTask.category}
                                    </Badge>
                                </div>

                                {/* Assigned to */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        Assigned To
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            value={editForm.assigned_to}
                                            onChange={(e) =>
                                                setEditForm((f) => ({
                                                    ...f,
                                                    assigned_to: e.target.value,
                                                }))
                                            }
                                            className="h-8 text-xs"
                                            placeholder="Assignee name"
                                        />
                                    ) : (
                                        <p className="text-sm">
                                            {selectedTask.assigned_to || "Unassigned"}
                                        </p>
                                    )}
                                </div>

                                {/* Property */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        Property
                                    </Label>
                                    <p className="text-sm">
                                        {selectedTask.properties?.name ||
                                            selectedTask.properties?.internal_code ||
                                            "General"}
                                    </p>
                                </div>

                                {/* Due date */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Due Date
                                    </Label>
                                    <p className="text-sm">
                                        {selectedTask.due_date
                                            ? format(new Date(selectedTask.due_date), "MMM d, yyyy")
                                            : "No due date"}
                                    </p>
                                </div>

                                {/* Completed at */}
                                {selectedTask.completed_at && (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Completed
                                        </Label>
                                        <p className="text-sm">
                                            {format(
                                                new Date(selectedTask.completed_at),
                                                "MMM d, yyyy"
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Description
                                </Label>
                                {isEditing ? (
                                    <Textarea
                                        value={editForm.description}
                                        onChange={(e) =>
                                            setEditForm((f) => ({
                                                ...f,
                                                description: e.target.value,
                                            }))
                                        }
                                        className="min-h-[100px] text-sm"
                                        placeholder="Add a description..."
                                    />
                                ) : (
                                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                                        {selectedTask.description || "No description provided."}
                                    </p>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-border/50" />

                            {/* Comments */}
                            <TaskComments taskId={selectedTask.id} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </SheetContent>
        </Sheet>
    )
}
