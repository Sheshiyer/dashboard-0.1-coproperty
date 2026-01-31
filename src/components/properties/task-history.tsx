"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format, isPast, isToday, differenceInDays } from "date-fns"
import { GlassCard, GlassBadge } from "@/components/ui/glass"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Plus,
  X,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ListTodo,
  Filter,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { PropertyWithDetails, Task } from "@/types/api"

// ============================================================================
// Types
// ============================================================================

type TaskPriority = "low" | "medium" | "high" | "urgent"
type TaskStatus = "pending" | "in_progress" | "completed"
type TaskCategory = "maintenance" | "inspection" | "inventory" | "general"

interface KanbanColumn {
  id: TaskStatus
  title: string
  icon: typeof ListTodo
  color: string
}

interface TaskFormData {
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  assigned_to: string
  due_date: string
}

// ============================================================================
// Constants
// ============================================================================

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "pending", title: "To Do", icon: ListTodo, color: "text-blue-500" },
  { id: "in_progress", title: "In Progress", icon: Clock, color: "text-amber-500" },
  { id: "completed", title: "Completed", icon: CheckCircle2, color: "text-emerald-500" },
]

const PRIORITY_CONFIG: Record<TaskPriority, { dot: string; label: string; bg: string }> = {
  low: { dot: "bg-blue-400", label: "Low", bg: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  medium: { dot: "bg-yellow-400", label: "Medium", bg: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  high: { dot: "bg-red-400", label: "High", bg: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  urgent: { dot: "bg-red-600", label: "Urgent", bg: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200" },
}

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string }> = {
  maintenance: { label: "Maintenance", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  inspection: { label: "Inspection", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  inventory: { label: "Inventory", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" },
  general: { label: "General", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300" },
}

const ASSIGNEES = [
  "Maria Santos",
  "Carlos Rodriguez",
  "Ana Pereira",
  "Pedro Silva",
  "Sofia Costa",
]

// ============================================================================
// Deterministic Mock Data Generator
// ============================================================================

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

function generateMockTasks(propertyId: string): Task[] {
  const seed = hashString(propertyId)
  const random = seededRandom(seed)

  const taskTemplates = [
    { title: "Fix bathroom faucet leak", category: "maintenance" as TaskCategory, desc: "Guest reported a slow drip from the bathroom sink faucet. Needs replacement washer or cartridge." },
    { title: "Replace HVAC filter", category: "maintenance" as TaskCategory, desc: "Quarterly air filter replacement for the main HVAC unit. Use MERV-11 rated filters." },
    { title: "Monthly safety inspection", category: "inspection" as TaskCategory, desc: "Check smoke detectors, fire extinguisher, carbon monoxide detector, and emergency exits." },
    { title: "Restock kitchen essentials", category: "inventory" as TaskCategory, desc: "Replenish coffee pods, sugar, tea bags, cooking oil, salt, and pepper for guests." },
    { title: "Paint touch-up in living room", category: "maintenance" as TaskCategory, desc: "Wall scuffs near the entrance and behind the sofa need touch-up painting." },
    { title: "Update guest welcome book", category: "general" as TaskCategory, desc: "Add new restaurant recommendations and update local transport information." },
    { title: "Check washing machine drain", category: "maintenance" as TaskCategory, desc: "Machine draining slowly. May need drain pump cleaning or hose inspection." },
    { title: "Quarterly linen inventory", category: "inventory" as TaskCategory, desc: "Count and assess condition of all bed sheets, towels, and pillowcases." },
    { title: "Smart lock battery replacement", category: "maintenance" as TaskCategory, desc: "Replace batteries in front door smart lock. Use Duracell AA lithium batteries." },
    { title: "Pre-season AC servicing", category: "inspection" as TaskCategory, desc: "Schedule professional HVAC technician for seasonal maintenance and refrigerant check." },
    { title: "Replace worn bath mat", category: "inventory" as TaskCategory, desc: "Master bathroom mat is fraying. Order replacement matching current color scheme." },
    { title: "Fix squeaky bedroom door", category: "maintenance" as TaskCategory, desc: "Master bedroom door hinge needs lubrication or replacement." },
    { title: "Update WiFi password card", category: "general" as TaskCategory, desc: "Monthly WiFi password rotation. Print new cards for all rooms." },
    { title: "Inspect balcony railing", category: "inspection" as TaskCategory, desc: "Annual safety check on balcony railing stability and corrosion assessment." },
    { title: "Order replacement pillows", category: "inventory" as TaskCategory, desc: "Two guest bedroom pillows are losing firmness. Order hypoallergenic replacements." },
    { title: "Deep clean oven", category: "maintenance" as TaskCategory, desc: "Oven needs professional deep cleaning. Schedule between bookings." },
    { title: "Check window seals", category: "inspection" as TaskCategory, desc: "Inspect all window seals for drafts and water infiltration before rainy season." },
    { title: "Repaint front door", category: "maintenance" as TaskCategory, desc: "Front door paint is peeling. Sand, prime, and apply two coats of exterior paint." },
    { title: "Stock first aid kit", category: "inventory" as TaskCategory, desc: "Restock bandages, antiseptic wipes, pain relievers, and allergy medication." },
    { title: "Set up seasonal decorations", category: "general" as TaskCategory, desc: "Add seasonal decorative elements to living room and entrance area." },
  ]

  const now = new Date()
  const statuses: TaskStatus[] = ["pending", "in_progress", "completed"]
  const priorities: TaskPriority[] = ["low", "medium", "high", "urgent"]

  return taskTemplates.map((template, index) => {
    const r = random
    const statusIdx = index < 6 ? 0 : index < 12 ? 1 : 2
    const status = statuses[statusIdx]
    const priorityIdx = Math.floor(r() * 4)
    const priority = priorities[priorityIdx]
    const assigneeIdx = Math.floor(r() * ASSIGNEES.length)
    const daysOffset = Math.floor(r() * 60) - 20
    const dueDate = new Date(now.getTime() + daysOffset * 86400000)
    const createdDaysAgo = Math.floor(r() * 30) + 5
    const createdAt = new Date(now.getTime() - createdDaysAgo * 86400000)

    return {
      id: `task-${propertyId.slice(0, 8)}-${String(index + 1).padStart(3, "0")}`,
      property_id: propertyId,
      title: template.title,
      description: template.desc,
      category: template.category,
      priority,
      status,
      assigned_to: ASSIGNEES[assigneeIdx],
      due_date: format(dueDate, "yyyy-MM-dd"),
      completed_at: status === "completed" ? format(new Date(now.getTime() - Math.floor(r() * 10) * 86400000), "yyyy-MM-dd'T'HH:mm:ss'Z'") : undefined,
      created_by: "System",
      created_at: format(createdAt, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      updated_at: format(createdAt, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    }
  })
}

// ============================================================================
// Sub-Components
// ============================================================================

function PriorityDot({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${PRIORITY_CONFIG[priority].dot}`}
      title={PRIORITY_CONFIG[priority].label}
    />
  )
}

function AvatarPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
  ]
  const colorIdx = name.length % colors.length

  return (
    <div
      className={`h-7 w-7 rounded-full ${colors[colorIdx]} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}
      title={name}
    >
      {initials}
    </div>
  )
}

function TaskCard({
  task,
  onDragStart,
}: {
  task: Task
  onDragStart: (e: React.DragEvent, taskId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isOverdue =
    task.due_date &&
    task.status !== "completed" &&
    isPast(new Date(task.due_date)) &&
    !isToday(new Date(task.due_date))

  const daysUntilDue = task.due_date
    ? differenceInDays(new Date(task.due_date), new Date())
    : null

  const priority = task.priority as TaskPriority
  const category = task.category as TaskCategory

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, task.id)}
      className={`group cursor-grab active:cursor-grabbing rounded-lg backdrop-blur-xl border transition-all duration-200 hover:shadow-lg ${
        isOverdue
          ? "bg-red-50/80 dark:bg-red-900/20 border-red-300 dark:border-red-500/40 shadow-red-100 dark:shadow-red-900/20"
          : "bg-white/80 dark:bg-white/10 border-white/30 dark:border-white/15 shadow-md shadow-primary/5"
      }`}
    >
      <div className="p-3 space-y-2">
        {/* Header: Drag handle + Priority + Category */}
        <div className="flex items-center gap-2">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          <PriorityDot priority={priority} />
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_CONFIG[category].color}`}
          >
            {CATEGORY_CONFIG[category].label}
          </span>
          {isOverdue && (
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 ml-auto shrink-0" />
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm font-medium text-foreground leading-tight">
          {task.title}
        </h4>

        {/* Expandable Description */}
        {task.description && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            {expanded ? "Hide details" : "Show details"}
          </button>
        )}
        <AnimatePresence>
          {expanded && task.description && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-muted-foreground leading-relaxed overflow-hidden"
            >
              {task.description}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Footer: Assignee + Due Date */}
        <div className="flex items-center justify-between pt-1 border-t border-white/20 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            {task.assigned_to ? (
              <>
                <AvatarPlaceholder name={task.assigned_to} />
                <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">
                  {task.assigned_to.split(" ")[0]}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-muted-foreground italic">
                Unassigned
              </span>
            )}
          </div>

          {task.due_date && (
            <div
              className={`flex items-center gap-1 text-[11px] ${
                isOverdue
                  ? "text-red-600 dark:text-red-400 font-medium"
                  : daysUntilDue !== null && daysUntilDue <= 3
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
              }`}
            >
              <Calendar className="h-3 w-3" />
              {format(new Date(task.due_date), "MMM d")}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function KanbanColumnComponent({
  column,
  tasks,
  onDragStart,
  onDragOver,
  onDrop,
  isDragTarget,
}: {
  column: KanbanColumn
  tasks: Task[]
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: TaskStatus) => void
  isDragTarget: boolean
}) {
  const Icon = column.icon

  return (
    <div
      className={`flex flex-col min-w-[280px] md:min-w-0 rounded-xl backdrop-blur-xl border transition-all duration-200 ${
        isDragTarget
          ? "bg-property-primary/5 dark:bg-property-primary/10 border-property-primary/30 ring-2 ring-property-primary/20"
          : "bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10"
      }`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 p-4 pb-3 border-b border-white/20 dark:border-white/10">
        <Icon className={`h-4 w-4 ${column.color}`} />
        <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
        <GlassBadge className="ml-auto text-[10px] px-2 py-0.5">
          {tasks.length}
        </GlassBadge>
      </div>

      {/* Task List */}
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[calc(100vh-400px)] min-h-[200px]">
        <AnimatePresence mode="popLayout">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onDragStart={onDragStart} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-muted-foreground"
            >
              <ListTodo className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-xs">No tasks</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function CreateTaskModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (data: TaskFormData) => void
}) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
    assigned_to: "",
    due_date: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    onSubmit(formData)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-white/20 shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/20 dark:border-white/10">
          <h2 className="text-lg font-semibold text-foreground">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input
              variant="glass"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              className="flex w-full rounded-md px-3 py-2 text-sm backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-white/30 dark:border-white/20 shadow-lg shadow-primary/5 focus:outline-none focus:bg-white/90 dark:focus:bg-white/15 focus:border-white/40 dark:focus:border-white/25 min-h-[80px] resize-none transition-all duration-200"
              placeholder="Describe the task..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Category + Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v as TaskCategory })}
              >
                <SelectTrigger variant="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}
              >
                <SelectTrigger variant="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee + Due Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Assign To</label>
              <Select
                value={formData.assigned_to}
                onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}
              >
                <SelectTrigger variant="glass">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNEES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Due Date</label>
              <Input
                variant="glass"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              Create Task
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// Quick Stats Component
// ============================================================================

function TaskQuickStats({ tasks }: { tasks: Task[] }) {
  const stats = useMemo(() => {
    const total = tasks.length
    const overdue = tasks.filter(
      (t) =>
        t.due_date &&
        t.status !== "completed" &&
        isPast(new Date(t.due_date)) &&
        !isToday(new Date(t.due_date))
    ).length

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const completedThisMonth = tasks.filter(
      (t) => t.status === "completed" && t.completed_at && new Date(t.completed_at) >= monthStart
    ).length
    const totalNonCompleted = tasks.filter((t) => t.status !== "completed").length
    const completionRate =
      total > 0 ? Math.round((tasks.filter((t) => t.status === "completed").length / total) * 100) : 0

    return { total, overdue, completedThisMonth, totalNonCompleted, completionRate }
  }, [tasks])

  const statItems = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: ListTodo,
      color: "text-property-primary",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      color: stats.overdue > 0 ? "text-red-500" : "text-muted-foreground",
    },
    {
      label: "Completed",
      value: `${stats.completionRate}%`,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: "This Month",
      value: stats.completedThisMonth,
      icon: Calendar,
      color: "text-blue-500",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <GlassCard key={item.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/50 dark:bg-white/5">
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              </div>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

interface TaskHistoryProps {
  property: PropertyWithDetails
}

export function TaskHistory({ property }: TaskHistoryProps) {
  // Generate deterministic mock tasks seeded by property ID
  const initialTasks = useMemo(() => generateMockTasks(property.id), [property.id])

  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [dragTargetColumn, setDragTargetColumn] = useState<TaskStatus | null>(null)

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !task.title.toLowerCase().includes(q) &&
          !(task.description || "").toLowerCase().includes(q)
        ) {
          return false
        }
      }
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false
      if (assigneeFilter !== "all" && task.assigned_to !== assigneeFilter) return false
      return true
    })
  }, [tasks, searchQuery, priorityFilter, assigneeFilter])

  // Group by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      pending: [],
      in_progress: [],
      completed: [],
    }
    filteredTasks.forEach((task) => {
      grouped[task.status as TaskStatus].push(task)
    })
    return grouped
  }, [filteredTasks])

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId)
    e.dataTransfer.effectAllowed = "move"
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent, columnId: TaskStatus) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      if (dragTargetColumn !== columnId) {
        setDragTargetColumn(columnId)
      }
    },
    [dragTargetColumn]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent, newStatus: TaskStatus) => {
      e.preventDefault()
      const taskId = e.dataTransfer.getData("text/plain")
      if (taskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: newStatus,
                  completed_at:
                    newStatus === "completed"
                      ? new Date().toISOString()
                      : undefined,
                }
              : t
          )
        )
      }
      setDragTargetColumn(null)
    },
    []
  )

  const handleDragEnd = useCallback(() => {
    setDragTargetColumn(null)
  }, [])

  // Create task handler
  const handleCreateTask = useCallback(
    (data: TaskFormData) => {
      const now = new Date().toISOString()
      const newTask: Task = {
        id: `task-new-${Date.now()}`,
        property_id: property.id,
        title: data.title,
        description: data.description || undefined,
        category: data.category,
        priority: data.priority,
        status: "pending",
        assigned_to: data.assigned_to || undefined,
        due_date: data.due_date || undefined,
        created_by: "User",
        created_at: now,
        updated_at: now,
      }
      setTasks((prev) => [newTask, ...prev])
    },
    [property.id]
  )

  const activeFilterCount =
    (priorityFilter !== "all" ? 1 : 0) + (assigneeFilter !== "all" ? 1 : 0)

  return (
    <div className="space-y-6" onDragEnd={handleDragEnd}>
      {/* Quick Stats */}
      <TaskQuickStats tasks={tasks} />

      {/* Toolbar: Search + Filters + Create */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              variant="glass"
              placeholder="Search tasks..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-1.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-property-primary text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Create Task Button */}
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Task
          </Button>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-3 border-t border-white/20 dark:border-white/10">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Priority
                  </label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger variant="glass" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Assignee
                  </label>
                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger variant="glass" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      {ASSIGNEES.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setPriorityFilter("all")
                      setAssigneeFilter("all")
                    }}
                    className="text-xs text-property-primary hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Kanban Board */}
      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[860px] md:min-w-0">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id]}
              onDragStart={handleDragStart}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={handleDrop}
              isDragTarget={dragTargetColumn === column.id}
            />
          ))}
        </div>
      </div>

      {/* Empty State when filtered results are empty */}
      {filteredTasks.length === 0 && tasks.length > 0 && (
        <GlassCard className="p-12 text-center">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No matching tasks</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your search query or filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("")
              setPriorityFilter("all")
              setAssigneeFilter("all")
            }}
          >
            Clear all filters
          </Button>
        </GlassCard>
      )}

      {/* Empty State when no tasks at all */}
      {tasks.length === 0 && (
        <GlassCard className="p-12 text-center">
          <ListTodo className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No tasks yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first task to start tracking maintenance and management activities for this
            property.
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create First Task
          </Button>
        </GlassCard>
      )}

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTaskModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateTask}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
