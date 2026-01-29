import { Hono } from 'hono'
import type { Bindings } from '../index'
import { TurnoService, type CleaningJob } from '../services/turno'

const cleaning = new Hono<{ Bindings: Bindings }>()

// GET /api/cleaning - List cleaning jobs with optional filters
cleaning.get('/', async (c) => {
    const service = new TurnoService(c.env)
    const date = c.req.query('date')
    const propertyId = c.req.query('property_id')
    const status = c.req.query('status')

    try {
        const data = await service.getCleaningJobs({
            date: date || undefined,
            property_id: propertyId || undefined,
            status: status || undefined,
        })
        return c.json({ data, count: data.length })
    } catch (err) {
        console.error('Failed to fetch cleaning jobs:', err)
        return c.json({ error: 'Failed to fetch cleaning jobs' }, 500)
    }
})

// GET /api/cleaning/:id - Get single cleaning job
cleaning.get('/:id', async (c) => {
    const id = c.req.param('id')
    const service = new TurnoService(c.env)

    try {
        const data = await service.getCleaningJob(id)
        if (!data) {
            return c.json({ error: 'Cleaning job not found' }, 404)
        }
        return c.json({ data })
    } catch (err) {
        console.error('Failed to fetch cleaning job:', err)
        return c.json({ error: 'Failed to fetch cleaning job' }, 500)
    }
})

// PATCH /api/cleaning/:id/status - Update cleaning job status
cleaning.patch('/:id/status', async (c) => {
    const id = c.req.param('id')
    const service = new TurnoService(c.env)

    try {
        const body = await c.req.json<{ status: CleaningJob['status'] }>()

        if (!body.status) {
            return c.json({ error: 'Status is required' }, 400)
        }

        const validStatuses = ['pending', 'in_progress', 'completed', 'verified']
        if (!validStatuses.includes(body.status)) {
            return c.json({ error: 'Invalid status' }, 400)
        }

        const data = await service.updateJobStatus(id, body.status)
        if (!data) {
            return c.json({ error: 'Failed to update cleaning job' }, 500)
        }

        return c.json({ data })
    } catch (err) {
        console.error('Failed to update cleaning job:', err)
        return c.json({ error: 'Failed to update cleaning job' }, 500)
    }
})

export default cleaning
