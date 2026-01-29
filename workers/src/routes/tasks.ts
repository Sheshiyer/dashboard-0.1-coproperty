import { Hono } from 'hono'
import type { Bindings } from '../index'

export interface Task {
    id: string
    property_id?: string
    reservation_id?: string
    title: string
    description?: string
    category: 'maintenance' | 'inspection' | 'inventory' | 'general'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'pending' | 'in_progress' | 'completed'
    assigned_to?: string
    due_date?: string
    completed_at?: string
    created_by: string
    created_at: string
    updated_at: string
}

const tasks = new Hono<{ Bindings: Bindings }>()

// Helper to get tasks index
async function getTaskIds(kv: KVNamespace): Promise<string[]> {
    const index = await kv.get('tasks:index', 'json')
    return (index as string[]) || []
}

// Helper to update tasks index
async function updateTaskIndex(kv: KVNamespace, ids: string[]): Promise<void> {
    await kv.put('tasks:index', JSON.stringify(ids))
}

// GET /api/tasks - List all tasks
tasks.get('/', async (c) => {
    const kv = c.env.TASKS

    try {
        const ids = await getTaskIds(kv)
        const tasksData: Task[] = []

        for (const id of ids) {
            const task = await kv.get(`task:${id}`, 'json')
            if (task) {
                tasksData.push(task as Task)
            }
        }

        // Filter by query params
        const status = c.req.query('status')
        const priority = c.req.query('priority')
        const propertyId = c.req.query('property_id')

        let filtered = tasksData
        if (status) {
            filtered = filtered.filter(t => t.status === status)
        }
        if (priority) {
            filtered = filtered.filter(t => t.priority === priority)
        }
        if (propertyId) {
            filtered = filtered.filter(t => t.property_id === propertyId)
        }

        // Sort by priority (urgent first) then by created_at
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        filtered.sort((a, b) => {
            const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
            if (pDiff !== 0) return pDiff
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        return c.json({ data: filtered, count: filtered.length })
    } catch (err) {
        console.error('Failed to fetch tasks:', err)
        return c.json({ error: 'Failed to fetch tasks' }, 500)
    }
})

// GET /api/tasks/:id - Get single task
tasks.get('/:id', async (c) => {
    const id = c.req.param('id')
    const kv = c.env.TASKS

    try {
        const task = await kv.get(`task:${id}`, 'json')
        if (!task) {
            return c.json({ error: 'Task not found' }, 404)
        }
        return c.json({ data: task })
    } catch (err) {
        console.error('Failed to fetch task:', err)
        return c.json({ error: 'Failed to fetch task' }, 500)
    }
})

// POST /api/tasks - Create new task
tasks.post('/', async (c) => {
    const kv = c.env.TASKS

    try {
        const body = await c.req.json<Partial<Task>>()

        // Validate required fields
        if (!body.title) {
            return c.json({ error: 'Title is required' }, 400)
        }

        const now = new Date().toISOString()
        const id = crypto.randomUUID()

        const task: Task = {
            id,
            title: body.title,
            description: body.description,
            property_id: body.property_id,
            reservation_id: body.reservation_id,
            category: body.category || 'general',
            priority: body.priority || 'medium',
            status: 'pending',
            assigned_to: body.assigned_to,
            due_date: body.due_date,
            created_by: 'system',
            created_at: now,
            updated_at: now,
        }

        // Save task
        await kv.put(`task:${id}`, JSON.stringify(task))

        // Update index
        const ids = await getTaskIds(kv)
        ids.push(id)
        await updateTaskIndex(kv, ids)

        return c.json({ data: task }, 201)
    } catch (err) {
        console.error('Failed to create task:', err)
        return c.json({ error: 'Failed to create task' }, 500)
    }
})

// PATCH /api/tasks/:id - Update task
tasks.patch('/:id', async (c) => {
    const id = c.req.param('id')
    const kv = c.env.TASKS

    try {
        const existing = await kv.get(`task:${id}`, 'json') as Task | null
        if (!existing) {
            return c.json({ error: 'Task not found' }, 404)
        }

        const body = await c.req.json<Partial<Task>>()
        const now = new Date().toISOString()

        const updated: Task = {
            ...existing,
            ...body,
            id: existing.id, // Prevent ID change
            created_at: existing.created_at, // Preserve
            created_by: existing.created_by, // Preserve
            updated_at: now,
        }

        // Set completed_at if status changed to completed
        if (body.status === 'completed' && existing.status !== 'completed') {
            updated.completed_at = now
        }

        await kv.put(`task:${id}`, JSON.stringify(updated))

        return c.json({ data: updated })
    } catch (err) {
        console.error('Failed to update task:', err)
        return c.json({ error: 'Failed to update task' }, 500)
    }
})

// DELETE /api/tasks/:id - Delete task
tasks.delete('/:id', async (c) => {
    const id = c.req.param('id')
    const kv = c.env.TASKS

    try {
        const existing = await kv.get(`task:${id}`)
        if (!existing) {
            return c.json({ error: 'Task not found' }, 404)
        }

        // Delete task
        await kv.delete(`task:${id}`)

        // Update index
        const ids = await getTaskIds(kv)
        const updated = ids.filter(i => i !== id)
        await updateTaskIndex(kv, updated)

        return c.json({ success: true })
    } catch (err) {
        console.error('Failed to delete task:', err)
        return c.json({ error: 'Failed to delete task' }, 500)
    }
})

export default tasks
