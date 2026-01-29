import { Hono } from 'hono'
import type { Bindings } from '../index'
import { HospitableService } from '../services/hospitable'

const properties = new Hono<{ Bindings: Bindings }>()

// GET /api/properties - List all properties
properties.get('/', async (c) => {
    const service = new HospitableService(c.env)

    try {
        const data = await service.getProperties()
        return c.json({ data, count: data.length })
    } catch (err) {
        console.error('Failed to fetch properties:', err)
        return c.json({ error: 'Failed to fetch properties' }, 500)
    }
})

// GET /api/properties/:id - Get single property
properties.get('/:id', async (c) => {
    const id = c.req.param('id')
    const service = new HospitableService(c.env)

    try {
        const data = await service.getProperty(id)
        if (!data) {
            return c.json({ error: 'Property not found' }, 404)
        }
        return c.json({ data })
    } catch (err) {
        console.error('Failed to fetch property:', err)
        return c.json({ error: 'Failed to fetch property' }, 500)
    }
})

export default properties
