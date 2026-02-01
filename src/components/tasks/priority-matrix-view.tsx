"use client"

import * as React from "react"
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core"
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion, AnimatePresence } from "framer-motion"
import { GripVertical, AlertTriangle, Clock, Star, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass"
import { cn } from "@/lib/utils"
import { useTaskStore } from "@/lib/stores/task-store"
import { updateTask } from "@/lib/actions/tasks"
import type { Task } from "@/types/api"

// Map priority + urgency into quadrants
// Quadrant 1: Urgent & Important (urgent, high)
// Quadrant 2: Not Urgent & Important (medium with high importance)
// Quadrant 3: Urgent & Not Important (urgent but low priority tasks)
// Quadrant 4: Not Urgent & Not Important (low)

type Quadrant = "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important"

interface QuadrantConfig {
    id: Quadrant
    title: string
    subtitle: string
    icon: React.ReactNode
    color: string
    bgColor: string
    borderColor: string
}

const quadrants: QuadrantConfig[] = [
    {
        id: "urgent-important",
        title: "Do First",
        subtitle: "Urgent & Important",
        icon: <AlertTriangle className="h-4 w-4" />,
        color: "text-error-600 dark:text-error-500",
        bgColor: "bg-error-50/50 dark:bg-error-500/10",
        borderColor: "border-error-500/30 dark:border-error-500/20",
    },
    {
        id: "not-urgent-important",
        title: "Schedule",
        subtitle: "Not Urgent & Important",
        icon: <Star className="h-4 w-4" />,
        color: "text-info-600 dark:text-info-500",
        bgColor: "bg-info-50/50 dark:bg-info-500/10",
        borderColor: "border-info-500/30 dark:border-info-500/20",
    },
    {
        id: "urgent-not-important",
        title: "Delegate",
        subtitle: "Urgent & Not Important",
        icon: <Clock className="h-4 w-4" />,
        color: "text-warning-600 dark:text-warning-500",
        bgColor: "bg-warning-50/50 dark:bg-warning-500/10",
        borderColor: "border-warning-500/30 dark:border-warning-500/20",
    },
    {
        id: "not-urgent-not-important",
        title: "Eliminate",
        subtitle: "Not Urgent & Not Important",
        icon: <Minus className="h-4 w-4" />,
        color: "text-muted-foreground",
        bgColor: "bg-muted/30 dark:bg-muted/10",
        borderColor: "border-muted-foreground/20",
    },
]

function getQuadrant(task: Task): Quadrant {
    switch (task.priority) {
        case "urgent":
            return "urgent-important"
        case "high":
            return "not-urgent-important"
        case "medium":
            return "urgent-not-important"
        case "low":
        default:
            return "not-urgent-not-important"
    }
}

function getPriorityFromQuadrant(quadrant: Quadrant): Task["priority"] {
    switch (quadrant) {
        case "urgent-important":
            return "urgent"
        case "not-urgent-important":
            return "high"
        case "urgent-not-important":
            return "medium"
        case "not-urgent-not-important":
            return "low"
    }
}

// Sortable task card within quadrant
function SortableTaskCard({ task }: { task: Task }) {
    const { selectTask } = useTaskStore()
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group flex items-center gap-2 rounded-lg border bg-background/80 backdrop-blur-sm p-3 shadow-sm transition-all duration-200",
                "hover:shadow-md hover:border-property-primary/30 cursor-pointer",
                isDragging && "opacity-50 shadow-lg scale-105"
            )}
            onClick={() => selectTask(task)}
        >
            <button
                className="shrink-0 cursor-grab opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity touch-none"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" size="sm" className="capitalize text-[10px]">
                        {task.status.replace("_", " ")}
                    </Badge>
                    {task.properties?.name && (
                        <span className="text-[10px] text-muted-foreground truncate">
                            {task.properties.name}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

// Drag overlay card (shown while dragging)
function TaskDragOverlay({ task }: { task: Task }) {
    return (
        <div className="flex items-center gap-2 rounded-lg border bg-background p-3 shadow-xl">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
            </div>
        </div>
    )
}

// Quadrant drop zone
function QuadrantZone({
    config,
    tasks,
}: {
    config: QuadrantConfig
    tasks: Task[]
}) {
    return (
        <GlassCard
            intensity="light"
            className={cn(
                "flex flex-col p-4 min-h-[200px] transition-all duration-300",
                config.bgColor,
                config.borderColor
            )}
        >
            <div className={cn("flex items-center gap-2 mb-3", config.color)}>
                {config.icon}
                <div>
                    <h3 className="text-sm font-semibold">{config.title}</h3>
                    <p className="text-[10px] opacity-70">{config.subtitle}</p>
                </div>
                <Badge variant="glass" size="sm" className="ml-auto">
                    {tasks.length}
                </Badge>
            </div>
            <SortableContext
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-2 flex-1">
                    <AnimatePresence mode="popLayout">
                        {tasks.map((task) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                layout
                            >
                                <SortableTaskCard task={task} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {tasks.length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground/50 border-2 border-dashed border-muted-foreground/10 rounded-lg min-h-[80px]">
                            Drop tasks here
                        </div>
                    )}
                </div>
            </SortableContext>
        </GlassCard>
    )
}

interface PriorityMatrixViewProps {
    tasks: Task[]
}

export function PriorityMatrixView({ tasks }: PriorityMatrixViewProps) {
    const [activeTask, setActiveTask] = React.useState<Task | null>(null)
    const [localTasks, setLocalTasks] = React.useState(tasks)

    React.useEffect(() => {
        setLocalTasks(tasks)
    }, [tasks])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    )

    // Group tasks by quadrant
    const groupedTasks = React.useMemo(() => {
        const groups: Record<Quadrant, Task[]> = {
            "urgent-important": [],
            "not-urgent-important": [],
            "urgent-not-important": [],
            "not-urgent-not-important": [],
        }
        localTasks.forEach((task) => {
            const q = getQuadrant(task)
            groups[q].push(task)
        })
        return groups
    }, [localTasks])

    function handleDragStart(event: DragStartEvent) {
        const task = localTasks.find((t) => t.id === event.active.id)
        setActiveTask(task || null)
    }

    async function handleDragEnd(event: DragEndEvent) {
        setActiveTask(null)
        const { active, over } = event
        if (!over || active.id === over.id) return

        const draggedTask = localTasks.find((t) => t.id === active.id)
        if (!draggedTask) return

        // Find which quadrant the over item belongs to
        const overTask = localTasks.find((t) => t.id === over.id)
        if (!overTask) return

        const targetQuadrant = getQuadrant(overTask)
        const sourceQuadrant = getQuadrant(draggedTask)

        if (targetQuadrant !== sourceQuadrant) {
            const newPriority = getPriorityFromQuadrant(targetQuadrant)

            // Optimistically update local state
            setLocalTasks((prev) =>
                prev.map((t) =>
                    t.id === draggedTask.id ? { ...t, priority: newPriority } : t
                )
            )

            // Update on server
            await updateTask(draggedTask.id, { priority: newPriority })
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quadrants.map((q) => (
                    <QuadrantZone
                        key={q.id}
                        config={q}
                        tasks={groupedTasks[q.id]}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeTask ? <TaskDragOverlay task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    )
}
