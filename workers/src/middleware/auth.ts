import type { Context, Next } from 'hono'
import type { Bindings } from '../index'

/**
 * API Key authentication middleware
 * Validates the Authorization header against the API_KEY secret
 */
export const authMiddleware = async (
    c: Context<{ Bindings: Bindings }>,
    next: Next
) => {
    // Skip auth for health check
    if (c.req.path === '/api/health') {
        return next()
    }

    const authHeader = c.req.header('Authorization')

    if (!authHeader) {
        return c.json({ error: 'Missing Authorization header' }, 401)
    }

    const apiKey = authHeader.replace('Bearer ', '')

    if (!apiKey || apiKey !== c.env.API_KEY) {
        return c.json({ error: 'Invalid API key' }, 401)
    }

    await next()
}
