import { Hono } from 'hono'
import type { Bindings } from '../index'
import { HospitableService } from '../services/hospitable'
import { TurnoService } from '../services/turno'
import type { Task } from './tasks'

const dashboard = new Hono<{ Bindings: Bindings }>()

interface DashboardStats {
    activeReservations: number
    pendingCleaning: number
    taskIssues: number
    totalProperties: number
}

// GET /api/dashboard/stats - Get aggregated dashboard stats
dashboard.get('/stats', async (c) => {
    const hospitable = new HospitableService(c.env)
    const turno = new TurnoService(c.env)
    const kv = c.env.TASKS

    try {
        // Fetch properties first
        const properties = await hospitable.getProperties()
        const propertyIds = properties.map(p => p.id)

        // Fetch reservations for all properties (in batches)
        const batchSize = 10
        const allReservations = []

        for (let i = 0; i < propertyIds.length; i += batchSize) {
            const batch = propertyIds.slice(i, i + batchSize)
            const batchPromises = batch.map(id =>
                hospitable.getReservations({ property_id: id })
                    .catch(() => []) // Ignore errors for individual properties
            )
            const batchResults = await Promise.all(batchPromises)
            allReservations.push(...batchResults.flat())
        }

        // Fetch cleaning jobs and tasks (in parallel with reservations)
        const [cleaningJobs, taskIds] = await Promise.all([
            turno.getCleaningJobs().catch(() => []), // Turno may be blocked by Cloudflare
            kv.get('tasks:index', 'json') as Promise<string[] | null>,
        ])

        // Count active reservations (check-in today or in progress)
        const today = new Date().toISOString().split('T')[0]
        const activeReservations = allReservations.filter(r => {
            return r.check_in_date <= today && r.check_out_date >= today && r.status !== 'cancelled'
        }).length

        // Count pending cleaning jobs
        const pendingCleaning = cleaningJobs.filter(
            j => j.status === 'pending' || j.status === 'in_progress'
        ).length

        // Count high priority tasks
        let taskIssues = 0
        if (taskIds) {
            for (const id of taskIds) {
                const task = await kv.get(`task:${id}`, 'json') as Task | null
                if (task && task.status !== 'completed' && (task.priority === 'high' || task.priority === 'urgent')) {
                    taskIssues++
                }
            }
        }

        const stats: DashboardStats = {
            activeReservations,
            pendingCleaning,
            taskIssues,
            totalProperties: properties.length,
        }

        return c.json({ data: stats })
    } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
        return c.json({ error: 'Failed to fetch dashboard stats' }, 500)
    }
})

// GET /api/dashboard/upcoming - Get upcoming reservations
dashboard.get('/upcoming', async (c) => {
    const hospitable = new HospitableService(c.env)
    const limit = parseInt(c.req.query('limit') || '5')

    try {
        const today = new Date().toISOString().split('T')[0]
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        // Fetch all properties first
        const properties = await hospitable.getProperties()
        const propertyIds = properties.map(p => p.id)

        // Fetch reservations for all properties in parallel (in batches)
        const batchSize = 10
        const allReservations = []

        for (let i = 0; i < propertyIds.length; i += batchSize) {
            const batch = propertyIds.slice(i, i + batchSize)
            const batchPromises = batch.map(id =>
                hospitable.getReservations({
                    from: today,
                    to: nextWeek,
                    property_id: id,
                }).catch(() => []) // Ignore errors for individual properties
            )
            const batchResults = await Promise.all(batchPromises)
            allReservations.push(...batchResults.flat())
        }

        // Sort by check-in date and limit
        const upcoming = allReservations
            .filter(r => r.status !== 'cancelled')
            .sort((a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime())
            .slice(0, limit)

        return c.json({ data: upcoming })
    } catch (err) {
        console.error('Failed to fetch upcoming reservations:', err)
        return c.json({ error: 'Failed to fetch upcoming reservations' }, 500)
    }
})

// GET /api/dashboard/today-cleaning - Get today's cleaning jobs
dashboard.get('/today-cleaning', async (c) => {
    const turno = new TurnoService(c.env)

    try {
        const today = new Date().toISOString().split('T')[0]
        const jobs = await turno.getCleaningJobs({ date: today })

        return c.json({ data: jobs })
    } catch (err) {
        console.error('Failed to fetch today cleaning:', err)
        return c.json({ error: 'Failed to fetch today cleaning' }, 500)
    }
})

export default dashboard
