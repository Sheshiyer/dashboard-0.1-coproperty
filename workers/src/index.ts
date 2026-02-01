import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/auth'
import properties from './routes/properties'
import reservations from './routes/reservations'
import cleaning from './routes/cleaning'
import tasks from './routes/tasks'
import dashboard from './routes/dashboard'
import photos from './routes/photos'
import { handleWebVitals } from './routes/analytics'

export type Bindings = {
    CACHE: KVNamespace
    TASKS: KVNamespace
    PHOTOS: R2Bucket
    HOSPITABLE_API_TOKEN: string
    TURNO_API_KEY: string
    API_KEY: string
    HOSPITABLE_BASE_URL: string
    TURNO_BASE_URL: string
    R2_PUBLIC_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS for frontend
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check (no auth required)
app.get('/api/health', (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'co-property-api',
    })
})

// Web Vitals ingestion (no auth - receives sendBeacon from browsers)
app.post('/api/analytics/vitals', handleWebVitals)

// Auth check endpoint
app.get('/api/auth/verify', authMiddleware, (c) => {
    return c.json({ authenticated: true })
})

// Protected API routes
app.use('/api/*', authMiddleware)
app.route('/api/properties', properties)
app.route('/api/reservations', reservations)
app.route('/api/cleaning', cleaning)
app.route('/api/tasks', tasks)
app.route('/api/dashboard', dashboard)
app.route('/api/photos', photos)

// 404 handler
app.notFound((c) => {
    return c.json({ error: 'Not Found' }, 404)
})

// Error handler
app.onError((err, c) => {
    console.error('API Error:', err)
    return c.json({ error: 'Internal Server Error' }, 500)
})

export default app
