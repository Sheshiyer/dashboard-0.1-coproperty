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
    occupancyRate: number
    totalRevenue: number
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

        // Calculate occupancy rate for current month
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        const daysInMonth = endOfMonth.getDate()

        let totalOccupiedNights = 0
        const totalAvailableNights = properties.length * daysInMonth

        allReservations.forEach(reservation => {
            if (reservation.status !== 'cancelled') {
                const checkIn = new Date(reservation.check_in_date)
                const checkOut = new Date(reservation.check_out_date)

                // Calculate overlap with current month
                const overlapStart = checkIn > startOfMonth ? checkIn : startOfMonth
                const overlapEnd = checkOut < endOfMonth ? checkOut : endOfMonth

                if (overlapStart < overlapEnd) {
                    const nights = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24))
                    totalOccupiedNights += nights
                }
            }
        })

        const occupancyRate = totalAvailableNights > 0
            ? Math.round((totalOccupiedNights / totalAvailableNights) * 1000) / 10 // Round to 1 decimal
            : 0

        // Calculate total revenue for last 30 days
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        let totalRevenue = 0
        allReservations.forEach(reservation => {
            if (reservation.status !== 'cancelled') {
                const checkIn = new Date(reservation.check_in_date)
                const checkOut = new Date(reservation.check_out_date)

                // Include if reservation overlaps with last 30 days
                if (checkOut >= thirtyDaysAgo && checkIn <= now) {
                    totalRevenue += reservation.total_price || 0
                }
            }
        })

        const stats: DashboardStats = {
            activeReservations,
            pendingCleaning,
            taskIssues,
            totalProperties: properties.length,
            occupancyRate,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
        }

        return c.json({ data: stats })
    } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
        return c.json({ error: 'Failed to fetch dashboard stats' }, 500)
    }
})

// GET /api/dashboard/upcoming - Get upcoming reservations with property info
dashboard.get('/upcoming', async (c) => {
    const hospitable = new HospitableService(c.env)
    const limit = parseInt(c.req.query('limit') || '50')

    try {
        const today = new Date().toISOString().split('T')[0]
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        // Fetch all properties first
        const properties = await hospitable.getProperties()
        const propertyMap = new Map(properties.map(p => [p.id, p]))
        const propertyIds = properties.map(p => p.id)

        // Fetch reservations for all properties in parallel (in batches)
        const batchSize = 10
        const allReservations: Array<{
            id: string
            property_id: string
            guest_name: string
            check_in_date: string
            check_out_date: string
            platform: string
            status: string
            property_name: string
            check_in_time: string
        }> = []

        for (let i = 0; i < propertyIds.length; i += batchSize) {
            const batch = propertyIds.slice(i, i + batchSize)
            const batchPromises = batch.map(id =>
                hospitable.getReservations({
                    from: today,
                    to: nextWeek,
                    property_id: id,
                }).then(reservations =>
                    reservations.map(r => {
                        const property = propertyMap.get(id)
                        return {
                            id: r.id,
                            property_id: id,
                            guest_name: r.guest_name,
                            check_in_date: r.check_in_date,
                            check_out_date: r.check_out_date,
                            platform: r.platform,
                            status: r.status,
                            property_name: property?.name || 'Unknown Property',
                            check_in_time: property?.check_in_time || '3:00 PM'
                        }
                    })
                ).catch(() => []) // Ignore errors for individual properties
            )
            const batchResults = await Promise.all(batchPromises)
            allReservations.push(...batchResults.flat())
        }

        // Sort by check-in date, filter for future check-ins only
        const upcoming = allReservations
            .filter(r => r.status !== 'cancelled' && r.check_in_date >= today)
            .sort((a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime())
            .slice(0, limit)

        return c.json({ data: upcoming })
    } catch (err) {
        console.error('Failed to fetch upcoming reservations:', err)
        return c.json({ error: 'Failed to fetch upcoming reservations' }, 500)
    }
})

// GET /api/dashboard/today-cleaning - Get today's cleaning jobs with property names
dashboard.get('/today-cleaning', async (c) => {
    const hospitable = new HospitableService(c.env)
    const turno = new TurnoService(c.env)

    try {
        const today = new Date().toISOString().split('T')[0]

        // Fetch properties and cleaning jobs in parallel
        const [properties, jobs] = await Promise.all([
            hospitable.getProperties(),
            turno.getCleaningJobs({ date: today })
        ])

        // Build property lookup map
        const propertyMap = new Map(properties.map(p => [p.id, p]))

        // Enrich jobs with property names
        const enrichedJobs = jobs.map(job => ({
            ...job,
            property_name: propertyMap.get(job.property_id)?.name || 'Unknown Property'
        }))

        return c.json({ data: enrichedJobs })
    } catch (err) {
        console.error('Failed to fetch today cleaning:', err)
        return c.json({ error: 'Failed to fetch today cleaning' }, 500)
    }
})

// GET /api/dashboard/occupancy-trends?days=30
dashboard.get('/occupancy-trends', async (c) => {
    const hospitable = new HospitableService(c.env)
    const days = parseInt(c.req.query('days') || '30')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)

    // Fetch properties and reservations
    const properties = await hospitable.getProperties()
    const totalProperties = properties.length
    const propertyIds = properties.map(p => p.id)

    // Fetch all reservations in batches
    const batchSize = 10
    const allReservations = []

    for (let i = 0; i < propertyIds.length; i += batchSize) {
        const batch = propertyIds.slice(i, i + batchSize)
        const batchPromises = batch.map(id =>
            hospitable.getReservations({ property_id: id })
                .catch(() => [])
        )
        const batchResults = await Promise.all(batchPromises)
        allReservations.push(...batchResults.flat())
    }

    // Build daily occupancy map
    const dailyOccupied = new Map<string, Set<string>>()

    // Initialize all days in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0]
        dailyOccupied.set(dateKey, new Set())
    }

    // Track which properties are occupied each day
    allReservations.forEach(reservation => {
        if (reservation.status !== 'cancelled') {
            const checkIn = new Date(reservation.check_in_date)
            const checkOut = new Date(reservation.check_out_date)

            for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
                const dateKey = d.toISOString().split('T')[0]
                if (dailyOccupied.has(dateKey)) {
                    dailyOccupied.get(dateKey)!.add(reservation.property_id)
                }
            }
        }
    })

    // Convert to percentage rates
    const result = Array.from(dailyOccupied.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([dateStr, occupiedProperties]) => {
            const date = new Date(dateStr)
            const month = date.toLocaleString('en-US', { month: 'short' })
            const day = date.getDate().toString().padStart(2, '0')
            const rate = totalProperties > 0
                ? Math.round((occupiedProperties.size / totalProperties) * 100 * 10) / 10
                : 0

            return {
                date: `${month} ${day}`,
                rate
            }
        })

    return c.json({ data: result })
})

// GET /api/dashboard/booking-sources
dashboard.get('/booking-sources', async (c) => {
    const hospitable = new HospitableService(c.env)

    // Fetch properties and reservations
    const properties = await hospitable.getProperties()
    const propertyIds = properties.map(p => p.id)

    // Fetch all reservations in batches
    const batchSize = 10
    const allReservations = []

    for (let i = 0; i < propertyIds.length; i += batchSize) {
        const batch = propertyIds.slice(i, i + batchSize)
        const batchPromises = batch.map(id =>
            hospitable.getReservations({ property_id: id })
                .catch(() => [])
        )
        const batchResults = await Promise.all(batchPromises)
        allReservations.push(...batchResults.flat())
    }

    // Group by platform
    const sourceMap = new Map<string, { count: number, revenue: number }>()

    allReservations.forEach(reservation => {
        if (reservation.status !== 'cancelled') {
            const platform = reservation.platform || 'Direct'

            if (!sourceMap.has(platform)) {
                sourceMap.set(platform, { count: 0, revenue: 0 })
            }

            const source = sourceMap.get(platform)!
            source.count++
            source.revenue += reservation.total_price
        }
    })

    // Convert to array and sort by count
    const result = Array.from(sourceMap.entries())
        .map(([name, data]) => ({
            name,
            value: data.count,
            revenue: Math.round(data.revenue * 100) / 100
        }))
        .sort((a, b) => b.value - a.value)

    return c.json({ data: result })
})

// GET /api/dashboard/revenue-trends?days=7|30|90
dashboard.get('/revenue-trends', async (c) => {
    const hospitable = new HospitableService(c.env)
    const days = parseInt(c.req.query('days') || '30')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)

    // Fetch properties and reservations
    const properties = await hospitable.getProperties()
    const propertyIds = properties.map(p => p.id)

    // Fetch all reservations in batches
    const batchSize = 10
    const allReservations = []

    for (let i = 0; i < propertyIds.length; i += batchSize) {
        const batch = propertyIds.slice(i, i + batchSize)
        const batchPromises = batch.map(id =>
            hospitable.getReservations({ property_id: id })
                .catch(() => [])
        )
        const batchResults = await Promise.all(batchPromises)
        allReservations.push(...batchResults.flat())
    }

    // Build daily revenue map
    const dailyData = new Map<string, { revenue: number, payout: number }>()

    // Initialize all days in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0]
        dailyData.set(dateKey, { revenue: 0, payout: 0 })
    }

    // Aggregate revenue for each day
    allReservations.forEach(reservation => {
        const checkIn = new Date(reservation.check_in_date)
        const checkOut = new Date(reservation.check_out_date)
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

        if (nights > 0 && reservation.status !== 'cancelled') {
            const revenuePerNight = reservation.total_price / nights
            const payoutPerNight = reservation.payout_amount / nights

            // Distribute revenue across nights
            for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
                const dateKey = d.toISOString().split('T')[0]
                if (dailyData.has(dateKey)) {
                    const day = dailyData.get(dateKey)!
                    day.revenue += revenuePerNight
                    day.payout += payoutPerNight
                }
            }
        }
    })

    // Convert to sorted array
    const result = Array.from(dailyData.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, data]) => ({
            date,
            revenue: Math.round(data.revenue * 100) / 100,
            payout: Math.round(data.payout * 100) / 100
        }))

    return c.json({ data: result })
})

// GET /api/dashboard/property-performance?limit=5&period=30
dashboard.get('/property-performance', async (c) => {
    const hospitable = new HospitableService(c.env)
    const limit = parseInt(c.req.query('limit') || '5')
    const period = parseInt(c.req.query('period') || '30')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - period)

    // Fetch properties and reservations
    const properties = await hospitable.getProperties()
    const propertyIds = properties.map(p => p.id)

    // Fetch all reservations in batches
    const batchSize = 10
    const allReservations = []

    for (let i = 0; i < propertyIds.length; i += batchSize) {
        const batch = propertyIds.slice(i, i + batchSize)
        const batchPromises = batch.map(id =>
            hospitable.getReservations({ property_id: id })
                .catch(() => [])
        )
        const batchResults = await Promise.all(batchPromises)
        allReservations.push(...batchResults.flat())
    }

    // Build performance map by property
    const performanceMap = new Map<string, { revenue: number, bookings: number }>()

    // Initialize for all properties
    properties.forEach(property => {
        performanceMap.set(property.id, { revenue: 0, bookings: 0 })
    })

    // Aggregate revenue and booking counts
    allReservations.forEach(reservation => {
        if (reservation.status !== 'cancelled') {
            const checkIn = new Date(reservation.check_in_date)
            const checkOut = new Date(reservation.check_out_date)

            // Check if reservation overlaps with our period
            if (checkOut >= startDate && checkIn <= endDate) {
                const perf = performanceMap.get(reservation.property_id)
                if (perf) {
                    perf.revenue += reservation.total_price
                    perf.bookings++
                }
            }
        }
    })

    // Convert to array with property names and sort by revenue
    const result = Array.from(performanceMap.entries())
        .map(([propertyId, data]) => {
            const property = properties.find(p => p.id === propertyId)
            return {
                name: property?.name || 'Unknown',
                revenue: Math.round(data.revenue * 100) / 100,
                bookings: data.bookings
            }
        })
        .filter(item => item.revenue > 0) // Only include properties with revenue
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit)

    return c.json({ data: result })
})

// GET /api/dashboard/task-priority-breakdown
dashboard.get('/task-priority-breakdown', async (c) => {
    const kv = c.env.TASKS

    try {
        const taskIds = await kv.get('tasks:index', 'json') as string[] | null

        if (!taskIds || taskIds.length === 0) {
            return c.json({
                data: [
                    { label: 'Urgent + Important', count: 0, filterParam: 'urgent-important' },
                    { label: 'Important', count: 0, filterParam: 'important' },
                    { label: 'Urgent', count: 0, filterParam: 'urgent' },
                    { label: 'Low Priority', count: 0, filterParam: 'low' }
                ]
            })
        }

        // Fetch all tasks
        const tasks = await Promise.all(
            taskIds.map(id => kv.get(`task:${id}`, 'json') as Promise<Task | null>)
        )

        // Count by priority category (only non-completed tasks)
        let urgentImportant = 0
        let important = 0
        let urgent = 0
        let low = 0

        tasks.forEach(task => {
            if (task && task.status !== 'completed') {
                const isUrgent = task.priority === 'urgent'
                const isImportant = task.priority === 'high'
                const isMedium = task.priority === 'medium'

                if (isUrgent && isImportant) {
                    urgentImportant++
                } else if (isImportant) {
                    important++
                } else if (isUrgent) {
                    urgent++
                } else if (isMedium || task.priority === 'low') {
                    low++
                }
            }
        })

        const result = [
            { label: 'Urgent + Important', count: urgentImportant, filterParam: 'urgent-important' },
            { label: 'Important', count: important, filterParam: 'important' },
            { label: 'Urgent', count: urgent, filterParam: 'urgent' },
            { label: 'Low Priority', count: low, filterParam: 'low' }
        ]

        return c.json({ data: result })
    } catch (err) {
        console.error('Failed to fetch task priority breakdown:', err)
        return c.json({ error: 'Failed to fetch task priority breakdown' }, 500)
    }
})

// GET /api/dashboard/recent-activity?limit=15
dashboard.get('/recent-activity', async (c) => {
    const hospitable = new HospitableService(c.env)
    const turno = new TurnoService(c.env)
    const kv = c.env.TASKS
    const limit = parseInt(c.req.query('limit') || '15')

    // Fetch properties for name lookup
    const properties = await hospitable.getProperties()
    const propertyMap = new Map(properties.map(p => [p.id, p]))
    const propertyIds = properties.map(p => p.id)

    console.log(`[Activity Feed] Loaded ${properties.length} properties into map`)

    // Fetch recent data in parallel
    const [allReservations, cleaningJobs, taskIds] = await Promise.all([
        // Fetch reservations from all properties
        (async () => {
            const batchSize = 10
            const results = []
            for (let i = 0; i < propertyIds.length; i += batchSize) {
                const batch = propertyIds.slice(i, i + batchSize)
                const batchPromises = batch.map(propertyId =>
                    hospitable.getReservations({ property_id: propertyId })
                        .then(reservations =>
                            // Ensure property_id is set on each reservation
                            reservations.map(r => ({ ...r, property_id: r.property_id || propertyId }))
                        )
                        .catch(() => [])
                )
                const batchResults = await Promise.all(batchPromises)
                results.push(...batchResults.flat())
            }
            return results
        })(),
        turno.getCleaningJobs().catch(() => []),
        kv.get('tasks:index', 'json') as Promise<string[] | null>
    ])

    // Build activity stream
    const activities: Array<{
        type: 'booking' | 'check-in' | 'check-out' | 'cleaning' | 'maintenance'
        property: string
        description: string
        timestamp: string
        sortKey: number
    }> = []

    const now = Date.now()

    // Add reservation events
    allReservations.forEach((reservation, index) => {
        if (reservation.status !== 'cancelled') {
            const property = propertyMap.get(reservation.property_id)
            const propertyName = property?.name || 'Unknown Property'

            if (index < 3) {
                console.log(`[Activity Feed] Reservation ${index}: property_id="${reservation.property_id}", found=${!!property}, name="${propertyName}"`)
            }
            const checkInTime = new Date(reservation.check_in_date).getTime()
            const checkOutTime = new Date(reservation.check_out_date).getTime()
            const createdTime = new Date(reservation.check_in_date).getTime() - (7 * 24 * 60 * 60 * 1000) // Assume booking 7 days before check-in

            // Booking event
            activities.push({
                type: 'booking',
                property: propertyName,
                description: `New booking from ${reservation.guest_name}`,
                timestamp: new Date(createdTime).toISOString(),
                sortKey: createdTime
            })

            // Check-in event
            if (checkInTime <= now) {
                activities.push({
                    type: 'check-in',
                    property: propertyName,
                    description: `Guest ${reservation.guest_name} checked in`,
                    timestamp: reservation.check_in_date,
                    sortKey: checkInTime
                })
            }

            // Check-out event
            if (checkOutTime <= now) {
                activities.push({
                    type: 'check-out',
                    property: propertyName,
                    description: `Guest ${reservation.guest_name} checked out`,
                    timestamp: reservation.check_out_date,
                    sortKey: checkOutTime
                })
            }
        }
    })

    // Add cleaning events
    cleaningJobs.forEach(job => {
        const property = propertyMap.get(job.property_id)
        const propertyName = property?.name || 'Unknown Property'
        const timestamp = job.completed_at || job.started_at || job.scheduled_date

        activities.push({
            type: 'cleaning',
            property: propertyName,
            description: job.status === 'completed'
                ? `Cleaning completed by ${job.cleaner_name || 'cleaner'}`
                : `Cleaning ${job.status} for ${job.cleaner_name || 'cleaner'}`,
            timestamp,
            sortKey: new Date(timestamp).getTime()
        })
    })

    // Add task events (recent high-priority tasks)
    if (taskIds) {
        for (const id of taskIds.slice(0, 20)) { // Only check recent 20 tasks
            const task = await kv.get(`task:${id}`, 'json') as Task | null
            if (task && (task.priority === 'high' || task.priority === 'urgent')) {
                const property = task.property_id ? propertyMap.get(task.property_id) : null
                const propertyName = property?.name || 'General'

                activities.push({
                    type: 'maintenance',
                    property: propertyName,
                    description: task.title,
                    timestamp: task.created_at,
                    sortKey: new Date(task.created_at).getTime()
                })
            }
        }
    }

    // Sort by timestamp descending and format
    const result = activities
        .sort((a, b) => b.sortKey - a.sortKey)
        .slice(0, limit)
        .map(activity => {
            const date = new Date(activity.timestamp)
            const diff = now - activity.sortKey
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const days = Math.floor(hours / 24)

            let timeAgo: string
            if (days > 2) {
                timeAgo = `${days} days ago`
            } else if (days === 2) {
                timeAgo = '2 days ago'
            } else if (days === 1) {
                timeAgo = 'Yesterday'
            } else if (hours > 0) {
                timeAgo = `${hours}h ago`
            } else {
                timeAgo = 'Just now'
            }

            return {
                type: activity.type,
                property: activity.property,
                description: activity.description,
                timestamp: timeAgo
            }
        })

    return c.json({ data: result })
})

export default dashboard
