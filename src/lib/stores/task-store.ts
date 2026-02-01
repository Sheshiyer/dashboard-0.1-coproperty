import { create } from "zustand"
import type { Task } from "@/types/api"

export interface TaskComment {
    id: string
    task_id: string
    author: string
    content: string
    created_at: string
}

export interface TaskFilters {
    status: string[]
    priority: string[]
    assignee: string[]
    property: string[]
    category: string[]
    dateRange: { from?: string; to?: string }
    search: string
}

type ViewMode = "table" | "matrix"

interface TaskStore {
    // Selected task for detail sidebar
    selectedTask: Task | null
    sidebarOpen: boolean
    selectTask: (task: Task | null) => void
    closeSidebar: () => void

    // View mode
    viewMode: ViewMode
    setViewMode: (mode: ViewMode) => void

    // Comments (client-side cache)
    comments: Record<string, TaskComment[]>
    addComment: (taskId: string, author: string, content: string) => void
    setComments: (taskId: string, comments: TaskComment[]) => void

    // Filters
    filters: TaskFilters
    setFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void
    clearFilters: () => void
    hasActiveFilters: () => boolean
}

const defaultFilters: TaskFilters = {
    status: [],
    priority: [],
    assignee: [],
    property: [],
    category: [],
    dateRange: {},
    search: "",
}

export const useTaskStore = create<TaskStore>((set, get) => ({
    // Selected task
    selectedTask: null,
    sidebarOpen: false,
    selectTask: (task) => set({ selectedTask: task, sidebarOpen: !!task }),
    closeSidebar: () => set({ sidebarOpen: false, selectedTask: null }),

    // View mode
    viewMode: "table",
    setViewMode: (mode) => set({ viewMode: mode }),

    // Comments
    comments: {},
    addComment: (taskId, author, content) => {
        const existing = get().comments[taskId] || []
        const newComment: TaskComment = {
            id: crypto.randomUUID(),
            task_id: taskId,
            author,
            content,
            created_at: new Date().toISOString(),
        }
        set({
            comments: {
                ...get().comments,
                [taskId]: [...existing, newComment],
            },
        })
    },
    setComments: (taskId, comments) =>
        set({
            comments: {
                ...get().comments,
                [taskId]: comments,
            },
        }),

    // Filters
    filters: defaultFilters,
    setFilter: (key, value) =>
        set({
            filters: {
                ...get().filters,
                [key]: value,
            },
        }),
    clearFilters: () => set({ filters: defaultFilters }),
    hasActiveFilters: () => {
        const f = get().filters
        return (
            f.status.length > 0 ||
            f.priority.length > 0 ||
            f.assignee.length > 0 ||
            f.property.length > 0 ||
            f.category.length > 0 ||
            !!f.dateRange.from ||
            !!f.dateRange.to ||
            f.search.length > 0
        )
    },
}))
