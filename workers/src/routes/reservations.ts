import { Hono } from 'hono'
import type { Bindings } from '../index'
import { HospitableService } from '../services/hospitable'

const reservations = new Hono<{ Bindings: Bindings }>()

// GET /api/reservations - List reservations with optional filters
reservations.get('/', async (c) => {
    const service = new HospitableService(c.env)
    const from = c.req.query('from')
    const to = c.req.query('to')
    const propertyId = c.req.query('property_id')

    try {
        // If specific property requested, fetch directly
        if (propertyId) {
            const data = await service.getReservations({
                from: from || undefined,
                to: to || undefined,
                property_id: propertyId,
            })
            return c.json({ data, count: data.length })
        }

        // Otherwise, fetch all properties first, then get reservations for each
        const properties = await service.getProperties()
        const propertyIds = properties.map(p => p.id)

        // Fetch reservations for all properties in parallel (in batches to avoid rate limits)
        const batchSize = 10
        const allReservations = []

        for (let i = 0; i < propertyIds.length; i += batchSize) {
            const batch = propertyIds.slice(i, i + batchSize)
            const batchPromises = batch.map(id =>
                service.getReservations({
                    from: from || undefined,
                    to: to || undefined,
                    property_id: id,
                }).then(reservations =>
                    // Add property_id to each reservation since API doesn't return it
                    reservations.map(r => ({ ...r, property_id: id }))
                ).catch(err => {
                    console.warn(`Failed to fetch reservations for property ${id}:`, err)
                    return [] // Return empty array on error, don't fail entire request
                })
            )
            const batchResults = await Promise.all(batchPromises)
            allReservations.push(...batchResults.flat())
        }

        return c.json({ data: allReservations, count: allReservations.length })
    } catch (err) {
        console.error('Failed to fetch reservations:', err)
        return c.json({ error: 'Failed to fetch reservations' }, 500)
    }
})

// GET /api/reservations/:id - Get single reservation
reservations.get('/:id', async (c) => {
    const id = c.req.param('id')
    const service = new HospitableService(c.env)

    try {
        const data = await service.getReservation(id)
        if (!data) {
            return c.json({ error: 'Reservation not found' }, 404)
        }
        return c.json({ data })
    } catch (err) {
        console.error('Failed to fetch reservation:', err)
        return c.json({ error: 'Failed to fetch reservation' }, 500)
    }
})

export default reservations
